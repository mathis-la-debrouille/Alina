/*
  ------------------------
  NetWizard - Demo Example
  ------------------------

  Skill Level: Beginner

  This example provides with a bare minimal app with
  NetWizard WiFi manager and captive portal functionality.

  Github: https://github.com/ayushsharma82/NetWizard
  WiKi: https://docs.netwizard.pro

  Works with following hardware:
  - ESP32
  - RP2040+W (Example: Raspberry Pi Pico W)

  Important note for RP2040 users:
  - RP2040 requires LittleFS partition for saving credentials.
    Without LittleFS partition, the app will fail to persist any data.
    Make sure to select Tools > Flash Size > "2MB (Sketch 1MB, FS 1MB)" option.
  - Doesn't work with bare RP2040, it requires WiFi module/chip (network co-processor)
    like in Pico W for NetWizard to work.

  -------------------------------

  Upgrade to NetWizard Pro: https://netwizard.pro
*/

#include <Arduino.h>
#include <BluetoothA2DPSource.h>
#include <LittleFS.h>

#include "MqttHandler.h"
#include "NetwizardHandler.h"
#include "RecSound.h"

BluetoothA2DPSource a2dp_source;

MqttHandler mqtt_handler;
NetwizardHandler netwizard_handler;

#define RECORDING_BUTTON 35
#define MICRO_INPUT 34
#define RECORDING_LED 4
#define BUFFER_SIZE 2048

// EspClass ESP;

void setup(void)
{
    delay(1000);

    if (!LittleFS.begin(true))
    {
        Serial.println("LittleFS Mount Failed");
        return;
    }
    Serial.begin(115200);
    Serial.println("");
    Serial.println("Starting NetWizard Demo...");
    pinMode(RECORDING_BUTTON, INPUT);
    pinMode(MICRO_INPUT, INPUT);
    pinMode(RECORDING_LED, OUTPUT);
    netwizard_handler.setup(mqtt_handler, a2dp_source);
    Serial.printf("\nCHIP MAC: %012llx\n", ESP.getEfuseMac());
}

void loop(void)
{
    netwizard_handler.loop();

    mqtt_handler.loop();

    if (digitalRead(RECORDING_BUTTON) == HIGH)
    {
        digitalWrite(RECORDING_LED, HIGH);
        if (record_mic())
        {
            File file = LittleFS.open("/audio.wav");
            Serial.print("Size = ");
            Serial.println(file.size());
            uint8_t buffer[BUFFER_SIZE];
            mqtt_handler._client.beginPublish(String(mqtt_handler.clientId + "/audio_send").c_str(),
                                              file.size(), false);
            while (file.available())
            {
                size_t bytesRead = file.read((uint8_t *)buffer, BUFFER_SIZE);
                Serial.print("Writing nb bytes = ");
                Serial.println(bytesRead);
                size_t retSize = mqtt_handler._client.write(buffer, bytesRead);
                if (retSize != bytesRead)
                {
                    Serial.println("Publish failed");
                    Serial.print("Ret Size = ");
                    Serial.println(retSize);
                    break;
                }
            }
            file.close();

            if (!mqtt_handler._client.endPublish())
            {
                Serial.println("An error occured when sending the packet");
            }
        }
        digitalWrite(4, LOW);
    }
    delay(1);
}
