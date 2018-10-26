"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var env_1 = require("./env");
function getLogger(log) {
    if (log === void 0) { log = env_1.isDebug ? console.log : null; }
    return function (message) {
        var otherArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            otherArgs[_i - 1] = arguments[_i];
        }
        if (!log) {
            return;
        }
        if (otherArgs.length < 1) {
            return log(message);
        }
        var areLastArgsTypeIsFunction = typeof otherArgs[otherArgs.length - 1] === 'function';
        var cMessage = otherArgs.splice(otherArgs.length - (areLastArgsTypeIsFunction ? 1 : 0))[0];
        var optionalParams = otherArgs;
        message = cMessage ? cMessage(message) : message;
        log.apply(void 0, [message].concat(optionalParams));
    };
}
exports.getLogger = getLogger;
exports.exLog = getLogger();
//# sourceMappingURL=logger.js.map