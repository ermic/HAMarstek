# HAMarstek – Home Assistant Batterij Automations

## Doel
Slimme sturing van een **Marstek VenusE 3.0** thuisbatterij via Home Assistant. De automations houden nul op de meter aan, verkopen stroom bij hoge tarieven en laden goedkoop bij via zon of net.

---

## Integraties

| Naam | GitHub | Gebruik |
|---|---|---|
| Marstek Modbus | [reschcloud/marstek_venus_e_modbus_home_assistant](https://github.com/reschcloud/marstek_venus_e_modbus_home_assistant) | Volledige batterijsturing via RS485 |
| Zonneplan | [fsaris/home-assistant-zonneplan-one](https://github.com/fsaris/home-assistant-zonneplan-one) | Dynamische tarieven + verbruik |
| CT-003 meter | [d-shmt/hass_marstek-smart-meter](https://github.com/d-shmt/hass_marstek-smart-meter) | Net-vermogen meting (import/export) |
| Marstek Local API | [jaapp/ha-marstek-local-api](https://github.com/jaapp/ha-marstek-local-api) | Toggle tussen AI en auto modus |

---

## Sleutel sensoren

| Entiteit | Omschrijving |
|---|---|
| `sensor.marstek_venus_modbus_battery_soc` | Laadstatus in % |
| `sensor.marstek_ct_4de1_battery_e3e9_total_power` | Ruwe net-vermogen W (+ = import, - = export) |
| `sensor.marstek_ct_4de1_battery_e3e9_phase_a_power` | Ruwe fase A vermogen W |
| `input_number.marstek_net_power_smooth` | **Gladgemiddeld net-vermogen** (EMA, elke 10s bijgewerkt) — gebruik dit i.p.v. de ruwe CT-sensor in automations |
| `sensor.zonneplan_current_tariff_group` | Huidig tarief: `low` / `normal` / `high` |
| `sensor.zonneplan_current_electricity_tariff` | Tarief in €/kWh (incl. forecast in attributes) |
| `sensor.sun_solar_elevation` | Zonnehoogte in graden — boven 0 = zon schijnt |
| `sensor.envoy_122250110136_current_power_production` | Zonnepanelen productie in kW |
| `sensor.marstek_venus_modbus_inverter_state` | Inverterstatus (bijv. `Bypass`) |

## Sleutel entiteiten voor sturing

| Entiteit | Waarden |
|---|---|
| `switch.marstek_venus_modbus_rs485_control_mode` | Moet `on` zijn voor force_mode/charge/discharge |
| `select.marstek_venus_modbus_force_mode` | `stop` / `charge` / `discharge` |
| `select.marstek_venus_modbus_user_work_mode` | `manual` / `anti_feed` / `trade_mode` |
| `number.marstek_venus_modbus_set_charge_power` | Laadvermogen in W (0–2500) |
| `number.marstek_venus_modbus_set_discharge_power` | Ontlaadvermogen in W (0–2500) |
| `number.marstek_venus_modbus_max_charge_power` | Max laadvermogen in W |
| `number.marstek_venus_modbus_max_discharge_power` | Max ontlaadvermogen in W |

---

## Bestandsstructuur

| Bestand | Omschrijving |
|---|---|
| `automation_1_strategie_controller.yaml` | Hoofd strategie: bepaalt modus op basis van tijd, tarief, SoC |
| `automation_2_stop_laden_vol.yaml` | Stopt laden als SoC > 99% |
| `automation_3_stop_verkoop_lage_soc.yaml` | Stopt verkoop als SoC < 50% |
| `automation_4_avond_verkoop_start.yaml` | Start verkoop bij hoog avondtarief |
| `automation_5_avond_verkoop_stop.yaml` | Stopt verkoop als tarief daalt |
| `automation_6_dagelijkse_reset.yaml` | Reset naar anti_feed elke ochtend 08:00 |
| `automation_7_nacht_ontladen.yaml` | Nacht ontladen (zomer) |
| `automation_8_nacht_ontladen_stop.yaml` | Stop nacht ontladen |
| `automation_9_rs485_watchdog.yaml` | Bewaakt RS485 control mode |
| `automation_10_avond_nul_op_meter.yaml` | Nul-op-meter sturing 19:30–23:59, elke 30s |
| `automation_11_smooth_net_power.yaml` | Werkt `marstek_net_power_smooth` bij via EMA, elke 10s |
| `automation_marstek.yaml` | Oudere nul-op-meter automation (v1) |
| `automation_marstek2.yaml` | Slim laden/ontladen v2 |
| `automation_marstek3.yaml` | Volledige v3 strategie (meerdere automations in 1 file) |
| `input_helpers.yaml` | input_boolean en input_number helpers |
| `dashboard.yaml` | HA dashboard met Zonneplan tariefgrafiek en batterijstatus |

---

## Strategie overzicht

| Tijdvak | Modus | Logica |
|---|---|---|
| 00:00–08:00 | Nacht laden (winter) | Laad via net bij `low` tarief als SoC < 80% |
| 00:00–08:00 | Nacht ontladen (zomer) | Langzaam ontladen (250W) als SoC > 10% |
| 08:00–17:00 | Dag – anti_feed | Zon laadt batterij, batterij dekt verbruik |
| 08:00–17:00 | Dag laden bewolkt | Net-laden bij `low` tarief en weinig zon (elevatie < 10°) |
| 17:00–19:30 | Spitsuur | anti_feed met hoog ontlaadvermogen (2500W) voor vaatwasser etc. |
| 19:30–23:59 | Avond verkoop | Ontlaad bij `high` tarief als SoC > 80% en geen zon |
| 19:30–23:59 | Avond nul-op-meter | Fijnregeling ontlaadvermogen elke 30s o.b.v. glad net-vermogen |

---

## Ontwerpregels

- **RS485 control mode** moet altijd `on` zijn om force_mode en vermogens in te stellen. Automations zetten dit zelf aan als het uit staat.
- **Gebruik altijd `input_number.marstek_net_power_smooth`** als net-vermogen in automations, nooit de ruwe CT-sensor. De EMA (30% nieuw, 70% oud) wordt elke 10s bijgewerkt door `automation_11`.
- **Deadband van 30W** in nul-op-meter automation voorkomt constante kleine aanpassingen.
- **SoC minimum 15%** voor ontladen, minimum 10% voor batterijbescherming (stop alles).
- **Verkoop stopt automatisch** bij SoC < 50% (`automation_3`).
- Nacht-laden is alleen actief in de winter (oktober–februari) vanwege de zon in de zomer.
