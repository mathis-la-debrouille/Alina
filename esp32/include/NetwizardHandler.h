#pragma once
#include "MqttHandler.h"
#include <BluetoothA2DPSource.h>
#include <NetWizard.h>

class NetwizardHandler
{
private:
    WebServer _server;

    // Initialize NetWizard
    NetWizard _nw;
    NetWizardParameter _nw_mqtt_header;
    NetWizardParameter _nw_divider1;
    NetWizardParameter _nw_mqtt_host;
    NetWizardParameter _nw_mqtt_port;
    NetWizardParameter _nw_bluetooth_header;
    NetWizardParameter _nw_divider2;
    NetWizardParameter _nw_bluetooth_name;
    NetWizardParameter _nw_account_header;
    NetWizardParameter _nw_divider3;
    NetWizardParameter _nw_account_username;
    NetWizardParameter _nw_account_email;
    NetWizardParameter _nw_account_password;

public:
    NetwizardHandler();
    ~NetwizardHandler();
    void setup(MqttHandler &mqtt_handler, BluetoothA2DPSource &a2dp_source);
    void loop();
};
