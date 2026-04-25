# Smart Marstek Charge/Discharge — Design

**Date:** 2026-04-26
**Scope:** Twee Home Assistant automations die op basis van Zonneplan-tarief één laad-startschot en één ontlaad-startschot per dag geven aan twee Marstek VenusE batterijen, plus een SoC-throttle voor batterij 2.

---

## Doel

- Vandaag's tariefforecast (incl. btw) omzetten in één **laad-startschot** en één **ontlaad-startschot** voor twee Marstek-batterijen
- Geen stop-logica: hardware SoC-limiet handelt dat zelf af
- Batterij 2 ontlaadvermogen throttlen naar 200W zodra SoC2 < 50% tijdens een lopende ontlading

## Niet-doelen

- Geen fijnregeling van vermogen op basis van net-vermogen (geen nul-op-meter binnen deze automations)
- Geen multi-uur planning: één startschot per richting per dag
- Geen rekening houden met de oude (verwijderde) `automation_1`/`4`/`5`/`10` — die bestaan niet meer

---

## Architectuur

Twee aparte automation-bestanden:

| Bestand | Verantwoordelijkheid |
|---|---|
| `automation_charge_discharge_kickoff.yaml` | Hourly check: vuur laad- of ontlaad-startschot als huidig uur het gekozen uur is |
| `automation_battery2_discharge_throttle.yaml` | Numeric-state trigger: throttle batterij 2 naar 200W zodra SoC2 onder 50 zakt tijdens discharge |

### Waarom twee bestanden

- Verschillende triggertypes (time_pattern vs numeric_state) — splitsing maakt elke automation strak gefocust en triggers expliciet zichtbaar in HA UI
- Throttle is een onafhankelijke veiligheidsregel die ook nuttig is als het ontlaad-startschot uit een andere bron zou komen

---

## Automation A: charge/discharge kickoff

### Trigger

```yaml
- platform: time_pattern
  hours: "/1"
  minutes: 0
```

Vuurt om HH:00 (00:00, 01:00, …, 23:00).

### Per-trigger logica

1. Bouw `forecast_today` = forecast-entries waarvan `datetime` (na conversie naar lokale tijd) op vandaag valt
2. Bereken `charge_hour` (zie algoritme hieronder)
3. Bereken `discharge_hour` (zie algoritme hieronder)
4. Vergelijk huidig uur met `charge_hour` / `discharge_hour`:
   - Match charge → vuur charge-actie
   - Match discharge → vuur discharge-actie
   - Geen match → niets doen

### Charge-uur algoritme (venster 00:00–16:59 lokale tijd)

```
1. Filter forecast_today op uren in [00:00, 17:00)
2. Vind alle aaneengesloten blokken met electricity_price < 0
3. Als ≥ 1 negatief blok bestaat:
   a. Pak het langste blok (bij gelijke lengte: vroegste)
   b. Als blok-lengte ≤ 5u → charge_hour = eerste uur van blok
   c. Als blok-lengte > 5u → charge_hour = uur met laagste prijs binnen blok
4. Anders: charge_hour = uur met laagste prijs in heel het venster
```

### Discharge-uur algoritme (venster 17:00–22:59 lokale tijd)

```
1. Filter forecast_today op uren in [17:00, 23:00)
2. discharge_hour = uur met hoogste electricity_price
```

### Charge-actie

```yaml
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
```

### Discharge-actie

```yaml
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
```

De 5s delay zit tussen `force_mode` en `set_*_power` omdat de Marstek soms het vermogen verwerpt als hij nog niet klaar is met de mode-switch.

---

## Automation B: batterij 2 discharge throttle

### Trigger

```yaml
- platform: numeric_state
  entity_id: sensor.marstek_venus_modbus_2_battery_soc
  below: 50
```

### Conditions

```yaml
- condition: state
  entity_id: select.marstek_venus_modbus_force_mode_2
  state: discharge
- condition: numeric_state
  entity_id: number.marstek_venus_modbus_set_discharge_power_2
  above: 200
```

Tweede condition voorkomt nutteloze hercommando's als de power al laag staat.

### Action

```yaml
- service: number.set_value
  target:
    entity_id: number.marstek_venus_modbus_set_discharge_power_2
  data:
    value: 200
```

---

## Mode

Beide automations: `mode: single`. Bij time_pattern komt dit niet in de knel (1 trigger per uur, actie duurt seconden). Bij de throttle is `single` veilig — als SoC heen-en-weer wiebelt rond 50% wil je geen 10 commands per minuut.

---

## Forecast-formaat aannames

Gebaseerd op bestaande `panel_forecast.yaml`:

- `state_attr('sensor.zonneplan_current_electricity_tariff', 'forecast')` levert lijst van dicts
- Elk item heeft minimaal: `datetime` (UTC ISO, bv. `2026-04-26T13:00:00.000Z`), `electricity_price` (incl. btw, schaal × 10⁷), `electricity_price_excl_tax`
- Lokale tijd = UTC + `timezone_offset = 2` (CEST)

We gebruiken `electricity_price / 10000000` om naar €/kWh te schalen.

---

## Edge cases

| Scenario | Gedrag |
|---|---|
| Forecast leeg / niet beschikbaar | Trigger doet niets (template levert `none`, geen match) |
| HA herstart om 04:30, charge_hour was 03:00 | Gemist — pas weer kans morgen. Geen "catch-up" logica |
| Twee uren in venster delen exact dezelfde prijs | `min`/`max` pakt deterministisch de eerste — acceptabel |
| Negatief blok loopt door tot na 17:00 | Wordt afgekapt op 17:00, lengte gemeten in pre-avond venster |
| Geen tarief 17:00–23:00 (forecast incompleet) | Geen ontlaad-startschot vandaag |
| SoC2 was al onder 50 vóór discharge start | Throttle-trigger vuurt niet (geen overgang). Kickoff zet `discharge_power_2 = 200` direct via inline template |

---

## Testbaarheid

Handmatige verificatie in HA Developer Tools → Templates met de twee algoritme-templates. Run vóór deployment:

```jinja
{# charge_hour template — output moet integer 0-16 zijn #}
{# discharge_hour template — output moet integer 17-22 zijn #}
```

Trace-modus van HA toont per uur welke tak gekozen werd.

---

## Bestanden die moeten veranderen

| Bestand | Wijziging |
|---|---|
| `automation_charge_discharge_kickoff.yaml` | Nieuw |
| `automation_battery2_discharge_throttle.yaml` | Nieuw |
| `CLAUDE.md` | Nieuwe automations toevoegen aan bestandsstructuur-tabel; oude (verwijderde) regels uit Strategie-overzicht weghalen |
