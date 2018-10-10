interface Log {
    (message?: any, ...optionalParams: any[]): void;
}
interface ExLog {
    (message?: any, ...otherArgs: any[]): void;
}
export declare function getLogger(log?: Log | null): ExLog;
export declare const exLog: ExLog;
export {};
