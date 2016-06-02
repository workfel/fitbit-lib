# fitbit-lib
[![NPM][npm-image]][npm-url]

[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]

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

    fitbit.setToken(req.session.oauth);

    fitbit.getDailySteps(date, function (err, resuklt) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.send({value: resuklt});
        }
    });
});

app.get('/activities/steps', function (req, res) {
    var fitbit = new Fitbit(options);

    var startdate = "2016-05-27";
    var enddate = "2016-05-30";

    fitbit.setToken(req.session.oauth);

    fitbit.getTimeSeriesStepsActivity(startdate, enddate, function (err, resuklt) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.send({value: resuklt});
        }
    });
});

// Display activity for a user
app.get('/activity/', function (req, res) {
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

### Activity Measures

#### client.getDailyActivity(date, callback)
The date is a `Date` object, and the callback is of the form `function(err, activity)`.
The activity is directly format from FITBIT API.
```json
{
    "activities":[
        {
            "activityId":51007,
            "activityParentId":90019,
            "calories":230,
            "description":"7mph",
            "distance":2.04,
            "duration":1097053,
            "hasStartTime":true,
            "isFavorite":true,
            "logId":1154701,
            "name":"Treadmill, 0% Incline",
            "startTime":"00:25",
            "steps":3783
        }
    ],
    "goals":{
        "caloriesOut":2826,
        "distance":8.05,
        "floors":150,
        "steps":10000
     },
    "summary":{
        "activityCalories":230,
        "caloriesBMR":1913,
        "caloriesOut":2143,
        "distances":[
            {"activity":"tracker", "distance":1.32},
            {"activity":"loggedActivities", "distance":0},
            {"activity":"total","distance":1.32},
            {"activity":"veryActive", "distance":0.51},
            {"activity":"moderatelyActive", "distance":0.51},
            {"activity":"lightlyActive", "distance":0.51},
            {"activity":"sedentaryActive", "distance":0.51},
            {"activity":"Treadmill, 0% Incline", "distance":3.28}
        ],
        "elevation":48.77,
        "fairlyActiveMinutes":0,
        "floors":16,
        "lightlyActiveMinutes":0,
        "marginalCalories":200,
        "sedentaryMinutes":1166,
        "steps":0,
        "veryActiveMinutes":0
    }
}
```


#### client.getDailySteps(date, callback)
The date is a `Date` object, and the callback is of the form `function(err, data)`. The `data` is the integer number of steps the user has taken today.

#### client.getDailyFloors(date, callback)
The date is a `Date` object, and the callback is of the form `function(err, data)`. The `data` is the integer number of floors the user has
done today.

#### client.getDailyCalories(date, callback)
The date is a `Date` object, and the callback is of the form `function(err, data)`. The `data` is the integer number of calories the user has consumed today.

#### client.getDailyElevation(date, callback)
The date is a `Date` object, and the callback is of the form `function(err, data)`. The `data` is the float number of elevation the user
has done today.

### TimeSeries Measures
#### client.getTimeSeriesStepsActivity(startdate, enddate, callback)
The date is a `Date` object, and the callback is of the form `function(err, activities)`. The `activities` is an collection of steps
between the two dates.
```json
    [
        {"dateTime":"2016-05-27","value":5491},
        {"dateTime":"2016-05-28","value":12354},
        {"dateTime":"2016-05-29","value":8777},
        {"dateTime":"2016-05-30","value":8196}
    ]
```

## Release Notes

See release notes [here](./RELEASENOTES.md).


[npm-image]: https://nodei.co/npm/fitbit-lib.png
[npm-url]: https://nodei.co/npm/fitbit-lib
[travis-image]: https://api.travis-ci.org/workfel/fitbit-lib.svg?branch=master
[travis-url]:https://api.travis-ci.org/workfel/fitbit-lib
[daviddm-image]: https://david-dm.org/workfel/fitbit-lib.svg
[daviddm-url]: https://david-dm.org/workfel/fitbit-lib