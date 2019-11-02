#include <Arduino.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include <Servo.h>

Servo myservo;
 
// Initialize Wifi connection to the router
char ssid[] = "CINGUESTS";     // your network SSID (name)
char password[] = "acessocin"; // your network key
 
// Initialize Telegram BOT
#define BOTtoken "994645514:AAHnJmkCmiXDroPH0HeHJ3L1vqCoSIdehY0"  // your Bot Token (Get from Botfather)
 
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
  myservo.attach(13);
}
 
void loop() {
  if (millis() > Bot_lasttime + Bot_mtbs)  {
    int numNewMessages = bot.getUpdates(bot.last_message_received + 1);
 
    while(numNewMessages) {
      Serial.println("got response");
      
      for (int i=0; i<numNewMessages; i++) {
        if(bot.messages[i].text == "abre"){
          Serial.println("abrindo");
                  bot.sendMessage(bot.messages[i].chat_id, "abrindo", "");

          myservo.write(180);
        }else{
          Serial.println("fechando");
                  bot.sendMessage(bot.messages[i].chat_id, "fechando", "");

          myservo.write(90);
        }
      }
      numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    }
 
    Bot_lasttime = millis();
  }
}
