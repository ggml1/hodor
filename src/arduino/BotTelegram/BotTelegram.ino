#include <Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <cstring>

#define GATE_PIN 13
#define OPEN_GATE 180
#define CLOSE_GATE 90
#define SERIAL_PORT 115200
#define QUERY_TIMEOUT 3000
#define WIFI_RETRY_TIMEOUT 500
#define ARDUINO_SETUP_DELAY 10000

// WiFi parameters
const char* ssid     = "";
const char* password = "";

char *cleanUp(const char str[], char str2[]) {
    char *pch = NULL;
    pch = strstr(str,"Estado:");
    int i = 7;

    if (pch != NULL) {    
      while (*(pch + i) != '\\') {
        i++;  
      }
      strncpy(str2, pch + 7, i - 7);
    }
    strcat(str2,"\0");
    strcat(str2,"\0");

    return str2;
}

class Gate {
public:
  Gate(int pin);
  void open();
  void close();
private:
  Servo atuador;
};

Gate::Gate(int pin) {
  atuador.attach(pin);
}

void Gate::open() {
  atuador.write(OPEN_GATE);
}

void Gate::close() {
  atuador.write(CLOSE_GATE);
}

Gate gate(GATE_PIN);

// Setup
void setup() {
  // Init the serial port
  Serial.begin(SERIAL_PORT);
  delay(ARDUINO_SETUP_DELAY);

  // Connect to a WiFi network
  connect_to_wifi();
}

// Main loop
void loop() {
  HTTPClient http;
  http.begin(GAS_EXEC_URL);
  int httpCode = http.GET();

  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println(httpCode);
    char str2[50] = " ";
    cleanUp(payload.c_str(),str2);
    
    Serial.println(str2);
    if (!strcmp(str2, "Ligado")) {
      Serial.println("Ligado");
      gate.open();
    } else {
      Serial.println("Desligado");
      gate.close();
    }
  } else {
    Serial.println("ERROR on HTTP request");
  }
  
  http.end();
  delay(QUERY_TIMEOUT);
}

// Simple function to connect to a WiFi network.
void connect_to_wifi() {
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(WIFI_RETRY_TIMEOUT);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
