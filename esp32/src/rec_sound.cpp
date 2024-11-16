#include "Arduino.h"
#include "I2S.h"
#include "Wav.h"
#include <FS.h>
#include <LittleFS.h>

#define I2S_MODE I2S_MODE_ADC_BUILT_IN

const int record_time = 3; // second
const char filename[] = "/audio.wav";

const int headerSize = 44;
const int waveDataSize = record_time * 88000;
const int numCommunicationData = 8000;
const int numPartWavData = numCommunicationData / 4;
byte header[headerSize];
char communicationData[numCommunicationData];
char partWavData[numPartWavData];
File file;

bool record_mic()
{
    create_wav_header(header, waveDataSize);

    // Remove previous version of the record
    LittleFS.remove(filename);

    file = LittleFS.open(filename, FILE_WRITE, true);
    if (!file)
        return false;

    file.write(header, headerSize);

    i2s_init(I2S_MODE, I2S_BITS_PER_SAMPLE_32BIT);

    Serial.println("Start recording...");
    for (int j = 0; j < waveDataSize / numPartWavData; ++j)
    {
        i2s_read(communicationData, numCommunicationData);
        for (int i = 0; i < numCommunicationData / 8; ++i)
        {
            partWavData[2 * i] = communicationData[8 * i + 2];
            partWavData[2 * i + 1] = communicationData[8 * i + 3];
        }
        file.write((const byte *)partWavData, numPartWavData);
    }

    file.close();
    return true;
}