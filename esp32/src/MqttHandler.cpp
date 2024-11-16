#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFiClient.h>

#include "MqttHandler.h"

const char caCert[] PROGMEM = R"EOF(-----BEGIN CERTIFICATE-----
MIID+TCCAuGgAwIBAgIUbHZXMwSEWWxvRvtlmdSbVE+y94AwDQYJKoZIhvcNAQEL
BQAwgYsxCzAJBgNVBAYTAkZSMQ4wDAYDVQQIDAVQYXJpczEOMAwGA1UEBwwFUGFy
aXMxDjAMBgNVBAoMBUFsaW5hMRMwEQYDVQQLDApBbGluYSBtcXR0MQ4wDAYDVQQD
DAVBbGluYTEnMCUGCSqGSIb3DQEJARYYc2VydmljZUBtYXNzaXZldXNhZ2UuY29t
MB4XDTI0MTExNTIzNTUyMVoXDTI5MTExNTIzNTUyMVowgYsxCzAJBgNVBAYTAkZS
MQ4wDAYDVQQIDAVQYXJpczEOMAwGA1UEBwwFUGFyaXMxDjAMBgNVBAoMBUFsaW5h
MRMwEQYDVQQLDApBbGluYSBtcXR0MQ4wDAYDVQQDDAVBbGluYTEnMCUGCSqGSIb3
DQEJARYYc2VydmljZUBtYXNzaXZldXNhZ2UuY29tMIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAp3vWVOxj4aSfUY+gyCzU6jfVVRoyHkdcIJnmIXjxfNoW
aaPCoIS+dWOGx4yCClKguZyWubUGC3MQ+u7cxPAd8pHNE0vqUruan7jNG/1cwayB
drWQVwUPyCAXvRVZ0fy0Ej/JCe/IdurrVStstq6yOIXMAEIAN6kTHKrkbe8Vcgtg
JtbqxNVAMgw2pRe5qsmg319IqlvmcTY9sA/9siCUV0Jo9ANYd0qmg3dDhrlE7OK7
WwCXxxtvNpa66hUEIV8SzsKzcGmqQ3j4AeHk4E2u8mIYI8VS5VU3yq5LJB4d3BCt
1ulbF4m6Ij40btXz3iIZdHqSY+GR/bNLVfnakS6SbQIDAQABo1MwUTAdBgNVHQ4E
FgQU4oY0BqgoklY1a0Ut97lSefcRdCMwHwYDVR0jBBgwFoAU4oY0BqgoklY1a0Ut
97lSefcRdCMwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAQhZu
ToD1f51AYQ+aaI0nKPTvSfCEdkXdVGNuv6xzCLCcK9HfpwFS8Jn7PAMWxOY2R82M
eeNfx7FKyuFs+K3o2+F96kJIiwzDEeS2+XwzlqAYFcjLZNkoOIWePexbw1RNWV2i
XL+I8idQ3yWu87iQ1s36QSOUGNWKGIHp/RrXk5MAf3wyI4/dZ1Wa1JiQuJ9N9t50
dHxIWheZlqIaLZg0kUgsZcuAHTICYNlPoQbrXa/hSnSYXToax+xM1Czc/CzCb0yB
FJsvT50fgLOJHdJAaChnuI34sujqqfz/RbxAHFphVoSiHUKBuaoJf3zHT4d5Oxms
nfDmhsuxhumdnYtuwA==
-----END CERTIFICATE-----
)EOF";

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
             "{\"id\":\"%012llx\",\"user\":\"%s\",\"pass\":\"%s\",\"email\":\"%s\"}",
             ESP.getEfuseMac(), user, pass, email);

    _client.publish("esp32/newClient", payload);
}
