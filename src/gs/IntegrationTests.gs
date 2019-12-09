function integrationTest(house, id, user, type, tempoSaida) {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(String(house));
  var args = ["cadastrar", house, user, type, tempoSaida];
  cadastrar(id, args);
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
  var user = "usuario_teste_integracao";
  var type = "visitante";
  var tempoSaida = "5m";
  var resultado_teste = integrationTest(house, id, user, type, tempoSaida);
  Logger.log("Teste de integracao: " + resultado_teste);
  return resultado_teste;
}
