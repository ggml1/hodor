var token = "TELEGRAM_BOT_TOKEN";
var telegramUrl = "TELEGRAM_BOT_API_URL";
var webAppUrl = "GS_WEBAPP_URL";
var ssId = "SPREADSHEET_ID";
var gateStatusSheet = 'GATE_STATUS_SHEET_NAME';
var gateStatusCell = 'GATE_STATUS_CELL';
var gateCloseTimeout = 6000;

function sendText(id, text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + text;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function checaStatusPortao() {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(gateStatusSheet);
  var statusPortao = sheet.getRange(gateStatusCell).getValue(); //valor da celula que guarda o estado do portão se Ligado ou Desligado
  return HtmlService.createHtmlOutput('<p><br>' + 'Estado:' + statusPortao + '<br></b>');
}

function doGet(e) {
  var request_type = e.parameter.type || "Health check";
  var response;
  switch (request_type) {
    case "healthcheck":
      response = ContentService.createTextOutput(JSON.stringify({msg: "Endpoint is working!"}));
      break;
    case "integrationtest":
      var test_result = run();
      if (test_result == false) {
        response = ContentService.createTextOutput(JSON.stringify({msg: "False"}));
      } else {
        response = ContentService.createTextOutput(JSON.stringify({msg: "True"}));
      } 
      break;
    case "testcadastrar":
      var test_result = testCadastrar(e.parameter.house, e.parameter.id, e.parameter.name, e.parameter.user, e.parameter.user_type, e.parameter.dataSaida);
      if (test_result == false) {
        response = ContentService.createTextOutput(JSON.stringify({msg: "False"}));
      } else {
        response = ContentService.createTextOutput(JSON.stringify({msg: "True"}));
      }
      break;
    case "testremover":
      var test_result = testRemover(e.parameter.id, e.parameter.house, e.parameter.user);
      if (test_result == false) {
        response = ContentService.createTextOutput(JSON.stringify({msg: "False"}));
      } else {
        response = ContentService.createTextOutput(JSON.stringify({msg: "True"}));
      }
      break;
    case "testlistarregistrados":
      var test_result = testListarRegistrados(e.parameter.house, e.parameter.id);
      if (test_result == false) {
        response = ContentService.createTextOutput(JSON.stringify({msg: "False"}));
      } else {
        response = ContentService.createTextOutput(JSON.stringify({msg: "True"}));
      }
      break;
    case "statusportao":
      response = checaStatusPortao();
      break;
    default:
      response = ContentService.createTextOutput(JSON.stringify({msg: "Hello!"}));
      break;
  }  
  return response;
}

function getSheet(house) {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(house) ? SpreadsheetApp.openById(ssId).getSheetByName(house) : SpreadsheetApp.openById(ssId).insertSheet(house);
  return sheet;
}

function nivel(permissao) {
  if (permissao == 'VISITANTE') return 0;
  if (permissao == 'MORADOR') return 1;
  if (permissao == 'SINDICO') return 2;
  return -1;
}

function checaUsuario(house, id, permissao) {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(house);
  var table = sheet.getDataRange().getValues();
  for (i = 0; i < table.length; i++) {
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

function print_help() {
  sendText(id, "Para cadastrar um usuário: @cadastrar NomeDaResidência NomeDoUsuário Tipo(Morador/Visitante/Sindico) DataDeSaida(caso seja visitante)");
  sendText(id, "Para remover um usuário: @remover NomeDaResidência NomeDoUsuário");
  sendText(id, "Para abrir a porta: @abrirporta NomeDaResidência");
}

function listarCadastradosPorUsuario(sheet, house, user_id) {
  var table = sheet.getDataRange().getValues();
  var resultados = [];
  for (i = 0; i < table.length; ++i) {
    if (table[i][1].toString() == user_id.toString()) {
      resultados.push(table[i][3].toString());
    }
  }
  return resultados;
}

function existeCasa(house) {
  if (SpreadsheetApp.openById(ssId).getSheetByName(house)) return true;
  return false;
}

function cadastrar(id, name, args) {
  var [command, house, user, type, dataSaida] = args;
  var sheet = getSheet(house);
  if (checaUsuario(house, id, "VISITANTE")) {
    sendText(id, "O usuário " + user + " já possui cadastro na residência " + house);
    return;
  } 
  sheet.appendRow([new Date(), id, name, user, type, dataSaida]);
  sendText(id, "O usuário " + user + " foi cadastrado na residência " + house);
}
  
function remover(id, args) {
  var [command, house, user] = args;
  var sheet = getSheet(house);
  var table = sheet.getDataRange().getValues();
  for (i = 0; i < table.length; i++) {
    var now = table[i][3].toString();
    if (now == user.toString()) {
      sheet.deleteRow(parseInt(i + 1));
      sendText(id, "O usuário " + user + " foi removido da residência " + house);
      return;
    }
  }
  sendText(id, "O usuário " + user + " não está cadastrado na residência " + house);
}

function listarUsuarios(id, args) {
  var [command, house] = args
  var sheet = getSheet(house);
  var cadastrados = listarCadastradosPorUsuario(sheet, house, id);
  var msg = "Os usuarios cadastrados por você foram:%0A";
  for (i = 0; i < cadastrados.length; i++) {
    msg += "- " + cadastrados[i].toString() + "%0A";
  }
  sendText(id, msg);
}

function printInvalido() {
  sendText(id, "Comando invalido. Digite @help para saber os comandos disponiveis");
}

function validarCadastrar(id, args) {
  if (args.length < 4) {
    printInvalido();
    return false;
  }
  else if (!existeCasa(args[1])) {
    sendText(id, "Residência não cadastrada");
    return false;
  }
  return true;
}

function validarRemover(id, args) {
  if (args.length != 3) {
    printInvalido();
    return false;
  }
  else if (!existeCasa(args[1])) {
    sendText(id, "Residência não cadastrada");
    return false;
  }
  return true;
}

function validarListarUsuarios(id, args) {
  if (args.length != 2) {
    printInvalido();
    return false;
  }
  return true;
}

function abrePortao() {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(gateStatusSheet);
  sheet.getRange(gateStatusCell).setValue("Ligado");
  SpreadsheetApp.flush();
}

function fechaPortao() {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(gateStatusSheet);
  sheet.getRange(gateStatusCell).setValue("");
  SpreadsheetApp.flush();
}

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var text = contents.message.text;
  var id = contents.message.from.id;
  var name = contents.message.from.first_name + " " + contents.message.from.last_name;
  
  if(/^@/.test(text)) {
    var args = text.split(" ");
    var command = args[0];

    switch(command) {
      case "@abrir_portao":
        abrePortao();
        sendText(id, "Portão aberto. Ele será fechado em instantes.");
        Utilities.sleep(gateCloseTimeout);
        fechaPortao();
        sendText(id, "Portão fechado.");
        break;
      case "@cadastrar":    
        if (!validarCadastrar(id, args)) break;
        cadastrar(id, name, args);
        break;
        
      case "@remover":
        if (!validarRemover(id, args)) break;
        remover(id, args)
        break;
        
      case "@listar_usuarios":
        if (!validarListarUsuarios(id, args)) break;
        listarUsuarios(id, args);
        break;
      
      case "@help":
        print_help();
        break;

      default:
        sendText(id, "Comando não existe");
    } 
  }
}
