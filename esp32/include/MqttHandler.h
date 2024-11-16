#pragma once

#include <BluetoothA2DPSource.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

extern BluetoothA2DPSource a2dp_source;

class MqttHandler
{
private:
    WiFiClientSecure _espClient;

public:
    PubSubClient _client;
    String clientId;

    MqttHandler();
    ~MqttHandler();
    void setup(const char *host, uint16_t port);
    void reconnect();
    void loop();
    void send_client_info(const char *user, const char *pass, const char *email);
};
