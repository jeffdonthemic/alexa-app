var express = require('express');
var bodyParser = require('body-parser');
var Promise = require("bluebird");
var alexa = require("alexa-app");
var nforce = require('nforce');

var PORT = process.env.PORT || 3000;
var app = express();

//setup the alexa app and attach it to express before anything else.
var alexaApp = new alexa.app("skills");

alexaApp.express({
  expressApp: app,
  checkCert: false,
  debug: true
});

// setup the salesforce connected app
var org = nforce.createConnection({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: 'http://localhost:'+PORT+'/oauth/_callback',
  environment: 'production',
  mode: 'single'
});

// authenticate to salesforce and get an session id
org.authenticate({ username: process.env.USERNAME, password: process.env.PASSWORD}, function(err, resp){
  // the oauth object was stored in the connection object
  if(!err) console.log('Successfully connected to Salesforce. Cached token: ' + org.oauth.access_token);
  if(err) console.log('Cannot connect to Salesforce. ' + err);
});

// debugging -- displays the intent being invoked
alexaApp.pre = function(request, response, type) {
    console.log('Intent request: ' + type);
};

// the last thing executed for every request. turn any exception inta a respose
alexaApp.post = function(request, response, type, exception) {
  if (exception) {
    // always turn an exception into a successful response
    return response.clear().say("Drat! An error occured: " + exception).send();
  }
};

alexaApp.error = function(exception, request, response) {
  response.say("Sorry, something bad happened. #sadtrombone");
};

// launch reponse
alexaApp.launch(function(request, response) {
  response.say('Welcome to the Salesforce Alexa Skill!');
});

// this is a sample intent for salesforce integration
alexaApp.intent("AccountsIntent", {
    "utterances": [
      "for an account",
      "for a salesforce account",
    ]
  }, function(request, response) {
    return salesforceContent().then(function(results) {
      response.say(results[0].get('Name'));
    });
  }
);

app.get('/', function (req, res) {
  res.send('This is not the app you are looking for.')
})

app.listen(PORT, function () {
  console.log('Alexa app listening on port ' + PORT);
})

// this is just a sample query that returns a single account record
var salesforceContent = function() {
  return new Promise(function(resolve, reject) {
    org.query({ query: "Select Id, Name From Account Order By LastModifiedDate DESC LIMIT 1" }, function(err, resp){
      if(!err && resp.records) resolve(resp.records)
      reject(err);
    });
  });
}
