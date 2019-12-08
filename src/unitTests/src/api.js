const express = require('express')
const app = express()
const port = 8080
const request = require('request');

app.get('/InserirUser', (req, res_query) => {
  let success = false;
  let houseQ = 'house=' + String(req.query.house);
  let idQ = 'id=' + String(req.query.id);
  let nameQ = 'name=' + String(req.query.name);
  let userQ = 'user=' + String(req.query.user);
  let user_typeQ = 'user_type=' + String(req.query.user_type);
  let dataSaidaQ = 'dataSaida=' + String(req.query.dataSaida);
  let queryStr = 'type=testcadastrar' + '&' + houseQ + '&' + idQ + '&' + nameQ + '&' + userQ + '&' + user_typeQ + '&' + dataSaidaQ;
  request('GS_WEBAPP_URL' + '?' + queryStr, {}, (err, res, body) => {
    if (err) { return console.log(err); }
    result = res['body'];
    result = JSON.parse(result);
    console.log(result.msg);
    if (result.msg == "True") {
      res_query.json({
        status: true
      });
    } else {
      res_query.json({
        status: false
      });
    }
  });
});

app.get('/RemoverUser', (req, res_query) => {
  let success = false;
  let houseQ = 'house=' + String(req.query.house);
  let idQ = 'id=' + String(req.query.id);
  let userQ = 'user=' + String(req.query.user);
  let queryStr = 'type=testremover' + '&' + houseQ + '&' + idQ + '&' + userQ;
  request('GS_WEBAPP_URL' + '?' + queryStr, {}, (err, res, body) => {
    if (err) { return console.log(err); }
    result = res['body'];
    result = JSON.parse(result);
    console.log(result.msg);
    if (result.msg == "True") {
      res_query.json({
        status: true
      });
    } else {
      res_query.json({
        status: false
      });
    }
  });
});

app.get('/ListarRegistrados', (req, res_query) => {
  let success = false;
  let houseQ = 'house=' + String(req.query.house);
  let idQ = 'id=' + String(req.query.id);
  let queryStr = 'type=testlistarregistrados' + '&' + houseQ + '&' + idQ;
  request('GS_WEBAPP_URL' + '?' + queryStr, {}, (err, res, body) => {
    if (err) { return console.log(err); }
    result = res['body'];
    result = JSON.parse(result);
    console.log(result.msg);
    if (result.msg == "True") {
      res_query.json({
        status: true
      });
    } else {
      res_query.json({
        status: false
      });
    }
  });
});

app.listen(port)
console.log("Listening on port: " + port)
module.exports = app;
