gebruik sensors.md voor home assistant sensors

gebruik zonneplan.md voor zonnepanelen opbrengsten states

gebruik parstek.md voor thuis batterij stated

Ik wil een automation waardoor de minstens nul op de meter wordt gehaald.

marstek_ct_4de1_battery_e3e9_phase_a_power = huidige verbruik.

met marstek_venus_modbus_max_charge_power kun je de maximum wattage instellen om te laden op de batterij
met marstek_venus_modbus_max_discharge_power kun je de maximum wattage instellen om te ontladen op de batterij
gebruik marstek_venus_modbus_set_charge_power voor huidige oplaad wattage
gebruik marstek_venus_modbus_set_discharge_power voor huidige ontladen wattage
gebruik marstek_venus_modbus_force_mode voor togglen tussen charge / discharge en stop
ik weet niet of je deze moet gebruiken voor het laden wanneer de zonnepanelen electriciteit opwekken: marstek_venus_modbus_charge_to_soc





Wanneer de zon schijnt moet ook de thuisbatterij worden optimaal opgeladen. Het huidige verbruik moet proberen onder de 0 te komen.

de sensor marstek_venus_modbus_battery_soc is in percentage de oplaad status van de batterij zelf, Deze mag nooit onder de 10% zakken.

Ik wil dat de batterij configuratie automatisch wordt gewijzigd naar laden en ontladen, pas het laden en ontladen vermogen aan. De afgifte van de batterij kun je uitlezen met sensor marstek_venus_modbus_battery_power. De huidige stroomberbruik kun je uitlezen met sensor connect_energiemeter_electricity_consumption. Ideaal gezien moet connect_energiemeter_electricity_consumption op 0 of minder dan 0 (energie teruggave) geregeld worden.

de opbrengst van de panelen kun je uitlezen uit sensor envoy_122250110136_current_power_production.

update elke 15 seconden.




