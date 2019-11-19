
var token = "";
var telegramUrl = "";
var webAppUrl = "";
var ssId = "";

function getMe() {
  var url = telegramUrl + "/getMe";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function getUpdates() {
  var url = telegramUrl + "/getUpdates";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function sendText(id,text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + text;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet(e) {
  return HtmlService.createHtmlOutput("Hello " + JSON.stringify(e));
}

function test() {
  Logger.log("test");
  SpreadsheetApp.openById(ssId).appendRow([2, 3, 4]);
}

function nivel(permissao) {
  if (permissao == 'VISITANTE') return 0;
  if (permissao == 'MORADOR') return 1;
  if (permissao == 'SINDICO') return 2;
  return -1;
}

function checaUsuario(house, id, permissao) {
  /*
   * Checa se o usuário com @id da casa house eh
   * possui a permissao especificada 
  */
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(house);
  var table = sheet.getDataRange().getValues();
  for (i = 0; i < table.length; i++) {
    // id na coluna 4, permissao na coluna 5
  	if (table[i][4].toString() == id) {
      var permissaoUsuario = table[i][5].toString();
      if (nivel(permissaoUsuario) >= nivel(permissaoRequerida)) {
        return true;
      } else {
        return false;
      }
    }  
  }
  return false;
}


function cadastrar(sheet, house, id, name, user, type, dataSaida) {
  //if (checaUsuario(house, id, "VISITANTE")) {
  //  return false;
  //} 
  sheet.appendRow([new Date(), id, name, user, type, dataSaida]);
  return true;
}

// a gente precisa saber o id do cara q pediu isso so e a casa dele
function listarCadastradosPorUsuario(sheet, house, user_id) {
  var table = sheet.getDataRange().getValues();
  var resultados = [];
  //Logger.log(user_id);
  for (i = 0; i < table.length; ++i) {
    // 2a coluna
    if (table[i][1].toString() == user_id.toString()) {
      // significa q user_id cadastrou esse cara
      // nome = 4a coluna
      resultados.push(table[i][3].toString());
    }
  }
  return resultados;
}

function existeCasa(house) {
  if (SpreadsheetApp.openById(ssId).getSheetByName(house)) return true;
  return false;
}
  
function remover(sheet, user) {
  //var sheet = SpreadsheetApp.openById(ssId).getSheetByName('casa');
  var table = sheet.getDataRange().getValues();
  for (i = 0; i < table.length; i++) {
    var now = table[i][3].toString();
    if (now == user.toString()) {
      sheet.deleteRow(parseInt(i + 1));
      return true;
    }
  }
  return false;
}


function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var text = contents.message.text;
  //GmailApp.sendEmail(Session.getEffectiveUser().getEmail(), "Telegram botbot Update", JSON.stringify(contents, null, 4));
  //GmailApp.sendEmail(Session.getEffectiveUser().getEmail(), "Telegram botbot Update", JSON.stringify(text, 4));
  var id = contents.message.from.id;
  var name = contents.message.from.first_name + " " + contents.message.from.last_name;
  
  if(/^@/.test(text)) {
    var msg = text.split(" ").join(" ");
    var command = msg.split(" ")[0];
    switch(command) {
      
      // @cadastrar casa fulano visitante 18/11/2019
      case "@cadastrar":
        var house = msg.split(" ")[1];
        var sheet = SpreadsheetApp.openById(ssId).getSheetByName(house) ? SpreadsheetApp.openById(ssId).getSheetByName(house) : SpreadsheetApp.openById(ssId).insertSheet(house);
        var user = msg.split(" ")[2];
        var type = msg.split(" ")[3];
        var dataSaida = msg.split(" ")[4];
        if (cadastrar(sheet, house, id, name, user, type, dataSaida)) {
  				sendText(id, "O usuário " + user + " foi cadastrado na residência " + house);
        } else {
  				sendText(id, "O usuário " + user + " já possui cadastro na residência " + house);
        }
        break;
        
      // @remover casa fulano
      case "@remover":
        var house = msg.split(" ")[1];
        var user = msg.split(" ")[2];
        if (existeCasa(house) == false) {
          sendText(id, "Residência não cadastrada");
          break;
        }
        var sheet = SpreadsheetApp.openById(ssId).getSheetByName(house) ? SpreadsheetApp.openById(ssId).getSheetByName(house) : SpreadsheetApp.openById(ssId).insertSheet(house);
       	if (remover(sheet, user)) {
      		sendText(id, "O usuário " + user + " foi removido da residência " + house);
        } else {
      		sendText(id, "O usuário " + user + " não está cadastrado na residência " + house);
        }
        break;
        
      // formato: @listar_usuarios casa
      case "@listar_usuarios":
        var args = msg.split(" ");
        if (args.length != 2) {
          sendText(id, "Comando invalido. Peça @help para saber os comandos disponiveis e o formato dos mesmos.");
        } else {
          var house = msg.split(" ")[1];
          var sheet = SpreadsheetApp.openById(ssId).getSheetByName(house) ? SpreadsheetApp.openById(ssId).getSheetByName(house) : SpreadsheetApp.openById(ssId).insertSheet(house);
          var cadastrados = listarCadastradosPorUsuario(sheet, house, id);
          var msg = "Os usuarios cadastrados por você foram:%0A";

          for (i = 0; i < cadastrados.length; i++) {
            msg += "- " + cadastrados[i].toString() + "%0A";
          }
          sendText(id, msg);
        }
        break;
      
      case "@help":
        sendText(id, "Para cadastrar um usuário: @cadastrar NomeDaResidência NomeDoUsuário Tipo(Morador/Visitante/Sindico) DataDeSaida(caso seja visitante)");
        sendText(id, "Para remover um usuário: @remover NomeDaResidência NomeDoUsuário");
        sendText(id, "Para abrir a porta: @abrirporta NomeDaResidência");
        break;
      default:
        sendText(id, "Comando não existe");
    } 
  }
  
}

/*
{
    "update_id": 68974813,
    "message": {
        "message_id": 10,
        "from": {
            "id": 789146317,
            "is_bot": false,
            "first_name": "Matheus",
            "last_name": "Leon",
            "language_code": "pt-br"
        },
        "chat": {
            "id": 789146317,
            "first_name": "Matheus",
            "last_name": "Leon",
            "type": "private"
        },
        "date": 1574018074,
        "text": "essa agora"
    }
}
*/
