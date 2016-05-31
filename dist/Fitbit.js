"use strict";
var request = require('request');
var moment = require('moment');
var async = require('async');
var Fitbit = (function () {
    function Fitbit(config) {
        this.config = config;
        this.config = config;
    }
    Fitbit.prototype.setToken = function (token) {
        this.token = token;
    };
    Fitbit.prototype.getToken = function () {
        return this.token;
    };
    Fitbit.prototype.authorizeURL = function () {
        return require('simple-oauth2')({
            clientID: this.config.creds.clientID,
            clientSecret: this.config.creds.clientSecret,
            site: this.config.uris.authorizationUri,
            authorizationPath: this.config.uris.authorizationPath,
        }).authCode.authorizeURL(this.config.authorization_uri);
    };
    Fitbit.prototype.fetchToken = function (code, cb) {
        var _this = this;
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
        }, function (err, res, body) {
            if (err)
                return cb(err);
            try {
                var token = JSON.parse(body);
                token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                _this.token = token;
                return cb(null, token);
            }
            catch (err) {
                cb(err);
            }
        });
    };
    Fitbit.prototype.refresh = function (cb) {
        var _this = this;
        var self = this;
        request({
            uri: self.config.uris.tokenUri + self.config.uris.tokenPath,
            method: 'POST',
            headers: { Authorization: 'Basic ' + new Buffer(self.config.creds.clientID + ':' + self.config.creds.clientSecret).toString('base64') },
            timeout: self.config.timeout,
            form: {
                grant_type: 'refresh_token',
                refresh_token: self.token.refresh_token
            }
        }, function (err, res, body) {
            if (err)
                return cb(new Error('token refresh: ' + err.message));
            try {
                var token = JSON.parse(body);
                token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                _this.token = token;
            }
            catch (err) {
                cb(err);
            }
        });
    };
    Fitbit.prototype.getTimeSeriesStepsActivity = function (startDate, endDate, cb) {
        this.getTimeSeriesActivity(startDate, endDate, "steps", function (err, result) {
            if (err) {
                cb(err);
            }
            else {
                cb(null, result["activities-steps"]);
            }
        });
    };
    Fitbit.prototype.getTimeSeriesActivity = function (startDate, endDate, ressourcesPath, cb) {
        if (!this.token)
            return cb(new Error('must setToken() or getToken() before calling request()'));
        var url = "https://api.fitbit.com/1/user/"
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
            }, function (err, response) {
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
    };
    Fitbit.prototype.getDailyActivity = function (date, cb) {
        var activityDate = moment(date).format('YYYY-MM-DD');
        if (!this.token)
            return cb(new Error('must setToken() or getToken() before calling request()'));
        var url = "https://api.fitbit.com/1/user/"
            .concat(this.token.user_id)
            .concat("/activities/date/")
            .concat(activityDate)
            .concat(".json");
        try {
            this.request({
                uri: url
            }, function (err, response) {
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
    };
    Fitbit.prototype.getDailySteps = function (date, cb) {
        this.getDailyActivity(date, function (err, result) {
            if (err) {
                return cb(err);
            }
            else {
                return cb(null, result.summary.steps);
            }
        });
    };
    Fitbit.prototype.getDailyCalories = function (date, cb) {
        this.getDailyActivity(date, function (err, result) {
            if (err) {
                return cb(err);
            }
            else {
                return cb(null, result.summary.activityCalories);
            }
        });
    };
    Fitbit.prototype.getDailyFloors = function (date, cb) {
        this.getDailyActivity(date, function (err, result) {
            if (err) {
                return cb(err);
            }
            else {
                return cb(null, result.summary.floors);
            }
        });
    };
    Fitbit.prototype.getDailyElevation = function (date, cb) {
        this.getDailyActivity(date, function (err, result) {
            if (err) {
                return cb(err);
            }
            else {
                return cb(null, result.summary.elevation);
            }
        });
    };
    Fitbit.prototype.request = function (options, cb) {
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
    };
    return Fitbit;
}());
exports.Fitbit = Fitbit;

//# sourceMappingURL=Fitbit.js.map
