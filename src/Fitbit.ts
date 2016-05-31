import {emptyCompilationResult} from "gulp-typescript/release/reporter";
var request = require('request');
var moment = require('moment');
var async = require('async');


export interface IFitbit {
    authorizeURL():string;
    fetchToken(code:string, cb:any):void;
    refresh(cb:any):void;
    setToken(token:string):void;
    getToken():string;
    request(options:any, cb:any):void;

}

export interface FitbitOptionModel {
    timeout:number;
    creds:any;
    uris:any;
    authorization_uri:any;
}


export class Fitbit implements IFitbit {


    private token:any;

    constructor(private config:FitbitOptionModel) {
        this.config = config;
    }

    setToken(token:string):void {
        this.token = token;
    }

    getToken():string {
        return this.token;
    }

    authorizeURL():string {
        return require('simple-oauth2')({
            clientID: this.config.creds.clientID,
            clientSecret: this.config.creds.clientSecret,
            site: this.config.uris.authorizationUri,
            authorizationPath: this.config.uris.authorizationPath,
        }).authCode.authorizeURL(this.config.authorization_uri);
    }

    fetchToken(code:string, cb:any):void {
        var self = this;
        request({
            uri: self.config.uris.tokenUri + self.config.uris.tokenPath,
            method: 'POST',
            headers: {Authorization: 'Basic ' + new Buffer(self.config.creds.clientID + ':' + self.config.creds.clientSecret).toString('base64')},
            timeout: self.config.timeout,
            form: {
                code: code,
                redirect_uri: self.config.authorization_uri.redirect_uri,
                grant_type: 'authorization_code',
                client_id: self.config.creds.clientID,
                client_secret: self.config.creds.clientSecret,
            }
        }, (err, res, body) => {
            if (err) return cb(err);
            try {
                var token = JSON.parse(body);
                token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                this.token = token;
                return cb(null, token);

            } catch (err) {
                cb(err);
            }
        });
    }

    refresh(cb:any):void {
        var self = this;
        request({
            uri: self.config.uris.tokenUri + self.config.uris.tokenPath,
            method: 'POST',
            headers: {Authorization: 'Basic ' + new Buffer(self.config.creds.clientID + ':' + self.config.creds.clientSecret).toString('base64')},
            timeout: self.config.timeout,
            form: {
                grant_type: 'refresh_token',
                refresh_token: self.token.refresh_token
            }
        }, (err, res, body) => {
            if (err) return cb(new Error('token refresh: ' + err.message));
            try {


                var token = JSON.parse(body);

                if (token.success) {
                    token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                    this.token = token;
                    cb(null, this.token);
                } else {
                    cb(token.errors);
                }


            } catch (err) {
                cb(err);
            }
        });
    }

    getTimeSeriesStepsActivity(startDate:string, endDate:string, cb:any) {
        this.getTimeSeriesActivity(startDate, endDate, "steps", (err:any, result:any)=> {
            if (err) {
                cb(err)
            } else {
                cb(null, result["activities-steps"]);
            }
        });
    }

    private getTimeSeriesActivity(startDate:string, endDate:string, ressourcesPath:string, cb:any) {

        if (!this.token)
            return cb(new Error('must setToken() or getToken() before calling request()'));


        let url:string = "https://api.fitbit.com/1/user/"
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
            }, (err:any, response) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, JSON.parse(response));
                }
            });
        } catch (e) {
            cb(e);
        }
    }

    getDailyActivity(date:string, cb:any):void {
        let activityDate:string = moment(date).format('YYYY-MM-DD');

        if (!this.token)
            return cb(new Error('must setToken() or getToken() before calling request()'));


        let url:string = "https://api.fitbit.com/1/user/"
            .concat(this.token.user_id)
            .concat("/activities/date/")
            .concat(activityDate)
            .concat(".json");

        try {
            this.request({
                uri: url
            }, (err:any, response) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, JSON.parse(response));
                }
            });
        } catch (e) {
            cb(e);
        }
    }


    getDailySteps(date:string, cb:any):void {
        this.getDailyActivity(date, (err:any, result:any) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, result.summary.steps);
            }
        });
    }

    getDailyCalories(date:string, cb:any):void {
        this.getDailyActivity(date, (err:any, result:any) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, result.summary.activityCalories);
            }
        });
    }

    getDailyFloors(date:string, cb:any):void {
        this.getDailyActivity(date, (err:any, result:any) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, result.summary.floors);
            }
        });
    }

    getDailyElevation(date:string, cb:any):void {
        this.getDailyActivity(date, (err:any, result:any) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, result.summary.elevation);
            }
        });
    }

    request(options:any, cb:any):void {
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
                if (!options.auth) options.auth = {};
                if (!options.timeout) options.timeout = self.config.timeout;
                options.auth.bearer = self.token.access_token;
                request(options, function (err, res, body) {
                    if (err) return cb(new Error('request: ' + err.message));
                    // self.limits = {
                    //     limit: res.headers['fitbit-rate-limit-limit'],
                    //     remaining: res.headers['fitbit-rate-limit-remaining'],
                    //     reset: res.headers['fitbit-rate-limit-reset'],
                    // };
                    cb(null, body);
                });
            },
        ], function (err, results) {
            if (err) return cb(err);
            cb(null, results[1], results[0]);
        });
    }

}