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
      var test_result = testCadastrar(e.parameter.house, e.parameter.id, e.parameter.user, e.parameter.user_type, e.parameter.dataSaida);
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
  if (permissao == 'sindico') return 2;
  if (permissao == 'morador') return 1;
  if (permissao == 'visitante') return 0;
  return -1;
}

function checaUsuario(house, id, permissaoRequerida) {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(house);
  var table = sheet.getDataRange().getValues();
  sendText(id, "vamos testar!");
  for (i = 0; i < table.length; i++) {
  	if (table[i][1].toString() == id) {
      var permissaoUsuario = table[i][4].toString();
      sendText(id, permissaoUsuario);
      if (nivel(permissaoUsuario) >= nivel(permissaoRequerida)) {
        return true;
      } else {
        return false;
      }
    }  
  }
  return false;
}

function checaUsuarioUsername(house, username, permissaoRequerida) {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(house);
  var table = sheet.getDataRange().getValues();
  for (i = 0; i < table.length; i++) {
  	if (table[i][3].toString() == username) {
      var permissaoUsuario = table[i][4].toString();
      if (nivel(permissaoUsuario) >= nivel(permissaoRequerida)) {
        return true;
      } else {
        return false;
      }
    }  
  }
  return false;
}

function print_help(id) {
  sendText(id, "Para cadastrar um usuário: @cadastrar NomeDaResidência NomeDoUsuário Tipo(Morador/Visitante/Sindico) DataDeSaida(caso seja visitante). Obs: o nome do usuário não deve conter espaços, assim como o da residência.");
  sendText(id, "Para remover um usuário: @remover NomeDaResidência NomeDoUsuário. Obs: o nome do usuário não deve conter espaços.");
  sendText(id, "Para abrir a porta: @abrir_portao NomeDaResidência. Obs: o nome da residência não deve conter espaços");
  sendText(id, "Para listar os usuarios que voce cadastrou em uma casa: @listar_usuarios NomeDaResidência. Obs: o nome da residência não deve conter espaços");
  sendText(id, "Para efetivar seu registro: @registrar NomeDaResidência SeuNomeDeUsuário. Obs: o seu nome de usuário não deve conter espaços.");
}

function listarCadastradosPorUsuario(sheet, user_id) {
  var table = sheet.getDataRange().getValues();
  var resultados = [];
  for (i = 0; i < table.length; ++i) {
    if (table[i][2].toString() == user_id.toString()) {
      resultados.push(table[i][3].toString());
    }
  }
  return resultados;
}


function existeCasa(house) {
  if (SpreadsheetApp.openById(ssId).getSheetByName(house)) {
    return true;
  }
  return false;
}

function intervaloPermissao(tempo) {
  var tempo_string = tempo.substring(0, tempo.length - 1);
  var tempo_inteiro_milisegundos = parseInt(tempo_string);
  switch (tempo[tempo.length - 1]) {
    case 's':
      tempo_inteiro_milisegundos = tempo_inteiro_milisegundos * 1000;
      break;
    case 'm':
      tempo_inteiro_milisegundos = tempo_inteiro_milisegundos * 60 * 1000;
      break;
    case 'h':
      tempo_inteiro_milisegundos = tempo_inteiro_milisegundos * 3600 * 1000;
      break;
  }
  return tempo_inteiro_milisegundos;
}

function cadastrar(id, args) {
  var house = args[1];
  var user = args[2];
  var type = args[3];
  var dataSaida = "undefined";
  if (type == 'visitante') {
    var dataEntrada = new Date();
    dataSaida = new Date(dataEntrada.getTime() + intervaloPermissao(args[4]));
  }
  var sheet = getSheet(house);
  if (checaUsuarioUsername(house, user, 'visitante')) {
    sendText(id, "O usuário " + user + " já possui cadastro na residência " + house + ".");
    return;
  } 
  sheet.appendRow([new Date(), '', id, user, type, dataSaida]);
  sendText(id, "O usuário " + user + " foi cadastrado na residência " + house + ".");
}
  
function remover(id, args) {
  var [command, house, user] = args;
  var sheet = getSheet(house);
  var table = sheet.getDataRange().getValues();
  for (i = 0; i < table.length; i++) {
    if (table[i][3].toString() == user.toString()) {
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
  var cadastrados = listarCadastradosPorUsuario(sheet, id);
  var msg = "Os usuarios cadastrados por você foram:%0A";
  for (i = 0; i < cadastrados.length; i++) {
    msg += "- " + cadastrados[i].toString() + "%0A";
  }
  sendText(id, msg);
}

function printInvalido(id) {
  sendText(id, "Comando invalido. Digite @help para ver os comandos disponíveis e o formato correto de uso.");
}

function validarCadastrar(id, args) {
  if (args.length < 4) {
    printInvalido(id);
    return false;
  }
  var casa = args[1];
  var tipo = args[3];
  if (tipo == 'visitante' && args.length != 5) {
    printInvalido(id);
    return false;
  }
  if (tipo != 'visitante' && args.length != 4) {
    printInvalido(id);
    return false;
  }
  if (!existeCasa(casa)) {
    sendText(id, "Residência não cadastrada");
    return false;
  }
  if (!checaUsuario(casa, id, 'morador')) {
    sendText(id, "Você não tem permissão suficiente para usar este comando.");
    return false;
  }
  return true;
}

function validarRemover(id, args) {
  if (args.length != 3) {
    printInvalido(id);
    return false;
  }
  var casa = args[1];
  if (!existeCasa(casa)) {
    sendText(id, "Residência não cadastrada");
    return false;
  }
  if (!checaUsuario(casa, id, 'morador')) {
    sendText(id, "Você não tem permissão suficiente para usar este comando.");
    return false;
  }
  return true;
}

function validarListarUsuarios(id, args) {
  if (args.length != 2) {
    printInvalido(id);
    return false;
  }
  var casa = args[1];
  if (!existeCasa(casa)) {
    printInvalido(id);
    return false;
  }
  if (!checaUsuario(casa, id, 'morador')) {
    sendText(id, "Você não tem permissão suficiente para usar este comando.");
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

function validarAberturaPortao(id, args) {
  sendText(id, "cheguei");
  if (args.length != 2) {
    printInvalido(id);
    return false;
  }
  sendText(id, "args ok");
  var casa = args[1];
  sendText(id, "casa: " + casa);
  if (!existeCasa(casa)) {
    printInvalido(id);
    return false;
  }
  sendText(id, "args ok");
  sendText(id, "Oi!");
  if (!checaUsuario(casa, id, 'visitante')) {
    sendText(id, "Você não tem permissão suficiente para usar este comando.");
    return false;
  }
  return true;
}

function validarRegistrar(id, args) {
  if (args.length != 3) {
    printInvalido(id);
    return false;
  }
  var casa = args[1];
  var username = args[2];
  if (!existeCasa(casa)) {
    sendText(id, "A casa especificada nao existe. Tente novamente.");
    return false;
  }
  if (!checaUsuarioUsername(casa, username, 'visitante')) {
    sendText(id, "Voce nao esta cadastrado nesta casa. Tente novamente");
    return false;
  }
  return true;
}

function registrarUsuario(id, args) {
  var casa = args[1];
  var username = args[2];
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(casa);
  var table = sheet.getDataRange().getValues();
  for (i = 0; i < table.length; i++) {
  	if (table[i][3].toString() == username) {
      var linha = (i + 1).toString();
      var coluna = "B";
      var celula = coluna + linha;
      sheet.getRange(celula).setValue(id);
      sendText(id, "Seu cadastro foi efetivado com sucesso. :)");
      break;
    }  
  }
  return;
}

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var text = contents.message.text;
  var id = contents.message.from.id;
  
  if(/^@/.test(text)) {
    var args = text.split(" ");
    var command = args[0];

    switch(command) {
      case "@registrar":
        if (!validarRegistrar(id, args)) {
          break;
        }
        sendText(id, "ok");
        registrarUsuario(id, args);
        break;
      case "@abrir_portao":
        if (!validarAberturaPortao(id, args)) {
          break;
        }
        abrePortao();
        sendText(id, "Portão aberto.");
        Utilities.sleep(gateCloseTimeout);
        fechaPortao();
        sendText(id, "Portão fechado.");
        break;
      case "@cadastrar":    
        if (!validarCadastrar(id, args)) break;
        cadastrar(id, args);
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
        print_help(id);
        break;

      default:
        sendText(id, "Comando não existe. Digite @help para ver os comandos disponíveis.");
    } 
  }
}
