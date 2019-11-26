#include <Arduino.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include <Servo.h>


class Gate{
public:
	Gate(int pin);
	void open();
	void close();
private:
	Servo atuador;
}

Gate::Gate(int pin){
	atuador.attach(pin);
}

void Gate::open(){
  	atuador.write(180);
}

void Gate::close(){
	atuador.write(90);
}

// Initialize Wifi connection to the router
char ssid[] = SSID;     // your network SSID (name)
char password[] = PASSWORD; // your network key
 
// Initialize Telegram BOT
#define BOTtoken TOKEN  // your Bot Token (Get from Botfather)

#define GATE_PIN 13

Gate gate(GATE_PIN);

WiFiClientSecure client;
UniversalTelegramBot bot(BOTtoken, client);
 
int Bot_mtbs = 1000; //mean time between scan messages
long Bot_lasttime;   //last time messages' scan has been done
 

void setup() {
  Serial.begin(115200);
 
  // Attempt to connect to Wifi network:
  Serial.print("Connecting Wifi: ");
  Serial.println(ssid);
 
  // Set WiFi to station mode and disconnect from an AP if it was Previously
  // connected
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

}
 
void loop() {
  if (millis() > Bot_lasttime + Bot_mtbs)  {
    int numNewMessages = bot.getUpdates(bot.last_message_received + 1);
 
    while(numNewMessages) {
      Serial.println("got response");
      
      for (int i=0; i<numNewMessages; i++) {
        if(bot.messages[i].text == "abre"){

          bot.sendMessage(bot.messages[i].chat_id, "abrindo", "");
		  gate.open();

        }else{

          bot.sendMessage(bot.messages[i].chat_id, "fechando", "");
		  gate.close();

        }
      }
      numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    }
 
    Bot_lasttime = millis();
  }
}
