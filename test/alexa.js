var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3000');

describe('Alexa', function() {

  it('should respond appropriately to a bad request', function(done) {
    api.post('/skills')
      .send({})
      .expect(200).then(function(response){
        var ssml = response.body.response.outputSpeech.ssml;
        expect(ssml).to.eql('<speak>Sorry, something bad happened. #sadtrombone</speak>');
        done();
      });
  })

  it('should respond to a launch event', function(done) {
    api.post('/skills')
      .send({
        request: {
          type: 'LaunchRequest'
        }
      })
      .expect(200).then(function(response){
        var ssml = response.body.response.outputSpeech.ssml;
        expect(ssml).to.eql('<speak>Welcome to the Salesforce Alexa Skill!</speak>');
        done();
      });
  })

  it('responds to an accounts event', function(done) {
    api.post('/skills')
      .send({
        request: {
          type: 'IntentRequest',
          requestId: 'amzn1.echo-api.request.98468be2-5e51-4e5b-bcdf-2bca619371c3',
          intent: { name: 'AccountsIntent' }
        }
      })
      .expect(200).then(function(response){
        var ssml = response.body.response.outputSpeech.ssml;
        expect(ssml).to.eql('<speak>GenePoint</speak>')
        done();
      });
  })

})
