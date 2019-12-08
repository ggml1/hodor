const api = require('../api.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

describe('Testando o cadastro de usuários', () => {
  it('Teste 1 de cadastro de um usuários', (done) => {
    chai.request(api)
      .get('/InserirUser?house=casa&id=789146317&name=ffern&user=teste_insercao&type=visitante&dataSaida=Fri Jan 01 00:00:00 GMT-02:00 2010')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('status').eql(true)
        done();
      });
  });
  
  it('Teste 2 de cadastro de um usuários', (done) => {
    chai.request(api)
      .get('/InserirUser?house=casa&id=789146317&name=another_user&user=teste_insercao2&type=visitante&dataSaida=Fri Jan 01 00:00:00 GMT-02:00 2012')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('status').eql(true)
        done();
      });
  });
});

describe('Testando a remoção de usuários', () => {
  it('Teste 1 de remoção de um usuários', (done) => {
    chai.request(api)
      .get('/RemoverUser?house=casa&id=789146317&user=user_teste_remocao')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('status').eql(true)
        done();
      });
  });
  
  it('Teste 2 de remoção de um usuários', (done) => {
    chai.request(api)
      .get('/RemoverUser?house=casa&id=789146317&user=user_teste_remocao2')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('status').eql(true)
        done();
      });
  });
});

describe('Testando a listagem de usuários registrados', () => {
  it('Teste 1 da listagem de usuários registrados', (done) => {
    chai.request(api)
      .get('/ListarRegistrados?house=casa&id=789146317')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('status').eql(true)
        done();
      });
  });
  
  it('Teste 2 da listagem de usuários registrados', (done) => {
    chai.request(api)
      .get('/ListarRegistrados?house=casa&id=43637437')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('status').eql(true)
        done();
      });
  });
});