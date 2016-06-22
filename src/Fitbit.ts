import {ActivitiesStepsModel} from "./models/ActivitiesStepsModel";
import {FitbitToken} from "./models/FitbitToken";
var request = require('request');
var moment = require('moment');
var async = require('async');

export interface IFitbitRefreshTokenListener {
    onTokenRefreshed(token:FitbitToken);
}

export interface IFitbit {

    //Auth
    authorizeURL():string;
    fetchToken(code:string, cb:any):void;
    fetchTokenAsync(code:string):Promise<any>;
    refresh(cb:any):void;
    setToken(token:string):void;
    getToken():string;

    //Request
    request(options:any, cb:any):void;
    requestAsync(options:any):Promise<any>;

    //Activity measures
    getTimeSeriesStepsActivity(startDate:string, endDate:string, cb:any):void;
    getDailyActivity(date:string, cb:any):void;
    getDailySteps(date:string, cb:any):void;
    getDailyCalories(date:string, cb:any):void;
    getDailyFloors(date:string, cb:any):void;
    getDailyElevation(date:string, cb:any):void;
    //Promise
    getTimeSeriesStepsActivityAsync(startDate:string, endDate:string):Promise<Array<ActivitiesStepsModel>>;
    getDailyActivityAsync(date:string):Promise<any>;
    getDailyStepsAsync(date:string):Promise<{body:number, token:string}>;
    getDailyCaloriesAsync(date:string):Promise<any>;
    getDailyFloorsAsync(date:string):Promise<any>;
    getDailyElevationAsync(date:string):Promise<any>;

}

export interface FitbitOptionModel {
    timeout:number;
    creds:any;
    uris:any;
    authorization_uri:any;
}


export class Fitbit implements IFitbit {


    private token:any;
    private refreshTokenListener:IFitbitRefreshTokenListener;

    constructor(private config:FitbitOptionModel, private refreshTokenListener?:IFitbitRefreshTokenListener) {
        this.config = config;
        this.refreshTokenListener = refreshTokenListener;
    }

    setToken(token:string):void {
        this.token = token;
    }

    /**
     *
     * @returns {any}
     */
    getToken():string {
        return this.token;
    }

    /**
     *
     * @returns {string}
     */
    authorizeURL():string {
        return require('simple-oauth2')({
            clientID: this.config.creds.clientID,
            clientSecret: this.config.creds.clientSecret,
            site: this.config.uris.authorizationUri,
            authorizationPath: this.config.uris.authorizationPath,
        }).authCode.authorizeURL(this.config.authorization_uri);
    }


    /**
     *
     * @param code
     * @returns {Promise<FitbitToken>}
     */
    fetchTokenAsync(code:string):Promise<FitbitToken> {
        return new Promise((resolve, reject) => {
            this.fetchToken(code, function (err:any, token:FitbitToken) {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        });
    }

    /**
     *
     * @param code
     * @param cb : callback return the FitbitToken
     */
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
            headers: {Authorization: 'Basic ' + new Buffer(self.config.creds.clientID + ':' + self.config.creds.clientSecret).toString('base64') + "="},
            timeout: self.config.timeout,
            form: {
                grant_type: 'refresh_token',
                refresh_token: self.token.refresh_token
            }
        }, (err, res, body) => {
            if (err) return cb(new Error('token refresh: ' + err.message));
            try {
                var token = JSON.parse(body);

                if (token.refresh_token) {
                    token.expires_at = moment().add(token.expires_in, 'seconds').format('YYYYMMDDTHH:mm:ss');
                    this.token = token;
                    this.refreshTokenListener.onTokenRefreshed(token);
                    cb(null, this.token);

                } else {
                    cb(token.errors);
                }


            } catch (err) {
                cb(err);
            }
        });
    }

    /**
     *
     * @param startDate
     * @param endDate
     * @param cb : callback return Array<ActivitiesStepsModel>
     */
    getTimeSeriesStepsActivity(startDate:string, endDate:string, cb:any) {
        this.getTimeSeriesActivity(startDate, endDate, "steps", (err:any, result:any)=> {
            if (err) {
                cb(err)
            } else {
                cb(null, result["activities-steps"]);
            }
        });
    }


    /**
     *
     * @param startDate
     * @param endDate
     * @returns {Promise<Array<ActivitiesStepsModel>>}
     */
    getTimeSeriesStepsActivityAsync(startDate:string, endDate:string):Promise<Array<ActivitiesStepsModel>> {
        return new Promise((resolve, reject) => {
            this.getTimeSeriesStepsActivity(startDate, endDate, function (err:any, result:Array<ActivitiesStepsModel>) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     *
     * @param date
     * @returns {Promise<{body:any, token:string}>}
     */
    getDailyActivityAsync(date:string):Promise<{body:any, token:string}> {
        return new Promise((resolve, reject) => {
            //TODO : Create an ActivityModel
            this.getDailyActivity(date, function (err:any, result:any, refresh_token:string) {
                if (err) {
                    reject(err);
                } else {
                    resolve({body: result, token: refresh_token});
                }
            });
        });
    }

    /**
     *
     * @param date
     * @returns {Promise<{body:number, token:string}>}
     */
    getDailyStepsAsync(date:string):Promise<{body:number, token:string}> {
        return new Promise((resolve, reject) => {
            this.getDailySteps(date, function (err:any, result:any, refresh_token:string) {
                if (err) {
                    reject(err);
                } else {
                    resolve({body: result, token: refresh_token});
                }
            });
        });
    }

    /**
     *
     * @param date
     * @returns {Promise<{body:any, token:string}>}
     */
    getDailyCaloriesAsync(date:string):Promise<{body:any, token:string}> {
        return new Promise((resolve, reject) => {
            this.getDailyCalories(date, function (err:any, result:any, refresh_token:string) {
                if (err) {
                    reject(err);
                } else {
                    resolve({body: result, token: refresh_token});
                }
            });
        });
    }

    /**
     *
     * @param date
     * @returns {Promise<{body:any, token:string}>}
     */
    getDailyFloorsAsync(date:string):Promise<{body:any, token:string}> {
        return new Promise((resolve, reject) => {
            this.getDailyFloors(date, function (err:any, result:any, refresh_token:string) {
                if (err) {
                    reject(err);
                } else {
                    resolve({body: result, token: refresh_token});
                }
            });
        });
    }

    /**
     *
     * @param date
     * @returns {Promise<{body:any, token:string}>}
     */
    getDailyElevationAsync(date:string):Promise<{body:any, token:string}> {
        return new Promise((resolve, reject) => {
            this.getDailyElevation(date, function (err:any, result:any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }


    /**
     *
     * @param date
     * @param cb : callback( err:any, body : any , token: any)
     */
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
            }, (err:any, response, refresh_token:string) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, JSON.parse(response), refresh_token);
                }
            });
        } catch (e) {
            cb(e);
        }
    }


    /**
     *
     * @param date
     * @param cb callback( err:any, steps : number , token: any)
     */
    getDailySteps(date:string, cb:any):void {
        this.getDailyActivity(date, (err:any, result:any, refresh_token:string) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, result.summary.steps, refresh_token);
            }
        });
    }

    /**
     *
     * @param date
     * @param cb callback( err:any, calories : number , token: any)
     */
    getDailyCalories(date:string, cb:any):void {
        this.getDailyActivity(date, (err:any, result:any, refresh_token:string) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, result.summary.activityCalories, refresh_token);
            }
        });
    }

    /**
     *
     * @param date
     * @param cb callback( err:any, floors : number , token: any)
     */
    getDailyFloors(date:string, cb:any):void {
        this.getDailyActivity(date, (err:any, result:any, refresh_token:string) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, result.summary.floors, refresh_token);
            }
        });
    }

    /**
     *
     * @param date
     * @param cb callback( err:any, elevation : number , token: any)
     */
    getDailyElevation(date:string, cb:any):void {
        this.getDailyActivity(date, (err:any, result:any, refresh_token:string) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, result.summary.elevation, refresh_token);
            }
        });
    }

    /**
     *
     * @param options
     * @returns {Promise<{body: body, token: token}>}
     */
    requestAsync(options:any):Promise<{body:any, token:string}> {
        return new Promise((resolve, reject) => {
            this.request(options, function (err:any, body:any, token:string) {
                if (err) {
                    reject(err);
                } else {
                    resolve({body: body, token: token});
                }
            });
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

}