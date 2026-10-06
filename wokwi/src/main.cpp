#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define TRIG_PIN 5
#define ECHO_PIN 18
#define LED_PIN 2

#define TANK_HEIGHT_CM 100.0

// =========================
// WiFi
// =========================
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// =========================
// MQTT
// =========================
const char* MQTT_SERVER = "test.mosquitto.org";
const int MQTT_PORT = 1883;

const char* MQTT_TOPIC =
    "aquaguard/hostel/A/block/A2/tank/01/readings";

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

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

        Serial.print("Connecting to MQTT...");

        String clientId =
            "AquaGuard-ESP32-" +
            String(random(0xffff), HEX);

        if (mqttClient.connect(clientId.c_str())) {

            Serial.println("connected!");

        } else {

            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" retrying...");

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
// Simulation
// =========================
float getSimulationTime() {

    unsigned long elapsed =
        millis() / 1000;

    return elapsed % 150;
}

// =========================
// pH simulation
// =========================
float simulatePH(float t) {

    if (t < 30)
        return 7.2;

    if (t < 60)
        return 7.2 - ((t - 30) * 0.01);

    if (t < 90)
        return 6.9 - ((t - 60) * 0.015);

    if (t < 120)
        return 6.45 - ((t - 90) * 0.005);

    return 7.1;
}

// =========================
// TDS simulation
// =========================
float simulateTDS(float t) {

    if (t < 30)
        return 280;

    if (t < 60)
        return 280 + ((t - 30) * 2.0);

    if (t < 90)
        return 340 + ((t - 60) * 4.0);

    if (t < 120)
        return 460 + ((t - 90) * 2.0);

    return 285;
}

// =========================
// Turbidity simulation
// =========================
float simulateTurbidity(float t) {

    if (t < 30)
        return 1.0;

    if (t < 60)
        return 1.0 + ((t - 30) * 0.05);

    if (t < 90)
        return 2.5 + ((t - 60) * 0.12);

    if (t < 120)
        return 6.1 + ((t - 90) * 0.06);

    return 1.1;
}

// =========================
// Temperature simulation
// =========================
float simulateTemperature(float t) {

    if (t < 60)
        return 25.0;

    if (t < 120)
        return 25.0 + ((t - 60) * 0.03);

    return 25.2;
}

// =========================
// Flow simulation
// =========================
float simulateFlowRate(float t) {

    if (t < 60)
        return 2.0;

    if (t < 90)
        return 2.2;

    if (t < 120)
        return 3.5;

    return 2.0;
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

    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(LED_PIN, OUTPUT);

    randomSeed(micros());

    mqttClient.setServer(
        MQTT_SERVER,
        MQTT_PORT
    );

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

    // Sensor values
    float temperature =
        simulateTemperature(t);

    float ph =
        simulatePH(t);

    float tds =
        simulateTDS(t);

    float turbidity =
        simulateTurbidity(t);

    float waterLevel =
        readWaterLevel();

    float flowRate =
        simulateFlowRate(t);

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
        "\"tank_id\":\"A2-ROOF-01\","
        "\"simulation_time\":%.0f,"
        "\"temperature\":%.2f,"
        "\"ph\":%.2f,"
        "\"tds\":%.1f,"
        "\"turbidity\":%.2f,"
        "\"water_level\":%.1f,"
        "\"flow_rate\":%.2f,"
        "\"risk_score\":%d"
        "}",

        t,
        temperature,
        ph,
        tds,
        turbidity,
        waterLevel,
        flowRate,
        risk
    );

    // =========================
    // Publish
    // =========================

    bool published =
        mqttClient.publish(
            MQTT_TOPIC,
            payload
        );

    Serial.print("MQTT publish: ");

    if (published)
        Serial.println("SUCCESS");
    else
        Serial.println("FAILED");

    Serial.print("Payload: ");
    Serial.println(payload);

    delay(2000);
}
