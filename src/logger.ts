// biome-ignore-all lint/suspicious/noExplicitAny: necessary for dynamic logging
import log4js from "log4js";
import { isProduction } from "@/utils/isProduction";

log4js.configure({
    appenders: {
        console: { type: "console" },
        Discord: { type: "logLevelFilter", appender: "console", level: isProduction ? "off" : "all" },
        Core: { type: "logLevelFilter", appender: "console", level: isProduction ? "off" : "all" },
        Database: { type: "logLevelFilter", appender: "console", level: isProduction ? "off" : "all" },
    },
    categories: {
        default: { appenders: ["console"], level: isProduction ? "off" : "all" },
        Discord: { appenders: ["Discord"], level: "all" },
        Core: { appenders: ["Core"], level: "all" },
        Database: { appenders: ["Database"], level: "all" },
    },
});

type Categories = "Discord" | "Core" | "Database";

const loggers: Record<Categories, log4js.Logger> = {
    Discord: log4js.getLogger("Discord"),
    Core: log4js.getLogger("Core"),
    Database: log4js.getLogger("Database"),
};

const getLogger = (category: Categories) => loggers[category];

const formatStack = (stack?: string) => {
    if (!stack) {
        return "";
    }
    return stack
        .split("at ")
        .slice(1)
        .map((line) => `    at ${line.trim()}`)
        .join("\n");
};

const handleError = (category: Categories, message: string | Error, level: "error" | "fatal") => {
    const logger = getLogger(category);

    if (typeof message === "string") {
        const error = new Error("stack trace");
        const stack = formatStack(error.stack);
        const fullMessage = `${message}\n${stack}`;
        logger[level](fullMessage);
    } else {
        const fullMessage = message.stack ? message.stack : `${message.name}: ${message.message}`;
        logger[level](fullMessage);
    }
};

export const logger = {
    log: (category: Categories, message: string, ...args: Array<any>) => getLogger(category).log(message, ...args),
    info: (category: Categories, message: string, ...args: Array<any>) => getLogger(category).info(message, ...args),
    debug: (category: Categories, message: string, ...args: Array<any>) => getLogger(category).debug(message, ...args),
    warn: (category: Categories, message: string, ...args: Array<any>) => getLogger(category).warn(message, ...args),
    error: (category: Categories, message: string | Error) => handleError(category, message, "error"),
    fatal: (category: Categories, message: string | Error) => handleError(category, message, "fatal"),
};
