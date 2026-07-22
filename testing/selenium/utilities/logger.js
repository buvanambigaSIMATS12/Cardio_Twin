/**
 * Winston Logger
 * 
 * Provides structured logging with console + file transports.
 * Log files are written to the logs/ directory.
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');
const config = require('./configLoader');

const logDir = path.resolve(__dirname, '..', config.paths.logs);

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
      return stack ? `${base}\n${stack}` : base;
    })
  ),
  transports: [
    // Console transport with color
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
    }),

    // File transport — all logs
    new transports.File({
      filename: path.join(logDir, 'test-run.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
    }),

    // File transport — errors only
    new transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
});

module.exports = logger;
