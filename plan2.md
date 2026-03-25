I want to charge and discharge my home battery marstek venus e 3 with home assistant.
You can use the following entities and sensors to create an automation_marstek2.yaml.

You can also watch automation_marstek.yaml for inspiration, the problem is, that script
doesnt work very well. 

entities:
marstek_venus_modbus_max_charge_power set max charge power ( 0 - 2500 )
marstek_venus_modbus_set_charge_power set current charge power ( - 2500 )

marstek_venus_modbus_max_discharge_power set max discharge power ( 0 - 2500 )
marstek_venus_modbus_set_discharge_power set current discharge power ( - 2500 )

marstek_venus_modbus_force_mode set force mode ( stop / charge / discharge )
marstek_venus_modbus_user_work_mode set work mode ( manual / anti-feed / trade mode )

sensors:
envoy_122250110136_current_power_production current solar power production ( in kw )
marstek_ct_4de1_battery_e3e9_phase_a_power current power used
marstek_venus_modbus_battery_soc battery storage electricity in %

This is important:

when the sun shines ( envoy_122250110136_current_power_production > 50 ) then 
    charge the battery:
    set marstek_venus_modbus_max_charge_power and marstek_venus_modbus_set_charge_power to envoy_122250110136_current_power_production
    only charge to soc 100% 


when sun is gone ( envoy_122250110136_current_power_production < 0 ) then
    discharge the battery:
    set marstek_venus_modbus_max_discharge_power and marstek_venus_modbus_set_discharge_power to marstek_ct_4de1_battery_e3e9_phase_a_power
    only discharge to soc 10%

    try to have a current power to 0 (zere on meter)

 but if you have additional ideas, please tell me

 this are all the entities: 
 sensor.marstek_venuse_3_0_ct_total_power
sensor.marstek_venuse_3_0_ct_total_power
W
recorder
No issue
—
sensor.marstek_venuse_3_0_last_message_received
sensor.marstek_venuse_3_0_last_message_received
s
recorder
No issue
—
sensor.marstek_venuse_3_0_wifi_signal_strength
sensor.marstek_venuse_3_0_wifi_signal_strength
dBm
recorder
No issue
—
Marstek Venus Modbus Battery SoC
sensor.marstek_venus_modbus_battery_soc
%
recorder
No issue
—
Marstek Venus Modbus Battery Total Energy
sensor.marstek_venus_modbus_battery_total_energy
kWh
recorder
No issue
—
Marstek Venus Modbus Battery Voltage
sensor.marstek_venus_modbus_battery_voltage
V
recorder
No issue
—
Marstek Venus Modbus Battery Current
sensor.marstek_venus_modbus_battery_current
A
recorder
No issue
—
Marstek Venus Modbus Battery Power
sensor.marstek_venus_modbus_battery_power
W
recorder
No issue
—
Marstek Venus Modbus Internal Temperature
sensor.marstek_venus_modbus_internal_temperature
°C
recorder
No issue
—
Marstek Venus Modbus AC Voltage
sensor.marstek_venus_modbus_ac_voltage
V
recorder
No issue
—
Marstek Venus Modbus AC Current
sensor.marstek_venus_modbus_ac_current
A
recorder
No issue
—
Marstek Venus Modbus AC Power
sensor.marstek_venus_modbus_ac_power
W
recorder
No issue
—
Marstek Venus Modbus AC Frequency
sensor.marstek_venus_modbus_ac_frequency
Hz
recorder
No issue
—
Marstek Venus Modbus Total Charging Energy
sensor.marstek_venus_modbus_total_charging_energy
kWh
recorder
No issue
—
Marstek Venus Modbus Total Discharging Energy
sensor.marstek_venus_modbus_total_discharging_energy
kWh
recorder
No issue
—
Marstek Venus Modbus Full Cycles (BMS)
sensor.marstek_venus_modbus_full_cycles_bms
recorder
No issue
—
Marstek Venus Modbus Round Trip Efficiency Total
sensor.marstek_venus_modbus_round_trip_efficiency_total
%
recorder
No issue
—
Marstek Venus Modbus Conversion Efficiency
sensor.marstek_venus_modbus_conversion_efficiency
%
recorder
No issue
—
Marstek Venus Modbus Stored Energy
sensor.marstek_venus_modbus_stored_energy
kWh
recorder
No issue
—
Marstek Venus Modbus Full Cycles (calculated)
sensor.marstek_venus_modbus_full_cycles_calculated
recorder
No issue
—
Marstek Venus Modbus Daily Charging Energy
sensor.marstek_venus_modbus_daily_charging_energy
kWh
recorder
No issue
—
Marstek Venus Modbus Daily Discharging Energy
sensor.marstek_venus_modbus_daily_discharging_energy
kWh
recorder
No issue
—
Marstek Venus Modbus Voltage
sensor.marstek_venus_modbus_voltage
V
recorder
No issue
—
Marstek Venus Modbus AC Offgrid Current
sensor.marstek_venus_modbus_ac_offgrid_current
A
recorder
No issue
—
Marstek Venus Modbus Monthly Charging Energy
sensor.marstek_venus_modbus_monthly_charging_energy
kWh
recorder
No issue
—
Marstek Venus Modbus Monthly Discharging Energy
sensor.marstek_venus_modbus_monthly_discharging_energy
kWh
recorder
No issue
—
Marstek Venus Modbus AC Offgrid Voltage
sensor.marstek_venus_modbus_ac_offgrid_voltage
V
recorder
No issue
—
Marstek Venus Modbus Round Trip Efficiency Monthly
sensor.marstek_venus_modbus_round_trip_efficiency_monthly
%
recorder
No issue
—
Marstek CT 4de1 / Battery e3e9 Total Power
sensor.marstek_ct_4de1_battery_e3e9_total_power
W
recorder
No issue
—
Marstek CT 4de1 / Battery e3e9 WLAN RSSI
sensor.marstek_ct_4de1_battery_e3e9_wlan_rssi
dBm
recorder
No issue
—
Marstek CT 4de1 / Battery e3e9 Phase A Power
sensor.marstek_ct_4de1_battery_e3e9_phase_a_power
W
recorder
No issue
—
Marstek CT 4de1 / Battery e3e9 Phase B Power
sensor.marstek_ct_4de1_battery_e3e9_phase_b_power
W
recorder
No issue
—
Marstek CT 4de1 / Battery e3e9 Phase C Power
sensor.marstek_ct_4de1_battery_e3e9_phase_c_power
W
recorder
No issue
—
Sun Solar elevation
sensor.sun_solar_elevation
°
recorder
No issue
—
Sun Solar azimuth
sensor.sun_solar_azimuth
°
recorder
No issue
—