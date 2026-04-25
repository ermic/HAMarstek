# Smart Marstek Charge/Discharge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Twee Home Assistant automations bouwen die op basis van de Zonneplan-tariefforecast één laad-startschot en één ontlaad-startschot per dag geven aan twee Marstek VenusE batterijen, met een SoC-throttle voor batterij 2 onder 50%.

**Architecture:** Eén YAML met `time_pattern` trigger op HH:00 die het laad/ontlaad-uur voor vandaag berekent en bij match het startschot vuurt. Eén tweede YAML met `numeric_state` trigger die batterij 2 throttlet zodra SoC < 50% tijdens een lopende discharge. Logica in Jinja-templates, geen externe scripting.

**Tech Stack:** Home Assistant YAML automations, Jinja2 templates, Zonneplan-integratie (`sensor.zonneplan_current_electricity_tariff`), Marstek Modbus-integratie (`select.marstek_venus_modbus_force_mode`/`_2`, `number.marstek_venus_modbus_set_charge_power`/`_2`, `set_discharge_power`/`_2`, `switch.marstek_venus_modbus_rs485_control_mode`).

**Reference:** [docs/superpowers/specs/2026-04-26-smart-marstek-charge-discharge-design.md](../specs/2026-04-26-smart-marstek-charge-discharge-design.md)

---

## Task 1: Charge-uur template ontwikkelen en valideren

**Files:**
- Test: HA Developer Tools → Templates (handmatig)

Het charge-uur algoritme is het meest complex (negatieve blokken, lengte-grens, fallback). We bouwen het eerst los op zodat we het in HA Dev Tools kunnen verifiëren met de echte forecast.

- [ ] **Step 1: Plak deze template in HA Developer Tools → Templates en run hem**

```jinja
{% set timezone_offset = 2 %}
{% set today_local = (as_timestamp(utcnow()) + timezone_offset * 3600) | timestamp_custom('%Y-%m-%d') %}

{# Stap 1: forecast voor vandaag, alleen 00:00-17:00 lokale tijd #}
{% set forecast = state_attr('sensor.zonneplan_current_electricity_tariff', 'forecast') or [] %}
{% set ns = namespace(hours=[]) %}
{% for f in forecast %}
  {% set ts = as_timestamp(strptime(f.datetime, '%Y-%m-%dT%H:%M:%S.%fZ')) + timezone_offset * 3600 %}
  {% set d = ts | timestamp_custom('%Y-%m-%d') %}
  {% set h = ts | timestamp_custom('%H') | int %}
  {% if d == today_local and h < 17 %}
    {% set ns.hours = ns.hours + [{
      'hour': h,
      'price': f.electricity_price | float(0) / 10000000
    }] %}
  {% endif %}
{% endfor %}

{# Stap 2: vind aaneengesloten negatieve blokken #}
{% set bns = namespace(blocks=[], current=[]) %}
{% for h in ns.hours | sort(attribute='hour') %}
  {% if h.price < 0 %}
    {% set bns.current = bns.current + [h] %}
  {% else %}
    {% if bns.current | length > 0 %}
      {% set bns.blocks = bns.blocks + [bns.current] %}
      {% set bns.current = [] %}
    {% endif %}
  {% endif %}
{% endfor %}
{% if bns.current | length > 0 %}
  {% set bns.blocks = bns.blocks + [bns.current] %}
{% endif %}

{# Stap 3: kies charge_hour #}
{% set rns = namespace(charge_hour=none) %}
{% if bns.blocks | length > 0 %}
  {# Langste blok, bij gelijke lengte vroegste #}
  {% set longest = bns.blocks | sort(attribute='0.hour') | sort(attribute='__len__', reverse=true) | first %}
  {% if longest | length <= 5 %}
    {% set rns.charge_hour = longest[0].hour %}
  {% else %}
    {% set rns.charge_hour = (longest | sort(attribute='price') | first).hour %}
  {% endif %}
{% else %}
  {% if ns.hours | length > 0 %}
    {% set rns.charge_hour = (ns.hours | sort(attribute='price') | first).hour %}
  {% endif %}
{% endif %}

charge_hour: {{ rns.charge_hour }}
hours_in_window: {{ ns.hours | length }}
negative_blocks: {{ bns.blocks | map('length') | list }}
```

Run: HA Developer Tools → Templates → plak code → "Render Now"

Expected: `charge_hour` is een geheel getal tussen 0 en 16, of `None` als forecast leeg/onbeschikbaar. `hours_in_window` is doorgaans 17 (00..16). Inspecteer of de uitkomst klopt met de echte tarieven van vandaag.

- [ ] **Step 2: Edge-case sanity check**

Open de template render en controleer:
- Met 0 negatieve uren → `charge_hour` is uur met laagste prijs (kun je verifiëren tegen `panel_forecast.yaml`)
- `hours_in_window` ≥ 1 (zo niet: forecast probleem, niet code probleem)

Als de uitkomst niet logisch is: post de output hier en pas de template aan voor we Task 2 doen.

- [ ] **Step 3: Geen commit nodig**

Dit is een verificatiestap, geen bestandswijziging.

---

## Task 2: Discharge-uur template ontwikkelen en valideren

**Files:**
- Test: HA Developer Tools → Templates (handmatig)

Veel simpeler dan charge — alleen het duurste uur tussen 17:00 en 22:59.

- [ ] **Step 1: Plak deze template in HA Dev Tools en run**

```jinja
{% set timezone_offset = 2 %}
{% set today_local = (as_timestamp(utcnow()) + timezone_offset * 3600) | timestamp_custom('%Y-%m-%d') %}

{% set forecast = state_attr('sensor.zonneplan_current_electricity_tariff', 'forecast') or [] %}
{% set ns = namespace(hours=[]) %}
{% for f in forecast %}
  {% set ts = as_timestamp(strptime(f.datetime, '%Y-%m-%dT%H:%M:%S.%fZ')) + timezone_offset * 3600 %}
  {% set d = ts | timestamp_custom('%Y-%m-%d') %}
  {% set h = ts | timestamp_custom('%H') | int %}
  {% if d == today_local and h >= 17 and h < 23 %}
    {% set ns.hours = ns.hours + [{
      'hour': h,
      'price': f.electricity_price | float(0) / 10000000
    }] %}
  {% endif %}
{% endfor %}

{% set rns = namespace(discharge_hour=none) %}
{% if ns.hours | length > 0 %}
  {% set rns.discharge_hour = (ns.hours | sort(attribute='price', reverse=true) | first).hour %}
{% endif %}

discharge_hour: {{ rns.discharge_hour }}
hours_in_window: {{ ns.hours | length }}
```

Expected: `discharge_hour` is geheel getal tussen 17 en 22, `hours_in_window` is meestal 6.

- [ ] **Step 2: Verifieer tegen panel_forecast.yaml**

Open je dashboard en kijk welk uur in 17:00-22:59 de hoogste `electricity_price` heeft. Moet exact matchen met `discharge_hour`.

- [ ] **Step 3: Geen commit nodig**

---

## Task 3: Maak `automation_charge_discharge_kickoff.yaml` aan

**Files:**
- Create: `/Users/erik/Documents/HAMarstek/automation_charge_discharge_kickoff.yaml`

We combineren beide templates in één automation met een trigger per uur en een `choose` block dat per actie matcht.

- [ ] **Step 1: Schrijf het bestand**

```yaml
alias: Marstek charge/discharge daily kickoff
description: >
  Geeft één laad-startschot en één ontlaad-startschot per dag, op basis
  van de goedkoopste/duurste uren in de Zonneplan-forecast voor vandaag.
  Laden in venster 00:00-17:00, ontladen in 17:00-23:00.
mode: single
trigger:
  - platform: time_pattern
    hours: "/1"
    minutes: 0
condition: []
variables:
  timezone_offset: 2
  charge_hour: >
    {% set today_local = (as_timestamp(utcnow()) + timezone_offset * 3600) | timestamp_custom('%Y-%m-%d') %}
    {% set forecast = state_attr('sensor.zonneplan_current_electricity_tariff', 'forecast') or [] %}
    {% set ns = namespace(hours=[]) %}
    {% for f in forecast %}
      {% set ts = as_timestamp(strptime(f.datetime, '%Y-%m-%dT%H:%M:%S.%fZ')) + timezone_offset * 3600 %}
      {% set d = ts | timestamp_custom('%Y-%m-%d') %}
      {% set h = ts | timestamp_custom('%H') | int %}
      {% if d == today_local and h < 17 %}
        {% set ns.hours = ns.hours + [{'hour': h, 'price': f.electricity_price | float(0) / 10000000}] %}
      {% endif %}
    {% endfor %}
    {% set bns = namespace(blocks=[], current=[]) %}
    {% for h in ns.hours | sort(attribute='hour') %}
      {% if h.price < 0 %}
        {% set bns.current = bns.current + [h] %}
      {% else %}
        {% if bns.current | length > 0 %}
          {% set bns.blocks = bns.blocks + [bns.current] %}
          {% set bns.current = [] %}
        {% endif %}
      {% endif %}
    {% endfor %}
    {% if bns.current | length > 0 %}
      {% set bns.blocks = bns.blocks + [bns.current] %}
    {% endif %}
    {% set rns = namespace(charge_hour=none) %}
    {% if bns.blocks | length > 0 %}
      {% set longest = bns.blocks | sort(attribute='0.hour') | sort(attribute='__len__', reverse=true) | first %}
      {% if longest | length <= 5 %}
        {% set rns.charge_hour = longest[0].hour %}
      {% else %}
        {% set rns.charge_hour = (longest | sort(attribute='price') | first).hour %}
      {% endif %}
    {% else %}
      {% if ns.hours | length > 0 %}
        {% set rns.charge_hour = (ns.hours | sort(attribute='price') | first).hour %}
      {% endif %}
    {% endif %}
    {{ rns.charge_hour }}
  discharge_hour: >
    {% set today_local = (as_timestamp(utcnow()) + timezone_offset * 3600) | timestamp_custom('%Y-%m-%d') %}
    {% set forecast = state_attr('sensor.zonneplan_current_electricity_tariff', 'forecast') or [] %}
    {% set ns = namespace(hours=[]) %}
    {% for f in forecast %}
      {% set ts = as_timestamp(strptime(f.datetime, '%Y-%m-%dT%H:%M:%S.%fZ')) + timezone_offset * 3600 %}
      {% set d = ts | timestamp_custom('%Y-%m-%d') %}
      {% set h = ts | timestamp_custom('%H') | int %}
      {% if d == today_local and h >= 17 and h < 23 %}
        {% set ns.hours = ns.hours + [{'hour': h, 'price': f.electricity_price | float(0) / 10000000}] %}
      {% endif %}
    {% endfor %}
    {% if ns.hours | length > 0 %}
      {{ (ns.hours | sort(attribute='price', reverse=true) | first).hour }}
    {% else %}
      {{ none }}
    {% endif %}
  current_hour: "{{ now().hour }}"
action:
  - choose:
      - alias: Laad-startschot
        conditions:
          - "{{ charge_hour | int(-1) == current_hour | int }}"
        sequence:
          - service: switch.turn_on
            target:
              entity_id: switch.marstek_venus_modbus_rs485_control_mode
          - service: select.select_option
            target:
              entity_id:
                - select.marstek_venus_modbus_force_mode
                - select.marstek_venus_modbus_force_mode_2
            data:
              option: charge
          - delay: "00:00:05"
          - service: number.set_value
            target:
              entity_id: number.marstek_venus_modbus_set_charge_power
            data:
              value: 1250
          - service: number.set_value
            target:
              entity_id: number.marstek_venus_modbus_set_charge_power_2
            data:
              value: 1250
          - service: logbook.log
            data:
              name: Marstek
              message: "Laad-startschot gevuurd op uur {{ current_hour }}"
      - alias: Ontlaad-startschot
        conditions:
          - "{{ discharge_hour | int(-1) == current_hour | int }}"
        sequence:
          - service: switch.turn_on
            target:
              entity_id: switch.marstek_venus_modbus_rs485_control_mode
          - service: select.select_option
            target:
              entity_id:
                - select.marstek_venus_modbus_force_mode
                - select.marstek_venus_modbus_force_mode_2
            data:
              option: discharge
          - delay: "00:00:05"
          - service: number.set_value
            target:
              entity_id: number.marstek_venus_modbus_set_discharge_power
            data:
              value: 2500
          - service: number.set_value
            target:
              entity_id: number.marstek_venus_modbus_set_discharge_power_2
            data:
              value: >
                {{ 200 if states('sensor.marstek_venus_modbus_2_battery_soc') | float(0) < 50 else 2500 }}
          - service: logbook.log
            data:
              name: Marstek
              message: "Ontlaad-startschot gevuurd op uur {{ current_hour }}"
```

- [ ] **Step 2: YAML-syntax verifiëren**

Run: `python3 -c "import yaml; yaml.safe_load(open('/Users/erik/Documents/HAMarstek/automation_charge_discharge_kickoff.yaml'))"`

Expected: geen output (= valide YAML). Bij fout: parse-error, fix de syntax.

- [ ] **Step 3: Commit**

```bash
git -C /Users/erik/Documents/HAMarstek add automation_charge_discharge_kickoff.yaml
git -C /Users/erik/Documents/HAMarstek commit -m "Voeg charge/discharge daily kickoff automation toe"
```

---

## Task 4: Maak `automation_battery2_discharge_throttle.yaml` aan

**Files:**
- Create: `/Users/erik/Documents/HAMarstek/automation_battery2_discharge_throttle.yaml`

- [ ] **Step 1: Schrijf het bestand**

```yaml
alias: Marstek batterij 2 discharge throttle bij SoC < 50%
description: >
  Throttle batterij 2 ontlaadvermogen naar 200W zodra zijn SoC onder 50%
  zakt tijdens een lopende ontlading. Voorkomt te diep ontladen van
  batterij 2 terwijl batterij 1 op vol vermogen blijft.
mode: single
trigger:
  - platform: numeric_state
    entity_id: sensor.marstek_venus_modbus_2_battery_soc
    below: 50
condition:
  - condition: state
    entity_id: select.marstek_venus_modbus_force_mode_2
    state: discharge
  - condition: numeric_state
    entity_id: number.marstek_venus_modbus_set_discharge_power_2
    above: 200
action:
  - service: number.set_value
    target:
      entity_id: number.marstek_venus_modbus_set_discharge_power_2
    data:
      value: 200
  - service: logbook.log
    data:
      name: Marstek
      message: >
        Batterij 2 throttle: SoC2 onder 50%, discharge_power_2 → 200W
```

- [ ] **Step 2: YAML-syntax verifiëren**

Run: `python3 -c "import yaml; yaml.safe_load(open('/Users/erik/Documents/HAMarstek/automation_battery2_discharge_throttle.yaml'))"`

Expected: geen output.

- [ ] **Step 3: Commit**

```bash
git -C /Users/erik/Documents/HAMarstek add automation_battery2_discharge_throttle.yaml
git -C /Users/erik/Documents/HAMarstek commit -m "Voeg batterij 2 discharge throttle automation toe"
```

---

## Task 5: Update CLAUDE.md

**Files:**
- Modify: `/Users/erik/Documents/HAMarstek/CLAUDE.md`

CLAUDE.md noemt nog de oude (verwijderde) automation_1 t/m 11 en het strategie-overzicht. Aangezien gebruiker die heeft weggegooid en opnieuw begint, moeten we dit opschonen en de twee nieuwe automations toevoegen.

- [ ] **Step 1: Lees CLAUDE.md eerst om actuele inhoud te zien**

Read: `/Users/erik/Documents/HAMarstek/CLAUDE.md`

- [ ] **Step 2: Vervang het hele "Bestandsstructuur" blok**

Edit: vervang de bestaande tabel onder `## Bestandsstructuur` met:

```markdown
## Bestandsstructuur

| Bestand | Omschrijving |
|---|---|
| `automation_charge_discharge_kickoff.yaml` | Eenmalig per uur trigger: vuurt laad-startschot op goedkoopste uur (00-17u) en ontlaad-startschot op duurste uur (17-23u) van vandaag |
| `automation_battery2_discharge_throttle.yaml` | Throttlet `set_discharge_power_2` naar 200W zodra batterij 2 SoC onder 50% zakt tijdens ontlading |
| `automation_12_zonnepanelen_negatief_tarief.yaml` | Schakelt Envoy-productie 15 min voor negatief tarief uit, en 15 min voor positief tarief weer aan |
| `panel_forecast.yaml` | Markdown-template dat per uur het Zonneplan-tarief toont (incl. negatief-markering) |
| `input_helpers.yaml` | input_boolean en input_number helpers |
| `dashboard.yaml` | HA dashboard met Zonneplan tariefgrafiek en batterijstatus |
```

- [ ] **Step 3: Vervang het "Strategie overzicht" blok**

Edit: vervang de bestaande tabel onder `## Strategie overzicht` met:

```markdown
## Strategie overzicht

| Tijdvak | Actie | Logica |
|---|---|---|
| 00:00–17:00 | Laden (1 uur) | Goedkoopste uur in venster, of eerste uur van langste negatieve tariefblok (≤5u) of goedkoopste uur binnen langste negatieve blok (>5u) |
| 17:00–23:00 | Ontladen (1 uur) | Duurste uur in venster |
| Continu | Throttle batterij 2 | `discharge_power_2` → 200W zodra SoC2 < 50% tijdens lopende discharge |
```

- [ ] **Step 4: Vervang "Ontwerpregels" blok**

Edit: vervang het bestaande blok onder `## Ontwerpregels` met:

```markdown
## Ontwerpregels

- **RS485 control mode** moet `on` zijn om force_mode en vermogens in te stellen. Kickoff-automation zet dit zelf aan vóór elk startschot.
- **5 seconden delay** tussen `force_mode` schakelen en `set_*_power` zetten — Marstek verwerpt soms het vermogen als hij nog niet klaar is met de mode-switch.
- **SoC-limieten zijn hardware-managed**: laad/ontlaad-startschot zet alleen het vermogen, batterij stopt zelf bij vol/leeg.
- **Vandaag-only**: alle tariefberekeningen kijken alleen naar forecast-entries waarvan lokale datum == vandaag. Geen multi-dag planning.
- **Gebruik `electricity_price`** (incl. btw) voor alle tariefvergelijkingen.
```

- [ ] **Step 5: Verifieer dat CLAUDE.md valid is**

Read CLAUDE.md opnieuw. Controleer dat de drie tabellen er staan, dat de oude `automation_1` t/m `automation_11` referenties weg zijn, en dat alle markdown-tabel-syntax klopt (pipes en alignment-rijen).

- [ ] **Step 6: Commit**

```bash
git -C /Users/erik/Documents/HAMarstek add CLAUDE.md
git -C /Users/erik/Documents/HAMarstek commit -m "Update CLAUDE.md voor nieuwe charge/discharge architectuur"
```

---

## Task 6: Deployment naar Home Assistant

**Files:** geen lokaal — gebruiker zelf in HA UI

Deze stap is handmatig — de YAML-bestanden moeten in HA's `automations.yaml` of via de "YAML Editor" worden toegevoegd. We beschrijven de stappen.

- [ ] **Step 1: Kopieer YAML-inhoud naar HA**

Voor elk van de twee nieuwe `automation_*.yaml` bestanden:

1. Open HA → Settings → Automations & Scenes → "+ Create Automation" → skip → drie puntjes rechtsboven → "Edit in YAML"
2. Plak de inhoud van het bestand
3. Save met de naam zoals in `alias:` veld

- [ ] **Step 2: Reload automations**

HA → Developer Tools → YAML → "Automations" → "Reload"

Of: Settings → System → Restart → "Reload YAML configuration"

- [ ] **Step 3: Verifieer triggers**

Voor `Marstek charge/discharge daily kickoff`:
- Settings → Automations & Scenes → klik automation
- "Run Actions" knop voor handmatige test (kijk in Logbook of `force_mode`/`charge_power` correct gezet zijn — let op: dit forceert een actie ongeacht het uur als je `current_hour` niet matcht; wel zie je de variabelen in trace)
- Drie puntjes → "Traces" om de variabele-waardes te inspecteren

Voor `Marstek batterij 2 discharge throttle bij SoC < 50%`:
- Wacht tot een echte ontlading SoC2 onder 50% brengt, of forceer met Developer Tools → States → `sensor.marstek_venus_modbus_2_battery_soc` tijdelijk op 49 zetten (alleen test, sensor wordt herschreven)

- [ ] **Step 4: Geen commit nodig**

Deze stap zit in HA, niet in de repo.

---

## Task 7: Eerste echte run-verificatie

**Files:** geen — observatie

- [ ] **Step 1: Check trace na het eerste laad-uur**

Wacht tot HA-tijd `charge_hour` bereikt. Open Settings → Automations & Scenes → `Marstek charge/discharge daily kickoff` → drie puntjes → Traces → meest recente run.

Verifieer:
- `charge_hour` variabele matcht het verwachte uur
- "Laad-startschot" tak is gekozen (niet "Ontlaad-startschot")
- Alle 5 services zijn aangeroepen (rs485_control_mode, select_option, delay, beide set_charge_power)
- Logbook-bericht: "Laad-startschot gevuurd op uur X"

- [ ] **Step 2: Check trace na het eerste ontlaad-uur**

Zelfde procedure, maar voor de "Ontlaad-startschot" tak. Verifieer extra:
- `set_discharge_power_2` waarde: 2500 als SoC2 ≥ 50, anders 200

- [ ] **Step 3: Geen commit nodig**

---

## Self-Review

Spec-coverage check:
- ✅ Charge-uur algoritme (00:00-17:00, negatief blok logica) → Task 1, 3
- ✅ Discharge-uur algoritme (17:00-23:00, duurste uur) → Task 2, 3
- ✅ Charge-actie incl. RS485, force_mode, 5s delay, beide charge_power → Task 3
- ✅ Discharge-actie incl. inline ternary voor power_2 → Task 3
- ✅ Battery 2 throttle (numeric_state below 50, condition force_mode_2 == discharge) → Task 4
- ✅ `mode: single` op beide automations → Task 3, 4
- ✅ Geen stop-logica (alleen startschot) → bevestigd door afwezigheid van stop-triggers
- ✅ `electricity_price` incl. btw → templates gebruiken `electricity_price`, niet `_excl_tax`
- ✅ Edge cases: forecast leeg → templates returnen `none`, action choose matcht niets
- ✅ CLAUDE.md update → Task 5

Placeholder scan: geen TBD/TODO/"later" gevonden in plan.

Type consistency: `charge_hour`, `discharge_hour`, `current_hour` overal als integer behandeld; `int(-1)` fallback in `choose` conditions zorgt dat `none` nooit per ongeluk matcht met `current_hour=0` (sentinel waarde -1).

Geen issues gevonden.
