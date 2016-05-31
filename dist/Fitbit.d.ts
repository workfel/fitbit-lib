export interface IFitbit {
    authorizeURL(): string;
    fetchToken(code: string, cb: any): void;
    refresh(cb: any): void;
    setToken(token: string): void;
    getToken(): string;
    request(options: any, cb: any): void;
}
export interface FitbitOptionModel {
    timeout: number;
    creds: any;
    uris: any;
    authorization_uri: any;
}
export declare class Fitbit implements IFitbit {
    private config;
    private token;
    constructor(config: FitbitOptionModel);
    setToken(token: string): void;
    getToken(): string;
    authorizeURL(): string;
    fetchToken(code: string, cb: any): void;
    refresh(cb: any): void;
    getTimeSeriesStepsActivity(startDate: string, endDate: string, cb: any): void;
    private getTimeSeriesActivity(startDate, endDate, ressourcesPath, cb);
    getDailyActivity(date: string, cb: any): void;
    getDailySteps(date: string, cb: any): void;
    getDailyCalories(date: string, cb: any): void;
    getDailyFloors(date: string, cb: any): void;
    getDailyElevation(date: string, cb: any): void;
    request(options: any, cb: any): void;
}
