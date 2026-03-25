Maak een home assistant automation (automation_marstek3.yaml) die slim de batterij oplaadt. Rond 18.00 uur gaat er vaak een vaatwasser aan, dan moet de batterij bijspringen omdat het stroom tarief dan hoog is. Na 19.30 mag er stroom teruggeleverd worden als de zon niet schijnt. Bij het ontladen probeer nul op de meter aan te houden. Als je ziet dat er teveel stroom capaciteit in de batterij is tot de volgende oplaad sessie, probeer dan de stroom te verkopen voor het beste tarief.

Dit kun je als informatie gebruiken

modbus:
https://github.com/reschcloud/marstek_venus_e_modbus_home_assistant
hier kun je alles mee regelen. het is wel belangrijk dat rs485 control mode
aan staat, anders werkt het instellen van de force mode en charge & discharges niet.

zonneplan:
https://github.com/fsaris/home-assistant-zonneplan-one
hier kun je onderandere de tarieven uithalen. Ook zie je hier het verbruik

ct-003 meter:
https://github.com/d-shmt/hass_marstek-smart-meter
Hier kun je de huidige verbruik en stroom teruggave vinden

local api:
https://github.com/jaapp/ha-marstek-local-api
Je kunt hier togglen tussen AI en auto


sensor sun height:
sun_solar_elevation Default (-16.57)
als de zon hoger dan 0 graden is, dan kunnen de batterijen pas opladen.

in dashboard.yaml zit ook een script in sectie batterij & functie die o.a. de goedkoopste
tarief toont. Rond die tijd is het goed om te laden, ook al schijnt de zon wat minder. 
Je kunt het dashboard ter inspiratie houden en misschien de juiste sensoren gebruiken
in de automation.

Je mag de overige markdown files gebruiken ter inspiratie, maar begin wel opnieuw.