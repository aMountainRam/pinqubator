"use strict";
import log from "log4js";
log.configure({
    appenders: { console: { type: "console" } },
    categories: { default: { appenders: ["console"], level: "debug" } },
});
const logger = log.getLogger();

export default logger;
