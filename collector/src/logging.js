const winston = require("winston");

/**
 * Creates a new winston logger.
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

module.exports = logger;