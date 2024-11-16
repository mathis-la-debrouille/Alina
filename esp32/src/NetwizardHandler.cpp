#include "NetwizardHandler.h"

NetwizardHandler::NetwizardHandler()
    : _server(80), _nw(&_server), _nw_mqtt_header(&_nw, NW_HEADER, "MQTT"),
      _nw_divider1(&_nw, NW_DIVIDER),
      _nw_mqtt_host(&_nw, NW_INPUT, "Host", "mqtt.alina.massiveusage.com"),
      _nw_mqtt_port(&_nw, NW_INPUT, "Port", "8883", "8883"),
      _nw_bluetooth_header(&_nw, NW_HEADER, "Bluetooth"), _nw_divider2(&_nw, NW_DIVIDER),
      _nw_bluetooth_name(&_nw, NW_INPUT, "Name", "17942 SPEAKER", "17942 SPEAKER"),
      _nw_account_header(&_nw, NW_HEADER, "Account"), _nw_divider3(&_nw, NW_DIVIDER),
      _nw_account_username(&_nw, NW_INPUT, "Username", "", "alina"),
      _nw_account_email(&_nw, NW_INPUT, "Email", "", "alina@alina.com"),
      _nw_account_password(&_nw, NW_INPUT, "Password", "", "Password1")

{
}

NetwizardHandler::~NetwizardHandler() {}

void NetwizardHandler::setup(MqttHandler &mqtt_handler, BluetoothA2DPSource &a2dp_source)
{

    _nw.setStrategy(NetWizardStrategy::BLOCKING);

    _nw.onConfig(
        [&]()
        {
            Serial.println("NW onConfig Received");

            // Print new parameter values
            Serial.printf("Host: %s\n", _nw_mqtt_host.getValueStr().c_str());
            Serial.printf("Port: %s\n", _nw_mqtt_port.getValueStr().c_str());
            Serial.printf("Connection to MQTT server %s:%d\n", _nw_mqtt_host.getValueStr().c_str(),
                          int(_nw_mqtt_port.getValueStr().toInt()));
            mqtt_handler.setup(_nw_mqtt_host.getValueStr().c_str(),
                               _nw_mqtt_port.getValueStr().toInt());
            mqtt_handler.send_client_info(_nw_account_username.getValueStr().c_str(),
                                          _nw_account_password.getValueStr().c_str(),
                                          _nw_account_email.getValueStr().c_str());
            a2dp_source.start("17942 SPEAKER");

            return true; // <-- return true to approve request, false to reject
        });

    // Start NetWizard
    _nw.autoConnect("Alina", "");

    // Check if configured
    if (_nw.isConfigured())
    {
        Serial.printf("Connection to MQTT server %s:%d\n", _nw_mqtt_host.getValueStr().c_str(),
                      int(_nw_mqtt_port.getValueStr().toInt()));
        mqtt_handler.setup(_nw_mqtt_host.getValueStr().c_str(),
                           _nw_mqtt_port.getValueStr().toInt());
        mqtt_handler.send_client_info(_nw_account_username.getValueStr().c_str(),
                                      _nw_account_password.getValueStr().c_str(),
                                      _nw_account_email.getValueStr().c_str());
        a2dp_source.start("17942 SPEAKER");
        Serial.println("Device is configured");
    }
    else
    {
        Serial.println("Device is not configured!");
    }

    // Start WebServer
    _server.begin();
}

void NetwizardHandler::loop()
{
    // Handle WebServer
    _server.handleClient();

    // NetWizard Loop Task
    _nw.loop();
}
