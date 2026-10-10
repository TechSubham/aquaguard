#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define TEMP_PIN 4
#define PH_PIN 34
#define TDS_PIN 35
#define TURBIDITY_PIN 32
#define TRIG_PIN 5
#define ECHO_PIN 18
#define LED_PIN 2

#define TANK_HEIGHT_CM 100.0
#define ADC_MAX 4095.0

// =========================
// WiFi
// =========================
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// =========================
// MQTT
// =========================
const int MQTT_PORT = 1883;
IPAddress MQTT_BROKERS[] = {
    IPAddress(35, 157, 128, 15),
    IPAddress(3, 121, 14, 149),
    IPAddress(3, 122, 213, 173)
};
const int MQTT_BROKER_COUNT = sizeof(MQTT_BROKERS) / sizeof(MQTT_BROKERS[0]);

const char* MQTT_TOPIC = "aquaguard/A2-ROOF-01/telemetry/readings";

// =========================
// Configuration
// =========================
const char* TANK_ID = "A2-ROOF-01";
const char* FIRMWARE_VERSION = "wokwi-live-sensors-v2";
const unsigned long TELEMETRY_INTERVAL_MS = 5000;
const uint16_t MQTT_BUFFER_SIZE = 768;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
OneWire oneWire(TEMP_PIN);
DallasTemperature tempSensor(&oneWire);
float phRaw = 0.0;
float tdsRaw = 0.0;
float turbidityRaw = 0.0;
int mqttBrokerIndex = 0;

String formatIp(IPAddress ip) {
    return String(ip[0]) + "." + String(ip[1]) + "." + String(ip[2]) + "." + String(ip[3]);
}

// =========================
// Connect WiFi
// =========================
void connectWiFi() {

    Serial.print("Connecting to WiFi");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi connected!");

    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}

// =========================
// Connect MQTT
// =========================
void connectMQTT() {

    while (!mqttClient.connected()) {

        IPAddress broker = MQTT_BROKERS[mqttBrokerIndex];
        mqttClient.setServer(broker, MQTT_PORT);

        Serial.print("Connecting to MQTT ");
        Serial.print(formatIp(broker));
        Serial.print("...");

        String clientId =
            "AquaGuard-ESP32-" +
            String(random(0xffff), HEX) +
            "-" +
            String(millis(), HEX);

        if (mqttClient.connect(clientId.c_str())) {

            Serial.println("connected!");

        } else {

            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" retrying...");

            mqttBrokerIndex = (mqttBrokerIndex + 1) % MQTT_BROKER_COUNT;
            delay(3000);
        }
    }
}

// =========================
// Water level
// =========================
float readWaterLevel() {

    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);

    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);

    digitalWrite(TRIG_PIN, LOW);

    long duration =
        pulseIn(ECHO_PIN, HIGH, 30000);

    if (duration == 0) {
        return 75.0;
    }

    float distance =
        duration * 0.0343 / 2.0;

    float level =
        ((TANK_HEIGHT_CM - distance)
        / TANK_HEIGHT_CM) * 100.0;

    return constrain(level, 0.0, 100.0);
}

// =========================
// Analog virtual sensors
// =========================
float readAnalogAverage(int pin) {

    long total = 0;

    for (int i = 0; i < 10; i++) {
        total += analogRead(pin);
        delay(5);
    }

    return total / 10.0;
}

float readTemperature() {
    tempSensor.requestTemperatures();
    float value = tempSensor.getTempCByIndex(0);
    if (value == DEVICE_DISCONNECTED_C) {
        return 25.0;
    }
    return value;
}

float readPH() {
    phRaw = readAnalogAverage(PH_PIN);
    return constrain((phRaw / ADC_MAX) * 14.0, 0.0, 14.0);
}

float readTDS() {
    tdsRaw = readAnalogAverage(TDS_PIN);
    return constrain((tdsRaw / ADC_MAX) * 1000.0, 0.0, 1000.0);
}

float readTurbidity() {
    turbidityRaw = readAnalogAverage(TURBIDITY_PIN);
    return constrain((turbidityRaw / ADC_MAX) * 10.0, 0.0, 10.0);
}

float readFlowRate(float waterLevel) {
    return waterLevel > 5.0 ? 2.0 + ((100.0 - waterLevel) / 100.0) * 4.0 : 0.0;
}

float getSimulationTime() {
    return millis() / 1000;
}

// =========================
// Risk calculation
// =========================
int calculateRisk(
    float ph,
    float tds,
    float turbidity
) {

    int risk = 0;

    if (ph < 6.5 || ph > 8.5)
        risk += 35;
    else if (ph < 6.8 || ph > 8.2)
        risk += 15;

    if (tds > 500)
        risk += 30;
    else if (tds > 400)
        risk += 20;
    else if (tds > 350)
        risk += 10;

    if (turbidity > 6)
        risk += 35;
    else if (turbidity > 3)
        risk += 20;
    else if (turbidity > 2)
        risk += 10;

    return constrain(risk, 0, 100);
}

// =========================
// Setup
// =========================
void setup() {

    Serial.begin(115200);
    Serial.setDebugOutput(true);
    delay(500);
    Serial.println();
    Serial.println("BOOT: AquaGuard Wokwi firmware started");
    Serial.print("AquaGuard simulator | tank: ");
    Serial.println(TANK_ID);

    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(LED_PIN, OUTPUT);
    pinMode(PH_PIN, INPUT);
    pinMode(TDS_PIN, INPUT);
    pinMode(TURBIDITY_PIN, INPUT);

    analogReadResolution(12);
    analogSetAttenuation(ADC_11db);
    tempSensor.begin();

    randomSeed(micros());

    mqttClient.setBufferSize(MQTT_BUFFER_SIZE);

    connectWiFi();
}

// =========================
// Loop
// =========================
void loop() {

    if (!mqttClient.connected()) {
        connectMQTT();
    }

    mqttClient.loop();

    // Simulation time
    float t = getSimulationTime();

    // Sensor values from Wokwi virtual inputs
    float temperature =
        readTemperature();

    float ph =
        readPH();

    float tds =
        readTDS();

    float turbidity =
        readTurbidity();

    float waterLevel =
        readWaterLevel();

    float flowRate =
        readFlowRate(waterLevel);

    int risk =
        calculateRisk(
            ph,
            tds,
            turbidity
        );

    // High-risk indicator
    digitalWrite(
        LED_PIN,
        risk >= 60 ? HIGH : LOW
    );

    // =========================
    // Create JSON
    // =========================

    char payload[512];

    snprintf(
        payload,
        sizeof(payload),

        "{"
        "\"tank_id\":\"%s\","
        "\"firmware_version\":\"%s\","
        "\"sensor_source\":\"wokwi-live-inputs\","
        "\"simulation_time\":%.0f,"
        "\"temperature\":%.2f,"
        "\"ph\":%.2f,"
        "\"tds\":%.1f,"
        "\"turbidity\":%.2f,"
        "\"water_level\":%.1f,"
        "\"flow_rate\":%.2f,"
        "\"risk_score\":%d,"
        "\"raw_ph_adc\":%.0f,"
        "\"raw_tds_adc\":%.0f,"
        "\"raw_turbidity_adc\":%.0f"
        "}",
        
        TANK_ID,
        FIRMWARE_VERSION,
        t,
        temperature,
        ph,
        tds,
        turbidity,
        waterLevel,
        flowRate,
        risk,
        phRaw,
        tdsRaw,
        turbidityRaw
    );

    // =========================
    // Publish
    // =========================

    bool published =
        mqttClient.publish(
            MQTT_TOPIC,
            payload
        );

    Serial.println();
    Serial.println("========== Telemetry ==========");
    Serial.print("  tank_id:          ");
    Serial.println(TANK_ID);
    Serial.print("  firmware:         ");
    Serial.println(FIRMWARE_VERSION);
    Serial.print("  simulation_time:  ");
    Serial.println(t, 0);
    Serial.print("  temperature (C):  ");
    Serial.println(temperature, 2);
    Serial.print("  ph:               ");
    Serial.println(ph, 2);
    Serial.print("  tds (ppm):        ");
    Serial.println(tds, 1);
    Serial.print("  turbidity (NTU):  ");
    Serial.println(turbidity, 2);
    Serial.print("  raw_adc pH/TDS/T: ");
    Serial.print(phRaw, 0);
    Serial.print(" / ");
    Serial.print(tdsRaw, 0);
    Serial.print(" / ");
    Serial.println(turbidityRaw, 0);
    Serial.print("  water_level (%):  ");
    Serial.println(waterLevel, 1);
    Serial.print("  flow_rate:        ");
    Serial.println(flowRate, 2);
    Serial.print("  risk_score:       ");
    Serial.println(risk);
    Serial.print("  mqtt_topic:       ");
    Serial.println(MQTT_TOPIC);
    Serial.print("  mqtt_connected:   ");
    Serial.println(mqttClient.connected() ? "YES" : "NO");
    Serial.print("  mqtt_state:       ");
    Serial.println(mqttClient.state());
    Serial.print("  payload_bytes:    ");
    Serial.println(strlen(payload));
    Serial.print("  mqtt_buffer:      ");
    Serial.println(MQTT_BUFFER_SIZE);
    Serial.print("  mqtt_publish:     ");
    Serial.println(published ? "SUCCESS" : "FAILED");
    Serial.print("  json:             ");
    Serial.println(payload);
    Serial.println("================================");

    delay(TELEMETRY_INTERVAL_MS);
}
