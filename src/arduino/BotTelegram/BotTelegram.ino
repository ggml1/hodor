// Includes
#include <Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <cstring>
//

// WiFi parameters
const char* ssid     = "";
const char* password = "";

char *cleanUp(const char str[], char str2[]){
    char *pch = NULL;
    pch = strstr(str,"Estado:");
    int i=7;

    if(pch != NULL){    
      while(*(pch+i) != '\\'){
        i++;  
      }
      strncpy (str2,(pch+7),i-7);
    }
    strcat(str2,"\0");
    strcat(str2,"\0");

    return str2;
}

class Gate{
public:
  Gate(int pin);
  void open();
  void close();
private:
  Servo atuador;
};

Gate::Gate(int pin){
  atuador.attach(pin);
}

void Gate::open(){
  atuador.write(180);
}

void Gate::close(){
  atuador.write(90);
}

#define GATE_PIN 13

Gate gate(GATE_PIN);



// Setup
void setup()
{

  // Init the serial port
  Serial.begin(115200);
  delay(10000);

  // Connect to a WiFi network
  connect_to_wifi();
}


// Main loop
void loop()
{
  HTTPClient http;
  http.begin("https://script.google.com/macros/s/AKfycbzaAZO7H-PnI6f-TDYNhC6VVSQFymdRjdatkMqcnN6gRHl9Tefi/exec?type=statusportao");
  int httpCode = http.GET();

  if(httpCode > 0){
    String payload = http.getString();
    Serial.println(httpCode);
    char str2[50] = " ";
    cleanUp(payload.c_str(),str2);
    
    Serial.println(str2);
    if(!strcmp(str2,"Ligado")){
      Serial.println("Ligado");
      gate.open();
    }else{
      Serial.println("Desligado");
      gate.close();
    }
  }else{
    Serial.println("ERROR on HTTP request");
  }
  
  http.end();
  delay(3000);
}





// Simple function to connect to a WiFi network.
void connect_to_wifi() {
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
