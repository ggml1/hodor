var ssId = "";

function testCadastrar(house, id, name, user, type, dataSaida) {
  var args = ["cadastrar", house, user, type, dataSaida];
  cadastrar(id, name, args);
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(String(house));
  var table = sheet.getDataRange().getValues();
  var vec = [id, name, user, type, dataSaida];
  var found = false;
  for (i = 0; i < table.length; i++) {
	var eq = true;
    for (j = 0; j < 5; j++) {
      if (table[i][j + 1] != vec[j]) {
        eq = false;
      }
    }
    if (eq == true) {
    	found = true;
    }
    //found |= eq;
  }
  return found;
}

function testListarRegistrados(house, id) {
  var args = ["listar_usuarios", house];
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(String(house));
  var resultadosObtidos = listarCadastradosPorUsuario(sheet, String(house), String(id));
  var table = sheet.getDataRange().getValues();
  var resultadosRequeridos = [];
  for (i = 0; i < table.length; i++) {
		if (table[i][1].toString() == id.toString()) {
      resultadosRequeridos.push(table[i][3].toString());
    }
  }
  if (resultadosRequeridos.length != resultadosObtidos.length) return false;
  for (i = 0; i < resultadosObtidos.length; ++i) {
    if (resultadosRequeridos[i] != resultadosObtidos[i]) return false;
  }
  return true;
}

function testVisitante(sheet, user) {
  var table = sheet.getDataRange().getValues();
  var found = false;
  for (i = 0; i < table.length; i++) {
	if (table[i][3].toString() == user) {
      if (table[i][4].toString() == "visitante") {
        return true;
      } else {
        return false;
      }
    }
  }
}

function testMorador(sheet, user) {
  var table = sheet.getDataRange().getValues();
  var found = false;
  for (i = 0; i < table.length; i++) {
	if (table[i][3].toString() == user) {
      if (table[i][4].toString() == "morador") {
        return false;
      } else {
        return true;
      }
    }
  }
}

function testSindico(sheet, user) {
  var table = sheet.getDataRange().getValues();
  var found = false;
  for (i = 0; i < table.length; i++) {
	if (table[i][3].toString() == user) {
      if (table[i][4].toString() == "sindico") {
        return false;
      } else {
        return true;
      }
    }
  }
}

function testRemover(id, house, user) {
  var args = ["remover", house, user];
  remover(id, args);
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(String(house));
  var table = sheet.getDataRange().getValues();
  var found = false;
  for (i = 0; i < table.length; i++) {
	if (table[i][3].toString() == user) {
      found = true;
    }
  }
  return !found;
}

function run() {
  var sheets = SpreadsheetApp.openById(ssId).getSheetByName("casa");
  var house = "casa";
  var id = "789146317";
  var name = "ffern";
  var user = "novoteste";
  var type = "visitante";
  var dataSaida = "Fri Jan 01 00:00:00 GMT-02:00 2010";
  Logger.log("Teste cadastrar: " + testCadastrar(house, id, name, user, type, dataSaida));
  Logger.log("Teste visitante: " + testVisitante(sheets, user));
  Logger.log("Teste morador: " + testMorador(sheets, user));
  Logger.log("Teste sindico: " + testSindico(sheets, user));
  Logger.log("Teste remover: " + testRemover(id, house, user));
  Logger.log("Teste listar registrados:" + testListarRegistrados(house, id));
}
