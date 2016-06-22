import { ActivitiesStepsModel } from "./models/ActivitiesStepsModel";
import { FitbitToken } from "./models/FitbitToken";
export interface IFitbitRefreshTokenListener {
    onTokenRefreshed(token: FitbitToken): any;
}
export interface IFitbit {
    authorizeURL(): string;
    fetchToken(code: string, cb: any): void;
    fetchTokenAsync(code: string): Promise<any>;
    refresh(cb: any): void;
    setToken(token: string): void;
    getToken(): string;
    request(options: any, cb: any): void;
    requestAsync(options: any): Promise<any>;
    getTimeSeriesStepsActivity(startDate: string, endDate: string, cb: any): void;
    getDailyActivity(date: string, cb: any): void;
    getDailySteps(date: string, cb: any): void;
    getDailyCalories(date: string, cb: any): void;
    getDailyFloors(date: string, cb: any): void;
    getDailyElevation(date: string, cb: any): void;
    getTimeSeriesStepsActivityAsync(startDate: string, endDate: string): Promise<Array<ActivitiesStepsModel>>;
    getDailyActivityAsync(date: string): Promise<any>;
    getDailyStepsAsync(date: string): Promise<{
        body: number;
        token: string;
    }>;
    getDailyCaloriesAsync(date: string): Promise<any>;
    getDailyFloorsAsync(date: string): Promise<any>;
    getDailyElevationAsync(date: string): Promise<any>;
}
export interface FitbitOptionModel {
    timeout: number;
    creds: any;
    uris: any;
    authorization_uri: any;
}
export declare class Fitbit implements IFitbit {
    private config;
    private refreshTokenListener;
    private token;
    private refreshTokenListener;
    constructor(config: FitbitOptionModel, refreshTokenListener?: IFitbitRefreshTokenListener);
    setToken(token: string): void;
    /**
     *
     * @returns {any}
     */
    getToken(): string;
    /**
     *
     * @returns {string}
     */
    authorizeURL(): string;
    /**
     *
     * @param code
     * @returns {Promise<FitbitToken>}
     */
    fetchTokenAsync(code: string): Promise<FitbitToken>;
    /**
     *
     * @param code
     * @param cb : callback return the FitbitToken
     */
    fetchToken(code: string, cb: any): void;
    refresh(cb: any): void;
    /**
     *
     * @param startDate
     * @param endDate
     * @param cb : callback return Array<ActivitiesStepsModel>
     */
    getTimeSeriesStepsActivity(startDate: string, endDate: string, cb: any): void;
    /**
     *
     * @param startDate
     * @param endDate
     * @returns {Promise<Array<ActivitiesStepsModel>>}
     */
    getTimeSeriesStepsActivityAsync(startDate: string, endDate: string): Promise<Array<ActivitiesStepsModel>>;
    /**
     *
     * @param date
     * @returns {Promise<{body:any, token:string}>}
     */
    getDailyActivityAsync(date: string): Promise<{
        body: any;
        token: string;
    }>;
    /**
     *
     * @param date
     * @returns {Promise<{body:number, token:string}>}
     */
    getDailyStepsAsync(date: string): Promise<{
        body: number;
        token: string;
    }>;
    /**
     *
     * @param date
     * @returns {Promise<{body:any, token:string}>}
     */
    getDailyCaloriesAsync(date: string): Promise<{
        body: any;
        token: string;
    }>;
    /**
     *
     * @param date
     * @returns {Promise<{body:any, token:string}>}
     */
    getDailyFloorsAsync(date: string): Promise<{
        body: any;
        token: string;
    }>;
    /**
     *
     * @param date
     * @returns {Promise<{body:any, token:string}>}
     */
    getDailyElevationAsync(date: string): Promise<{
        body: any;
        token: string;
    }>;
    /**
     *
     * @param date
     * @param cb : callback( err:any, body : any , token: any)
     */
    getDailyActivity(date: string, cb: any): void;
    /**
     *
     * @param date
     * @param cb callback( err:any, steps : number , token: any)
     */
    getDailySteps(date: string, cb: any): void;
    /**
     *
     * @param date
     * @param cb callback( err:any, calories : number , token: any)
     */
    getDailyCalories(date: string, cb: any): void;
    /**
     *
     * @param date
     * @param cb callback( err:any, floors : number , token: any)
     */
    getDailyFloors(date: string, cb: any): void;
    /**
     *
     * @param date
     * @param cb callback( err:any, elevation : number , token: any)
     */
    getDailyElevation(date: string, cb: any): void;
    /**
     *
     * @param options
     * @returns {Promise<{body: body, token: token}>}
     */
    requestAsync(options: any): Promise<{
        body: any;
        token: string;
    }>;
    request(options: any, cb: any): void;
    private getTimeSeriesActivity(startDate, endDate, ressourcesPath, cb);
}
