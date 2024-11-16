#pragma once
#include <Arduino.h>

// 16bit, monoral, 44100Hz,  linear PCM
void create_wav_header(byte *header, int waveDataSize); // size of header is 44