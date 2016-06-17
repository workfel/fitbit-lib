"use strict";
var request = require('request');
var moment = require('moment');
var async = require('async');
class Fitbit {
    constructor(config, refreshTokenListener) {
        this.config = config;
        this.refreshTokenListener = refreshTokenListener;
        this.config = config;
        this.refreshTokenListener = refreshTokenListener;
    }
    setToken(token) {
        this.token = token;
    }
    getToken() {
        return this.token;
    }
    authorizeURL() {
        return require('simple-oauth2')({
            clientID: this.config.creds.clientID,
            clientSecret: this.config.creds.clientSecret,
            site: this.config.uris.authorizationUri,
            authorizationPath: this.config.uris.authorizationPath,
        }).authCode.authorizeURL(this.config.authorization_uri);
    }
    fetchTokenAsync(code) {
        return new Promise((resolve, reject) => {
            this.fetchToken(code, function (err, token) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(token);
                }
            });
        });
    }
    fetchToken(code, cb) {
        var self = this;
        request({
            uri: self.config.uris.tokenUri + self.config.uris.tokenPath,
            method: 'POST',
            headers: { Authorization: 'Basic ' + new Buffer(self.config.creds.clientID + ':' + self.config.creds.clientSecret).toString('base64') },
            timeout: self.config.timeout,
            form: {
                code: code,
                redirect_uri: self.config.authorization_uri.redirect_uri,
                grant_type: 'authorization_code',
                client_id: self.config.creds.clientID,
                client_secret: self.config.creds.clientSecret,
            }
        }, (err, res, body) => {
            if (err)
                return cb(err);
            try {
                var token = JSON.parse(body);
                token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                this.token = token;
                return cb(null, token);
            }
            catch (err) {
                cb(err);
            }
        });
    }
    refresh(cb) {
        var self = this;
        request({
            uri: self.config.uris.tokenUri + self.config.uris.tokenPath,
            method: 'POST',
            headers: { Authorization: 'Basic ' + new Buffer(self.config.creds.clientID + ':' + self.config.creds.clientSecret).toString('base64') + "=" },
            timeout: self.config.timeout,
            form: {
                grant_type: 'refresh_token',
                refresh_token: self.token.refresh_token
            }
        }, (err, res, body) => {
            if (err)
                return cb(new Error('token refresh: ' + err.message));
            try {
                var token = JSON.parse(body);
                if (token.refresh_token) {
                    token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                    this.token = token;
                    this.refreshTokenListener.onTokenRefreshed(token);
                    cb(null, this.token);
                }
                else {
                    cb(token.errors);
                }
            }
            catch (err) {
                cb(err);
            }
        });
    }
    getTimeSeriesStepsActivity(startDate, endDate, cb) {
        this.getTimeSeriesActivity(startDate, endDate, "steps", (err, result) => {
            if (err) {
                cb(err);
            }
            else {
                cb(null, result["activities-steps"]);
            }
        });
    }
    getTimeSeriesStepsActivityAsync(startDate, endDate) {
        return new Promise((resolve, reject) => {
            this.getTimeSeriesStepsActivity(startDate, endDate, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getDailyActivityAsync(date) {
        return new Promise((resolve, reject) => {
            //TODO : Create an ActivityModel
            this.getDailyActivity(date, function (err, result, refresh_token) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ body: result, token: refresh_token });
                }
            });
        });
    }
    getDailyStepsAsync(date) {
        return new Promise((resolve, reject) => {
            this.getDailySteps(date, function (err, result, refresh_token) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ body: result, token: refresh_token });
                }
            });
        });
    }
    getDailyCaloriesAsync(date) {
        return new Promise((resolve, reject) => {
            this.getDailyCalories(date, function (err, result, refresh_token) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ body: result, token: refresh_token });
                }
            });
        });
    }
    getDailyFloorsAsync(date) {
        return new Promise((resolve, reject) => {
            this.getDailyFloors(date, function (err, result, refresh_token) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ body: result, token: refresh_token });
                }
            });
        });
    }
    getDailyElevationAsync(date) {
        return new Promise((resolve, reject) => {
            this.getDailyElevation(date, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getDailyActivity(date, cb) {
        let activityDate = moment(date).format('YYYY-MM-DD');
        if (!this.token)
            return cb(new Error('must setToken() or getToken() before calling request()'));
        let url = "https://api.fitbit.com/1/user/"
            .concat(this.token.user_id)
            .concat("/activities/date/")
            .concat(activityDate)
            .concat(".json");
        try {
            this.request({
                uri: url
            }, (err, response, refresh_token) => {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, JSON.parse(response), refresh_token);
                }
            });
        }
        catch (e) {
            cb(e);
        }
    }
    getDailySteps(date, cb) {
        this.getDailyActivity(date, (err, result, refresh_token) => {
            if (err) {
                return cb(err);
            }
            else {
                return cb(null, result.summary.steps, refresh_token);
            }
        });
    }
    getDailyCalories(date, cb) {
        this.getDailyActivity(date, (err, result, refresh_token) => {
            if (err) {
                return cb(err);
            }
            else {
                return cb(null, result.summary.activityCalories, refresh_token);
            }
        });
    }
    getDailyFloors(date, cb) {
        this.getDailyActivity(date, (err, result, refresh_token) => {
            if (err) {
                return cb(err);
            }
            else {
                return cb(null, result.summary.floors, refresh_token);
            }
        });
    }
    getDailyElevation(date, cb) {
        this.getDailyActivity(date, (err, result, refresh_token) => {
            if (err) {
                return cb(err);
            }
            else {
                return cb(null, result.summary.elevation, refresh_token);
            }
        });
    }
    requestAsync(options) {
        return new Promise((resolve, reject) => {
            this.request(options, function (err, body, token) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ body: body, token: token });
                }
            });
        });
    }
    request(options, cb) {
        var self = this;
        if (!self.token)
            return cb(new Error('must setToken() or getToken() before calling request()'));
        if (!self.token.access_token)
            return cb(new Error('token appears corrupt: ' + JSON.stringify(self.token)));
        async.series([
            function (cb) {
                if (moment().unix() >= moment(self.token.expires_at, 'YYYYMMDDTHH:mm:ss').unix())
                    self.refresh(cb);
                else
                    cb();
            },
            function (cb) {
                if (!options.auth)
                    options.auth = {};
                if (!options.timeout)
                    options.timeout = self.config.timeout;
                options.auth.bearer = self.token.access_token;
                request(options, function (err, res, body) {
                    if (err)
                        return cb(new Error('request: ' + err.message));
                    // self.limits = {
                    //     limit: res.headers['fitbit-rate-limit-limit'],
                    //     remaining: res.headers['fitbit-rate-limit-remaining'],
                    //     reset: res.headers['fitbit-rate-limit-reset'],
                    // };
                    cb(null, body);
                });
            },
        ], function (err, results) {
            if (err)
                return cb(err);
            cb(null, results[1], results[0]);
        });
    }
    getTimeSeriesActivity(startDate, endDate, ressourcesPath, cb) {
        if (!this.token)
            return cb(new Error('must setToken() or getToken() before calling request()'));
        let url = "https://api.fitbit.com/1/user/"
            .concat(this.token.user_id)
            .concat("/activities/")
            .concat(ressourcesPath)
            .concat("/date/")
            .concat(moment(startDate).format('YYYY-MM-DD'))
            .concat("/")
            .concat(moment(endDate).format('YYYY-MM-DD'))
            .concat(".json");
        try {
            this.request({
                uri: url
            }, (err, response) => {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, JSON.parse(response));
                }
            });
        }
        catch (e) {
            cb(e);
        }
    }
}
exports.Fitbit = Fitbit;

//# sourceMappingURL=Fitbit.js.map
