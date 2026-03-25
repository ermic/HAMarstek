#!/usr/bin/env node
/**
 * Marstek V3 UDP JSON client (Node.js port)
 *
 * Communicates with a Marstek V3 battery over UDP port 30000 using JSON payloads.
 *
 * Helper subcommands:
 *   - get-device
 *   - wifi-status  (alias: wi-status)
 *   - ble-status
 *   - bat-status
 *   - pv-status
 *   - es-status
 *   - es-mode
 *   - all-status   (runs all API calls in sequence)
 *   - send         (send an arbitrary JSON payload)
 *   - status       (send a placeholder key/value request)
 *
 * Defaults:
 *   Target : 192.168.2.151:30000
 *   Bind   : 0.0.0.0:30000 (so replies arrive correctly)
 */

"use strict";

const dgram = require("dgram");
const fs = require("fs");
const path = require("path");

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const DEFAULT_IP = "192.168.2.101";
const DEFAULT_PORT = 30000;

// ──────────────────────────────────────────────
// Logging helpers
// ──────────────────────────────────────────────
let verbosity = 0; // 0=warn, 1=info, 2=debug

function logDebug(...args) {
  if (verbosity >= 2) console.error("DEBUG:", ...args);
}
function logInfo(...args) {
  if (verbosity >= 1) console.error("INFO:", ...args);
}
function logError(...args) {
  console.error("ERROR:", ...args);
}

// ──────────────────────────────────────────────
// Hexdump
// ──────────────────────────────────────────────
function hexdump(buf) {
  const lines = [];
  for (let i = 0; i < buf.length; i += 16) {
    const chunk = buf.slice(i, i + 16);
    const hex = [...chunk]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ")
      .padEnd(16 * 3);
    const ascii = [...chunk]
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");
    lines.push(`${i.toString(16).padStart(8, "0")}  ${hex} |${ascii}|`);
  }
  return lines.join("\n");
}

// ──────────────────────────────────────────────
// Core UDP send-and-receive
// ──────────────────────────────────────────────
/**
 * Send a JSON payload over UDP and collect reply packets.
 *
 * @param {string}  ip
 * @param {number}  port
 * @param {object}  payload
 * @param {object}  [opts]
 * @param {number}  [opts.timeout=1500]       - ms per attempt
 * @param {number}  [opts.retries=2]
 * @param {boolean} [opts.expectReply=true]
 * @param {number}  [opts.maxPackets=16]
 * @param {string}  [opts.bindHost="0.0.0.0"]
 * @param {number}  [opts.bindPort=30000]
 * @param {boolean} [opts.pretty=true]
 * @param {boolean} [opts.raw=false]
 * @returns {Promise<Buffer[]>}
 */
function sendAndReceive(ip, port, payload, opts = {}) {
  const {
    timeout = 1500,
    retries = 2,
    expectReply = true,
    maxPackets = 16,
    bindHost = "0.0.0.0",
    bindPort = DEFAULT_PORT,
    pretty = true,
    raw = false,
  } = opts;

  return new Promise((resolve, reject) => {
    const data = Buffer.from(
      JSON.stringify(payload, null, 0).replace(/,/g, ",").replace(/:/g, ":"),
      "utf-8"
    );
    // Compact JSON (no spaces)
    const compact = Buffer.from(
      JSON.stringify(payload, (_, v) => v, 0),
      "utf-8"
    );

    const responses = [];
    let attempt = 0;

    function tryAttempt() {
      if (attempt > retries) {
        printResponses(responses, pretty, raw);
        return resolve(responses);
      }

      const sock = dgram.createSocket("udp4");
      let settled = false;
      let packetCount = 0;
      let timer = null;

      function finish() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        sock.close();

        if (responses.length > 0 || !expectReply) {
          printResponses(responses, pretty, raw);
          resolve(responses);
        } else {
          logDebug("No reply, retrying...");
          attempt++;
          tryAttempt();
        }
      }

      sock.on("error", (err) => {
        logError("Socket error:", err.message);
        finish();
      });

      sock.on("message", (msg, rinfo) => {
        if (settled) return;
        logDebug(`Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`);
        responses.push(msg);
        packetCount++;
        if (packetCount >= maxPackets) {
          logDebug(`Reached maxPackets=${maxPackets}, stopping receive loop`);
          finish();
        }
      });

      sock.bind(bindPort, bindHost, () => {
        sock.send(compact, port, ip, (err) => {
          if (err) {
            logError("Failed to send:", err.message);
            sock.close();
            if (attempt >= retries) return reject(err);
            attempt++;
            return tryAttempt();
          }

          if (!expectReply) {
            sock.close();
            return resolve([]);
          }

          timer = setTimeout(finish, timeout);
        });
      });
    }

    tryAttempt();
  });
}

// ──────────────────────────────────────────────
// Output helpers
// ──────────────────────────────────────────────
function printResponses(responses, pretty, raw) {
  for (const pkt of responses) {
    if (raw) {
      console.log(hexdump(pkt));
    } else {
      try {
        const obj = JSON.parse(pkt.toString("utf-8"));
        if (pretty) {
          console.log(JSON.stringify(obj, null, 2));
        } else {
          console.log(JSON.stringify(obj));
        }
      } catch {
        console.log(hexdump(pkt));
        console.log("\n(Text)\n" + pkt.toString("utf-8", 0, pkt.length));
      }
    }
  }
}

// ──────────────────────────────────────────────
// Argument parser (manual, no deps)
// ──────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2); // drop 'node' and script name

  const opts = {
    ip: DEFAULT_IP,
    port: DEFAULT_PORT,
    timeout: 1.5,
    retries: 2,
    bind: null,
    noPretty: false,
    raw: false,
    verbose: 0,
    cmd: null,
    // subcommand-specific
    json: null,
    file: null,
    stdin: false,
    noReply: false,
    maxPackets: 16,
    key: "cmd",
    value: "read_status",
    bleMac: "0",
    id: 0,
  };

  let i = 0;
  function next(flag) {
    if (i >= args.length) die(`Missing value for ${flag}`);
    return args[i++];
  }

  while (i < args.length) {
    const a = args[i++];
    switch (a) {
      case "--ip":           opts.ip = next("--ip"); break;
      case "--port":         opts.port = parseInt(next("--port"), 10); break;
      case "--timeout":      opts.timeout = parseFloat(next("--timeout")); break;
      case "--retries":      opts.retries = parseInt(next("--retries"), 10); break;
      case "--bind":         opts.bind = next("--bind"); break;
      case "--no-pretty":    opts.noPretty = true; break;
      case "--raw":          opts.raw = true; break;
      case "-v":
      case "--verbose":      opts.verbose++; break;
      case "-vv":            opts.verbose += 2; break;
      // subcommands
      case "send":
      case "status":
      case "get-device":
      case "wifi-status":
      case "wi-status":
      case "ble-status":
      case "bat-status":
      case "pv-status":
      case "es-status":
      case "es-mode":
      case "all-status":
        opts.cmd = a;
        break;
      // subcommand-level flags (parsed after cmd is set)
      case "--json":         opts.json = next("--json"); break;
      case "--file":         opts.file = next("--file"); break;
      case "--stdin":        opts.stdin = true; break;
      case "--no-reply":     opts.noReply = true; break;
      case "--max-packets":  opts.maxPackets = parseInt(next("--max-packets"), 10); break;
      case "--key":          opts.key = next("--key"); break;
      case "--value":        opts.value = next("--value"); break;
      case "--ble-mac":      opts.bleMac = next("--ble-mac"); break;
      case "--id":           opts.id = parseInt(next("--id"), 10); break;
      case "-h":
      case "--help":         printHelp(); process.exit(0); break;
      default:
        die(`Unknown argument: ${a}`);
    }
  }

  if (!opts.cmd) die("A subcommand is required. Use --help for usage.");
  return opts;
}

function die(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function printHelp() {
  console.log(`
Usage: node marstek-v3.js [options] <subcommand> [subcommand-options]

Options:
  --ip <addr>          Target IP (default: ${DEFAULT_IP})
  --port <n>           Target UDP port (default: ${DEFAULT_PORT})
  --timeout <secs>     Receive timeout per attempt (default: 1.5)
  --retries <n>        Retries on no reply (default: 2)
  --bind <ip:port>     Local bind address (e.g. 0.0.0.0:30000)
  --no-pretty          Do not pretty-print JSON replies
  --raw                Print raw hex dump instead of JSON
  -v, --verbose        Increase verbosity (-v info, -vv debug)

Subcommands:
  send          --json <str> | --file <path> | --stdin   [--no-reply] [--max-packets <n>]
  status        [--key <k>] [--value <v>]
  get-device    [--ble-mac <mac>]
  wifi-status   [--id <n>]        (alias: wi-status)
  ble-status    [--id <n>]
  bat-status    [--id <n>]
  pv-status     [--id <n>]
  es-status     [--id <n>]
  es-mode       [--id <n>]
  all-status
`.trim());
}

// ──────────────────────────────────────────────
// Load payload for 'send' subcommand
// ──────────────────────────────────────────────
async function loadPayload(opts) {
  const sources = [opts.json !== null, opts.file !== null, opts.stdin];
  const count = sources.filter(Boolean).length;
  if (count !== 1) die("Provide exactly one of --json, --file, or --stdin");

  if (opts.json !== null) return JSON.parse(opts.json);
  if (opts.file !== null) {
    const text = fs.readFileSync(path.resolve(opts.file), "utf-8");
    return JSON.parse(text);
  }
  // stdin
  return new Promise((resolve, reject) => {
    let buf = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (buf += chunk));
    process.stdin.on("end", () => {
      try { resolve(JSON.parse(buf)); } catch (e) { reject(e); }
    });
    process.stdin.on("error", reject);
  });
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  const opts = parseArgs(process.argv);
  verbosity = opts.verbose;

  const udpOpts = {
    timeout: Math.round(opts.timeout * 1000),
    retries: opts.retries,
    pretty: !opts.noPretty,
    raw: opts.raw,
  };

  if (opts.bind) {
    const lastColon = opts.bind.lastIndexOf(":");
    udpOpts.bindHost = opts.bind.slice(0, lastColon);
    udpOpts.bindPort = parseInt(opts.bind.slice(lastColon + 1), 10);
  }

  async function send(payload, extraOpts = {}) {
    await sendAndReceive(opts.ip, opts.port, payload, { ...udpOpts, ...extraOpts });
  }

  switch (opts.cmd) {
    case "send": {
      const payload = await loadPayload(opts);
      await send(payload, { expectReply: !opts.noReply, maxPackets: opts.maxPackets });
      break;
    }

    case "status": {
      await send({ [opts.key]: opts.value });
      break;
    }

    case "get-device": {
      await send({ id: 0, method: "Marstek.GetDevice", params: { ble_mac: opts.bleMac } });
      break;
    }

    case "wifi-status":
    case "wi-status": {
      await send({ id: 1, method: "Wifi.GetStatus", params: { id: opts.id } });
      break;
    }

    case "ble-status": {
      await send({ id: 1, method: "BLE.GetStatus", params: { id: opts.id } });
      break;
    }

    case "bat-status": {
      await send({ id: 1, method: "Bat.GetStatus", params: { id: opts.id } });
      break;
    }

    case "pv-status": {
      await send({ id: 1, method: "PV.GetStatus", params: { id: opts.id } });
      break;
    }

    case "es-status": {
      await send({ id: 1, method: "ES.GetStatus", params: { id: opts.id } });
      break;
    }

    case "es-mode": {
      await send({ id: 1, method: "ES.GetMode", params: { id: opts.id } });
      break;
    }

    case "all-status": {
      const calls = [
        { id: 0, method: "Marstek.GetDevice", params: { ble_mac: "0" } },
        { id: 1, method: "Wifi.GetStatus",    params: { id: 0 } },
        { id: 1, method: "BLE.GetStatus",     params: { id: 0 } },
        { id: 1, method: "Bat.GetStatus",     params: { id: 0 } },
        { id: 1, method: "PV.GetStatus",      params: { id: 0 } },
        { id: 1, method: "ES.GetStatus",      params: { id: 0 } },
        { id: 1, method: "ES.GetMode",        params: { id: 0 } },
      ];
      for (const payload of calls) {
        await send(payload);
      }
      break;
    }

    default:
      die(`Unknown command: ${opts.cmd}`);
  }
}

main().catch((err) => {
  logError(err.message || err);
  process.exit(1);
});