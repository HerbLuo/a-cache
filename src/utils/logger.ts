import {isDebug} from "./env";

interface Log {
    (message?: any, ...optionalParams: any[]): void;
}
interface ExLog {
    (message?: any, ...otherArgs: any[]): void;
}

export function getLogger(log: Log | null = isDebug ? console.log : null): ExLog  {
    return function (message?: string, ...otherArgs: any[]): void {
        if (!log) {
            return
        }

        if (otherArgs.length < 1) {
            return log(message)
        }

        const areLastArgsTypeIsFunction =
            typeof otherArgs[otherArgs.length - 1] === 'function';
        const [cMessage] = otherArgs.splice(otherArgs.length - (
            areLastArgsTypeIsFunction ? 1 : 0
        ));
        const optionalParams = otherArgs;
        message = cMessage ? cMessage(message) : message;
        log(message, ...optionalParams)
    }
}

export const exLog: ExLog = getLogger();
