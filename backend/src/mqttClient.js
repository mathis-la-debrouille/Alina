const mqtt = require('mqtt');
const fs = require('fs');

// MQTT Configuration
const mqttOptions = {
  protocol: 'mqtts', // Secure protocol
  host: 'mqtt.alina.massiveusage.com',
  port: 8883,
  ca: [fs.readFileSync('/home/ubuntu/alina/ca.crt')],
};

const mqttClient = mqtt.connect(mqttOptions);

// Log connection events
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

module.exports = mqttClient;
