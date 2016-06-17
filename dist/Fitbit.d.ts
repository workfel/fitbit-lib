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
    getTimeSeriesStepsActivityAsync(startDate: string, endDate: string): Promise<ActivitiesStepsModel>;
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
    getToken(): string;
    authorizeURL(): string;
    fetchTokenAsync(code: string): Promise<FitbitToken>;
    fetchToken(code: string, cb: any): void;
    refresh(cb: any): void;
    getTimeSeriesStepsActivity(startDate: string, endDate: string, cb: any): void;
    getTimeSeriesStepsActivityAsync(startDate: string, endDate: string): Promise<Array<ActivitiesStepsModel>>;
    getDailyActivityAsync(date: string): Promise<{
        body: any;
        token: string;
    }>;
    getDailyStepsAsync(date: string): Promise<{
        body: number;
        token: string;
    }>;
    getDailyCaloriesAsync(date: string): Promise<{
        body: any;
        token: string;
    }>;
    getDailyFloorsAsync(date: string): Promise<{
        body: any;
        token: string;
    }>;
    getDailyElevationAsync(date: string): Promise<{
        body: any;
        token: string;
    }>;
    getDailyActivity(date: string, cb: any): void;
    getDailySteps(date: string, cb: any): void;
    getDailyCalories(date: string, cb: any): void;
    getDailyFloors(date: string, cb: any): void;
    getDailyElevation(date: string, cb: any): void;
    requestAsync(options: any): Promise<{
        body: any;
        token: string;
    }>;
    request(options: any, cb: any): void;
    private getTimeSeriesActivity(startDate, endDate, ressourcesPath, cb);
}
