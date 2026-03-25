binary_sensor.marstek_venus_modbus_wifi_status
Marstek Venus Modbus WiFi Status
on
icon: mdi:check-network-outline
friendly_name: Marstek Venus Modbus WiFi Status
binary_sensor.marstek_venuse_3_0_bluetooth_connected
Marstek VenusE 3.0 Bluetooth connected
off
device_class: connectivity
friendly_name: Marstek VenusE 3.0 Bluetooth connected
binary_sensor.marstek_venuse_3_0_charging_enabled
Marstek VenusE 3.0 Charging enabled
on
device_class: battery_charging
friendly_name: Marstek VenusE 3.0 Charging enabled
binary_sensor.marstek_venuse_3_0_ct_connected
Marstek VenusE 3.0 CT connected
off
device_class: connectivity
friendly_name: Marstek VenusE 3.0 CT connected
binary_sensor.marstek_venuse_3_0_discharging_enabled
Marstek VenusE 3.0 Discharging enabled
on
friendly_name: Marstek VenusE 3.0 Discharging enabled
input_boolean.marstek_nul_op_de_meter_actief
Marstek nul-op-de-meter actief
off
editable: true
icon: hacs:hacs
friendly_name: Marstek nul-op-de-meter actief
input_number.marstek_zero_export_deadband
Marstek deadband
0.0
initial: null
editable: true
min: 0
max: 300
step: 1
mode: slider
friendly_name: Marstek deadband
input_number.marstek_zero_export_max_charge
Marstek laden
1268.0
initial: null
editable: true
min: 0
max: 2500
step: 1
mode: slider
friendly_name: Marstek laden
input_number.marstek_zero_export_max_discharge
Marstek max ontladen
1363.0
initial: null
editable: true
min: 0
max: 2500
step: 1
mode: slider
friendly_name: Marstek max ontladen
number.marstek_venus_modbus_charge_to_soc
Marstek Venus Modbus Charge to SoC
0
min: 10
max: 100
step: 1
mode: auto
icon: mdi:battery-sync-outline
friendly_name: Marstek Venus Modbus Charge to SoC
number.marstek_venus_modbus_max_charge_power
Marstek Venus Modbus Max Charge Power
0
min: 0
max: 2500
step: 50
mode: auto
icon: mdi:battery-arrow-up-outline
friendly_name: Marstek Venus Modbus Max Charge Power
number.marstek_venus_modbus_max_discharge_power
Marstek Venus Modbus Max Discharge Power
800
min: 0
max: 2500
step: 50
mode: auto
icon: mdi:battery-arrow-down-outline
friendly_name: Marstek Venus Modbus Max Discharge Power
number.marstek_venus_modbus_set_charge_power
Marstek Venus Modbus Set Charge Power
0
min: 0
max: 2500
step: 50
mode: auto
icon: mdi:battery-arrow-up-outline
friendly_name: Marstek Venus Modbus Set Charge Power
number.marstek_venus_modbus_set_discharge_power
Marstek Venus Modbus Set Discharge Power
220
min: 0
max: 2500
step: 50
mode: auto
icon: mdi:battery-arrow-down-outline
friendly_name: Marstek Venus Modbus Set Discharge Power
select.marstek_venus_modbus_force_mode
Marstek Venus Modbus Force Mode
discharge
options: stop, charge, discharge
friendly_name: Marstek Venus Modbus Force Mode
select.marstek_venus_modbus_user_work_mode
Marstek Venus Modbus User Work Mode
anti_feed
options: manual, anti_feed, trade_mode
friendly_name: Marstek Venus Modbus User Work Mode
select.marstek_venuse_3_0_operating_mode
Marstek VenusE 3.0 Operating mode
Manual
options: Auto, AI, Manual, Passive
friendly_name: Marstek VenusE 3.0 Operating mode
sensor.energy_battery_marstek_venuse_3_0_power_connect_energiemeter_electricity_average_net_power
Battery Power
unavailable
restored: true
state_class: measurement
device_class: power
friendly_name: Battery Power
supported_features: 0
sensor.marstek_venus_modbus_ac_current
Marstek Venus Modbus AC Current
0.6
state_class: measurement
unit_of_measurement: A
device_class: current
friendly_name: Marstek Venus Modbus AC Current
sensor.marstek_venus_modbus_ac_frequency
Marstek Venus Modbus AC Frequency
50
state_class: measurement
unit_of_measurement: Hz
device_class: frequency
friendly_name: Marstek Venus Modbus AC Frequency
sensor.marstek_venus_modbus_ac_offgrid_current
Marstek Venus Modbus AC Offgrid Current
22.5
state_class: measurement
unit_of_measurement: A
device_class: current
friendly_name: Marstek Venus Modbus AC Offgrid Current
sensor.marstek_venus_modbus_ac_offgrid_power
Marstek Venus Modbus AC Offgrid Power
unavailable
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek Venus Modbus AC Offgrid Power
sensor.marstek_venus_modbus_ac_offgrid_voltage
Marstek Venus Modbus AC Offgrid Voltage
225.3
state_class: measurement
unit_of_measurement: V
device_class: voltage
friendly_name: Marstek Venus Modbus AC Offgrid Voltage
sensor.marstek_venus_modbus_ac_power
Marstek Venus Modbus AC Power
269
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek Venus Modbus AC Power
sensor.marstek_venus_modbus_ac_voltage
Marstek Venus Modbus AC Voltage
224.6
state_class: measurement
unit_of_measurement: V
device_class: voltage
friendly_name: Marstek Venus Modbus AC Voltage
sensor.marstek_venus_modbus_battery_current
Marstek Venus Modbus Battery Current
-3.6
state_class: measurement
unit_of_measurement: A
device_class: current
friendly_name: Marstek Venus Modbus Battery Current
sensor.marstek_venus_modbus_battery_power
Marstek Venus Modbus Battery Power
-297
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek Venus Modbus Battery Power
sensor.marstek_venus_modbus_battery_soc
Marstek Venus Modbus Battery SoC
44.6
state_class: measurement
unit_of_measurement: %
device_class: battery
friendly_name: Marstek Venus Modbus Battery SoC
sensor.marstek_venus_modbus_battery_total_energy
Marstek Venus Modbus Battery Total Energy
5.12
state_class: total
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek Venus Modbus Battery Total Energy
sensor.marstek_venus_modbus_battery_voltage
Marstek Venus Modbus Battery Voltage
52.3
state_class: measurement
unit_of_measurement: V
device_class: voltage
friendly_name: Marstek Venus Modbus Battery Voltage
sensor.marstek_venus_modbus_bms_version
Marstek Venus Modbus BMS Version
112
icon: mdi:battery-check-outline
friendly_name: Marstek Venus Modbus BMS Version
sensor.marstek_venus_modbus_communication_module_firmware
Marstek Venus Modbus Communication Module Firmware
202409090159
icon: mdi:ticket-confirmation-outline
friendly_name: Marstek Venus Modbus Communication Module Firmware
sensor.marstek_venus_modbus_conversion_efficiency
Marstek Venus Modbus Conversion Efficiency
90.6
state_class: measurement
unit_of_measurement: %
friendly_name: Marstek Venus Modbus Conversion Efficiency
sensor.marstek_venus_modbus_daily_charging_energy
Marstek Venus Modbus Daily Charging Energy
0
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek Venus Modbus Daily Charging Energy
sensor.marstek_venus_modbus_daily_discharging_energy
Marstek Venus Modbus Daily Discharging Energy
0.33
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek Venus Modbus Daily Discharging Energy
sensor.marstek_venus_modbus_device_name
Marstek Venus Modbus Device Name
VNSE3-0
icon: mdi:package-variant-closed
friendly_name: Marstek Venus Modbus Device Name
sensor.marstek_venus_modbus_ems_version
Marstek Venus Modbus EMS Version
144
icon: mdi:ticket-confirmation-outline
friendly_name: Marstek Venus Modbus EMS Version
sensor.marstek_venus_modbus_full_cycles_bms
Marstek Venus Modbus Full Cycles (BMS)
1
state_class: total_increasing
icon: mdi:counter
friendly_name: Marstek Venus Modbus Full Cycles (BMS)
sensor.marstek_venus_modbus_full_cycles_calculated
Marstek Venus Modbus Full Cycles (calculated)
0.06
state_class: measurement
icon: mdi:counter
friendly_name: Marstek Venus Modbus Full Cycles (calculated)
sensor.marstek_venus_modbus_internal_temperature
Marstek Venus Modbus Internal Temperature
27.5
state_class: measurement
unit_of_measurement: °C
device_class: temperature
friendly_name: Marstek Venus Modbus Internal Temperature
sensor.marstek_venus_modbus_inverter_state
Marstek Venus Modbus Inverter State
Discharge
icon: mdi:state-machine
friendly_name: Marstek Venus Modbus Inverter State
sensor.marstek_venus_modbus_mac_address
Marstek Venus Modbus MAC Address
0C587B17E3E9
icon: mdi:ethernet
friendly_name: Marstek Venus Modbus MAC Address
sensor.marstek_venus_modbus_monthly_charging_energy
Marstek Venus Modbus Monthly Charging Energy
0
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek Venus Modbus Monthly Charging Energy
sensor.marstek_venus_modbus_monthly_discharging_energy
Marstek Venus Modbus Monthly Discharging Energy
0.33
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek Venus Modbus Monthly Discharging Energy
sensor.marstek_venus_modbus_round_trip_efficiency_monthly
Marstek Venus Modbus Round Trip Efficiency Monthly
unknown
state_class: measurement
unit_of_measurement: %
icon: mdi:percent
friendly_name: Marstek Venus Modbus Round Trip Efficiency Monthly
sensor.marstek_venus_modbus_round_trip_efficiency_total
Marstek Venus Modbus Round Trip Efficiency Total
unknown
state_class: measurement
unit_of_measurement: %
icon: mdi:percent
friendly_name: Marstek Venus Modbus Round Trip Efficiency Total
sensor.marstek_venus_modbus_stored_energy
Marstek Venus Modbus Stored Energy
2.28
state_class: total
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek Venus Modbus Stored Energy
sensor.marstek_venus_modbus_total_charging_energy
Marstek Venus Modbus Total Charging Energy
0
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek Venus Modbus Total Charging Energy
sensor.marstek_venus_modbus_total_discharging_energy
Marstek Venus Modbus Total Discharging Energy
0.33
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek Venus Modbus Total Discharging Energy
sensor.marstek_venus_modbus_vms_version
Marstek Venus Modbus VMS Version
117
icon: mdi:battery-check-outline
friendly_name: Marstek Venus Modbus VMS Version
sensor.marstek_venus_modbus_voltage
Marstek Venus Modbus Voltage
3.27
state_class: measurement
unit_of_measurement: V
device_class: voltage
friendly_name: Marstek Venus Modbus Voltage
sensor.marstek_venus_modbus_wifi_signal_strength
Marstek Venus Modbus WiFi Signal Strength
-51
unit_of_measurement: dBm
device_class: diagnostic
icon: mdi:wifi
friendly_name: Marstek Venus Modbus WiFi Signal Strength
sensor.marstek_venuse_3_0_available_capacity
Marstek VenusE 3.0 Available capacity
unknown
state_class: measurement
unit_of_measurement: kWh
device_class: energy_storage
friendly_name: Marstek VenusE 3.0 Available capacity
sensor.marstek_venuse_3_0_battery_temperature
Marstek VenusE 3.0 Battery temperature
unknown
state_class: measurement
unit_of_measurement: °C
device_class: temperature
friendly_name: Marstek VenusE 3.0 Battery temperature
sensor.marstek_venuse_3_0_bluetooth_mac
Marstek VenusE 3.0 Bluetooth MAC
0c587b17e3e9
friendly_name: Marstek VenusE 3.0 Bluetooth MAC
sensor.marstek_venuse_3_0_ct_parse_state
Marstek VenusE 3.0 CT parse state
unknown
friendly_name: Marstek VenusE 3.0 CT parse state
sensor.marstek_venuse_3_0_ct_phase_a_power
Marstek VenusE 3.0 CT phase A power
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 CT phase A power
sensor.marstek_venuse_3_0_ct_phase_b_power
Marstek VenusE 3.0 CT phase B power
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 CT phase B power
sensor.marstek_venuse_3_0_ct_phase_c_power
Marstek VenusE 3.0 CT phase C power
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 CT phase C power
sensor.marstek_venuse_3_0_ct_total_power
Marstek VenusE 3.0 CT total power
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 CT total power
sensor.marstek_venuse_3_0_current
Marstek VenusE 3.0 Current
unknown
state_class: measurement
unit_of_measurement: A
device_class: current
friendly_name: Marstek VenusE 3.0 Current
sensor.marstek_venuse_3_0_discharge_flag
Marstek VenusE 3.0 Discharge flag
unknown
friendly_name: Marstek VenusE 3.0 Discharge flag
sensor.marstek_venuse_3_0_error_code
Marstek VenusE 3.0 Error code
unknown
friendly_name: Marstek VenusE 3.0 Error code
sensor.marstek_venuse_3_0_firmware_version
Marstek VenusE 3.0 Firmware version
144
friendly_name: Marstek VenusE 3.0 Firmware version
sensor.marstek_venuse_3_0_grid_power
Marstek VenusE 3.0 Grid power
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 Grid power
sensor.marstek_venuse_3_0_ip_address
Marstek VenusE 3.0 IP address
192.168.01.101
friendly_name: Marstek VenusE 3.0 IP address
sensor.marstek_venuse_3_0_last_message_received
Marstek VenusE 3.0 Last message received
3787
state_class: measurement
unit_of_measurement: s
device_class: duration
friendly_name: Marstek VenusE 3.0 Last message received
sensor.marstek_venuse_3_0_model
Marstek VenusE 3.0 Model
VenusE 3.0
friendly_name: Marstek VenusE 3.0 Model
sensor.marstek_venuse_3_0_off_grid_power
Marstek VenusE 3.0 Off-grid power
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 Off-grid power
sensor.marstek_venuse_3_0_operating_mode
Marstek VenusE 3.0 Operating mode
unknown
friendly_name: Marstek VenusE 3.0 Operating mode
sensor.marstek_venuse_3_0_power
Marstek VenusE 3.0 Power
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 Power
sensor.marstek_venuse_3_0_power_in
Marstek VenusE 3.0 Power in
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 Power in
sensor.marstek_venuse_3_0_power_out
Marstek VenusE 3.0 Power out
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 Power out
sensor.marstek_venuse_3_0_rated_capacity
Marstek VenusE 3.0 Rated capacity
unknown
unit_of_measurement: kWh
device_class: energy_storage
friendly_name: Marstek VenusE 3.0 Rated capacity
sensor.marstek_venuse_3_0_remaining_capacity
Marstek VenusE 3.0 Remaining capacity
unknown
state_class: measurement
unit_of_measurement: kWh
device_class: energy_storage
friendly_name: Marstek VenusE 3.0 Remaining capacity
sensor.marstek_venuse_3_0_solar_power
Marstek VenusE 3.0 Solar power
unknown
state_class: measurement
unit_of_measurement: W
device_class: power
friendly_name: Marstek VenusE 3.0 Solar power
sensor.marstek_venuse_3_0_state
Marstek VenusE 3.0 State
unknown
friendly_name: Marstek VenusE 3.0 State
sensor.marstek_venuse_3_0_state_of_charge
Marstek VenusE 3.0 State of charge
unknown
state_class: measurement
unit_of_measurement: %
device_class: battery
friendly_name: Marstek VenusE 3.0 State of charge
sensor.marstek_venuse_3_0_total_grid_export
Marstek VenusE 3.0 Total grid export
unknown
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek VenusE 3.0 Total grid export
sensor.marstek_venuse_3_0_total_grid_import
Marstek VenusE 3.0 Total grid import
unknown
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek VenusE 3.0 Total grid import
sensor.marstek_venuse_3_0_total_load_energy
Marstek VenusE 3.0 Total load energy
unknown
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek VenusE 3.0 Total load energy
sensor.marstek_venuse_3_0_total_solar_energy
Marstek VenusE 3.0 Total solar energy
unknown
state_class: total_increasing
unit_of_measurement: kWh
device_class: energy
friendly_name: Marstek VenusE 3.0 Total solar energy
sensor.marstek_venuse_3_0_voltage
Marstek VenusE 3.0 Voltage
unknown
state_class: measurement
unit_of_measurement: V
device_class: voltage
friendly_name: Marstek VenusE 3.0 Voltage
sensor.marstek_venuse_3_0_wifi_dns_server
Marstek VenusE 3.0 WiFi DNS server
192.168.01.01
friendly_name: Marstek VenusE 3.0 WiFi DNS server
sensor.marstek_venuse_3_0_wifi_gateway
Marstek VenusE 3.0 WiFi gateway
192.168.01.01
friendly_name: Marstek VenusE 3.0 WiFi gateway
sensor.marstek_venuse_3_0_wifi_ip_address
Marstek VenusE 3.0 WiFi IP address
192.168.01.101
friendly_name: Marstek VenusE 3.0 WiFi IP address
sensor.marstek_venuse_3_0_wifi_mac
Marstek VenusE 3.0 WiFi MAC
friendly_name: Marstek VenusE 3.0 WiFi MAC
sensor.marstek_venuse_3_0_wifi_signal_strength
Marstek VenusE 3.0 WiFi signal strength
0
state_class: measurement
unit_of_measurement: dBm
device_class: signal_strength
friendly_name: Marstek VenusE 3.0 WiFi signal strength
sensor.marstek_venuse_3_0_wifi_ssid
Marstek VenusE 3.0 WiFi SSID
friendly_name: Marstek VenusE 3.0 WiFi SSID
sensor.marstek_venuse_3_0_wifi_subnet_mask
Marstek VenusE 3.0 WiFi subnet mask
255.255.255.00
friendly_name: Marstek VenusE 3.0 WiFi subnet mask
sensor.marstek_zero_export_action
Marstek Zero Export Action
Hold
friendly_name: Marstek Zero Export Action
sensor.marstek_zero_exporter
Marstek Zero Exporter
0
unit_of_measurement: W
device_class: power
friendly_name: Marstek Zero Exporter
switch.marstek_venus_modbus_backup_function
Marstek Venus Modbus Backup Function
on
friendly_name: Marstek Venus Modbus Backup Function
update.marstek_local_api_update
Marstek Local API update
unavailable
restored: true
friendly_name: Marstek Local API update
supported_features: 23
update.marstek_venus_modbus_update
Marstek Venus Modbus update
off
auto_update: false
display_precision: 0
installed_version: 2026.3.4
in_progress: false
latest_version: 2026.3.4
release_summary: null
release_url: https://github.com/ViperRNMC/marstek_venus_modbus/releases/2026.3.4
skipped_version: null
title: null
update_percentage: null
entity_picture: https://brands.home-assistant.io/_/marstek_modbus/icon.png
friendly_name: Marstek Venus Modbus update
supported_features: 23