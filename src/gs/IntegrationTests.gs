function integrationTest(house, id, name, user, type, dataSaida) {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(String(house));
  var args = ["cadastrar", house, user, type, dataSaida];
  cadastrar(id, name, args);
  var resultadosObtidos = listarCadastradosPorUsuario(sheet, String(house), String(id));
  var found = false;
  for (i = 0; i < resultadosObtidos.length; i++) {
    if (resultadosObtidos[i] == user.toString()) {
      found = true;
    }
  }
  if (!found) {
    return false;
  }
  args = ["remover", house, user];
  remover(id, args);
  resultadosObtidos = listarCadastradosPorUsuario(sheet, String(house), String(id));
  found = false;
  for (i = 0; i < resultadosObtidos.length; i++) {
    if (resultadosObtidos[i] == user.toString()) {
      found = true;
    }
  }
  if (found) {
    return false;
  }
  return true;
}

function run() {
  var house = "casa";
  var id = "789146317";
  var name = "ffern";
  var user = "usuario_teste_integracao";
  var type = "visitante";
  var dataSaida = "Fri Jan 01 00:00:00 GMT-02:00 2010";
  var resultado_teste = integrationTest(house, id, name, user, type, dataSaida);
  Logger.log("Teste de integracao: " + resultado_teste);
  return resultado_teste;
}
