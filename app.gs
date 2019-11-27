var token = "";
var telegramUrl = "";
var webAppUrl = "";
var ssId = "";

function sendText(id,text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + text;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet(e) {
  return HtmlService.createHtmlOutput("Hello " + JSON.stringify(e));
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

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var text = contents.message.text;
  var id = contents.message.from.id;
  var name = contents.message.from.first_name + " " + contents.message.from.last_name;
  
  if(/^@/.test(text)) {
    var args = text.split(" ");
    var command = args[0];

    switch(command) {
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
