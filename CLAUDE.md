# HAMarstek – Home Assistant Batterij Automations

## Doel
Slimme sturing van twee **Marstek VenusE** thuisbatterijen (2× 5 kWh) via Home Assistant. De automations geven één dagelijks laad-startschot op het goedkoopste tariefuur en één ontlaad-startschot op het duurste avonduur, plus een Envoy-toggle die zonnepanelen uitschakelt bij negatieve tarieven.

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
| `sensor.marstek_venus_modbus_battery_soc` | Laadstatus batterij 1 in % |
| `sensor.marstek_venus_modbus_battery_soc_2` | Laadstatus batterij 2 in % — triggert de discharge throttle als < 50 |
| `sensor.zonneplan_current_electricity_tariff` | Uurtarief in €/kWh (incl. btw, `forecast` attribute = `legacy_price_per_hour`) — **legacy**, fallback |
| `sensor.zonneplan_current_quarter_hourly_electricity_tariff` | Kwartiertarief (`forecast` attribute = `price_per_quarter_hour`) — **primaire bron** vanaf 1 aug 2026 |
| `sensor.envoy_122250110136_current_power_production` | Zonnepanelen productie in kW |
| `sensor.marstek_ct_4de1_battery_e3e9_total_power` | Ruwe net-vermogen W (+ = import, - = export) — voor dashboard |

## Sleutel entiteiten voor sturing

| Entiteit | Waarden |
|---|---|
| `switch.marstek_venus_modbus_rs485_control_mode` | Moet `on` zijn voor force_mode/charge/discharge |
| `select.marstek_venus_modbus_force_mode` | `stop` / `charge` / `discharge` (batterij 1) |
| `select.marstek_venus_modbus_force_mode_2` | `stop` / `charge` / `discharge` (batterij 2) |
| `number.marstek_venus_modbus_set_charge_power` | Laadvermogen batterij 1 in W (0–2500) |
| `number.marstek_venus_modbus_set_charge_power_2` | Laadvermogen batterij 2 in W (0–2500) |
| `number.marstek_venus_modbus_set_discharge_power` | Ontlaadvermogen batterij 1 in W (0–2500) |
| `number.marstek_venus_modbus_set_discharge_power_2` | Ontlaadvermogen batterij 2 in W (0–2500) |
| `switch.envoy_122250110136_production` | Aan/uit voor zonnepanelen Envoy-productie |

---

## Bestandsstructuur

| Bestand | Omschrijving |
|---|---|
| `automation_charge_discharge_kickoff.yaml` | Trigger elke 15 min: vuurt laad-startschot op begin van goedkoopste ~2u-venster (00-17u) en ontlaad-startschot op begin van duurste ~2u-venster (17-23u) van vandaag. Slot-gebaseerd, werkt op uur- én kwartierdata |
| `automation_battery2_discharge_throttle.yaml` | Throttlet `set_discharge_power_2` naar 200W zodra batterij 2 SoC onder 50% zakt tijdens ontlading |
| `automation_12_zonnepanelen_negatief_tarief.yaml` | Schakelt Envoy-productie 15 min voor negatief tarief uit, en 15 min voor positief tarief weer aan |
| `panel_forecast.yaml` | Markdown-template dat per uur het Zonneplan-tarief toont (incl. negatief-markering) |
| `input_helpers.yaml` | input_boolean en input_number helpers |
| `dashboard.yaml` | HA dashboard met Zonneplan tariefgrafiek en batterijstatus |

---

## Strategie overzicht

| Tijdvak | Actie | Logica |
|---|---|---|
| 00:00–17:00 | Laden | Startschot op begin van goedkoopste aaneengesloten ~2u-venster (`window_minutes`) in het tijdvak |
| 17:00–23:00 | Ontladen | Startschot op begin van duurste aaneengesloten ~2u-venster in het tijdvak |
| Continu | Throttle batterij 2 | `discharge_power_2` → 200W zodra SoC2 < 50% tijdens lopende discharge |

Het venster i.p.v. één los slot voorkomt dat je op het goedkoopste kwartier start maar daarna dwars door dure kwartieren doorlaadt. Een negatief tariefblok is vanzelf het goedkoopste venster, dus aparte negatief-blok-logica is niet meer nodig.

---

## Ontwerpregels

- **RS485 control mode** moet `on` zijn om force_mode en vermogens in te stellen. Kickoff-automation zet dit zelf aan vóór elk startschot.
- **5 seconden delay** tussen `force_mode` schakelen en `set_*_power` zetten — Marstek verwerpt soms het vermogen als hij nog niet klaar is met de mode-switch.
- **SoC-limieten zijn hardware-managed**: laad/ontlaad-startschot zet alleen het vermogen, batterij stopt zelf bij vol/leeg.
- **Vandaag-only**: alle tariefberekeningen kijken alleen naar forecast-entries waarvan lokale datum == vandaag. Geen multi-dag planning.
- **Gebruik `electricity_price`** (incl. btw) voor alle tariefvergelijkingen.
- **Slot-gebaseerd & granulariteit-agnostisch**: uren/kwartieren worden als minuut-van-de-dag (`hour*60+minute`) verwerkt, niet als heel uur. Werkt identiek op uur- en kwartierprijzen. De stap tussen entries wordt uit de forecast afgeleid.
- **Kwartier met fallback**: kickoff leest bij voorkeur `sensor.zonneplan_current_quarter_hourly_electricity_tariff`; is die leeg (vóór 1 aug 2026), dan valt hij terug op de legacy uur-sensor. Zo blijft het werken vóór en na de overgang.
