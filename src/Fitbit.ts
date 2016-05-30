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
                token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                this.token = token;
            } catch (err) {
                cb(err);
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