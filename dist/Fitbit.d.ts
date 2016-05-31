export interface IFitbit {
    authorizeURL(): string;
    fetchToken(code: string, cb: any): void;
    refresh(cb: any): void;
    setToken(token: string): void;
    getToken(): string;
    request(options: any, cb: any): void;
}
export declare class Fitbit implements IFitbit {
    private config;
    private token;
    constructor(config: any);
    setToken(token: string): void;
    getToken(): string;
    authorizeURL(): string;
    fetchToken(code: string, cb: any): void;
    refresh(cb: any): void;
    request(options: any, cb: any): void;
}
