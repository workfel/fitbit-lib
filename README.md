# fitbit-lib
[![NPM][npm-image]][npm-url]



Fitbit API library for node.js


## Install

```sh
$ npm install --save fitbit-lib
```


## Usage

```js
var express = require('express');
var app = express();
var Fitbit = require('../dist/Fitbit').Fitbit;
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());
app.use(session({secret: 'bigSecret'}));
app.listen(3000);

var options = {
    creds: {
        clientID: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET"
    },
    uris: {
        "authorizationUri": "https://www.fitbit.com",
        "authorizationPath": "/oauth2/authorize",
        "tokenUri": "https://api.fitbit.com",
        "tokenPath": "/oauth2/token"
    },
    authorization_uri: {
        "redirect_uri": "http://localhost:3000/oauth_callback",
        "response_type": "code",
        "scope": "activity",
        "state": "3(#0/!~"
    }
};

// OAuth flow
app.get('/', function (req, res) {
    // Create an API client and start authentication via OAuth

    var client = new Fitbit(options);


    res.redirect(client.authorizeURL());

});

// On return from the authorization
app.get('/oauth_callback', function (req, res) {
    var code = req.query.code;

    var client = new Fitbit(options);

    client.fetchToken(code, function (err, token) {

        if (err) {
            return res.send(err);
        }

        req.session.oauth = token;

        res.redirect('/activity/steps');
    });

});

// Display today's steps for a user
app.get('/activity/steps', function (req, res) {
    var fitbit = new Fitbit(options);

    var date = "2016-05-27";

    var fibitUrl = "https://api.fitbit.com/1/user/" + req.session.oauth.user_id + "/activities/date/" + date + ".json";


    fitbit.setToken(req.session.oauth);

    fitbit.request({
        uri: fibitUrl,
        method: 'GET',
    }, function (err, body, token) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(body);
        }
    });
});
```

## Client API

TODO



[npm-image]: https://nodei.co/npm/fitbit-lib.png
[npm-url]: https://nodei.co/npm/fitbit-lib