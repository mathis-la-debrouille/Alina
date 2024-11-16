#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFiClient.h>

#include "MqttHandler.h"

const char caCert[] PROGMEM = R"EOF(REDACTED)EOF";

MqttHandler::MqttHandler() : _client(_espClient) {}

MqttHandler::~MqttHandler() {}

void callback(char *topic, byte *message, unsigned int length)
{
    Serial.print("Message arrived on topic: ");
    Serial.print(topic);
    Serial.print(". Message: ");

    SoundData *data = new OneChannelSoundData();
    data->setDataRaw(message, length);

    // Wait for the buffer to be empty
    while (a2dp_source.has_sound_data())
        ;
    a2dp_source.write_data(data);
}

void MqttHandler::setup(const char *host, uint16_t port)
{
    char uuid[16];

    snprintf(uuid, sizeof(uuid), "%012llx", ESP.getEfuseMac());
    clientId = "ESP32-" + String(uuid);
    _espClient.setCACert(caCert);
    _client.setServer(host, port);
    _client.setCallback(callback);
}

void MqttHandler::reconnect()
{
    // Loop until we're reconnected
    while (!_client.connected())
    {
        Serial.print("Attempting MQTT connection...");
        // Attempt to connect
        if (_client.connect(clientId.c_str()))
        {
            Serial.println("connected");
            // Subscribe
            _client.subscribe(String(clientId + "/audio_receive").c_str());
        }
        else
        {
            Serial.print("failed, rc=");
            Serial.print(_client.state());
            Serial.println(" try again in 5 seconds");
            // Wait 5 seconds before retrying
            delay(5000);
        }
    }
}

void MqttHandler::loop()
{
    if (!_client.connected())
    {
        reconnect();
        Serial.println("Out of reconnect");
    }
    _client.loop();
}

void MqttHandler::send_client_info(const char *user, const char *pass, const char *email)
{
    char payload[512];
    if (!_client.connected())
    {
        reconnect();
    }
    snprintf(payload, sizeof(payload),
             "{\"id\":\"%s\",\"user\":\"%s\",\"pass\":\"%s\",\"email\":\"%s\"}",
             clientId, user, pass, email);

    _client.publish("esp32/newClient", payload);
}
