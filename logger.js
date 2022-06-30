const { createLogger, format, transports } = require("winston");
 
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  verbose: 4,
  debug: 5,
  trace: 6,
};

let isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};

const alignedWithColorsAndTime = format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(log => {
       return  `${log.timestamp} [${log.level}]: ` + log.message
    })
  );
 
const logger = createLogger({
  level: process.env.LOG_LEVEL,
  levels: logLevels,
  format: alignedWithColorsAndTime,
  transports: [new transports.Console()],
});

module.exports = logger