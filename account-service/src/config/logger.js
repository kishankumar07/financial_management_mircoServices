import winston from 'winston';
import 'winston-daily-rotate-file';

// Create a custom format for log messages
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] [${level}] ${message} - ${stack}` // Include stack trace for errors
      : `[${timestamp}] [${level}] ${message}`;
  })
);

// Configure transports
const transports = [
  new winston.transports.Console({
    level: 'info',
    format: winston.format.combine(winston.format.colorize(), logFormat),
  }),
  new winston.transports.DailyRotateFile({
    level: 'error',
    dirname: './logs', // Directory for logs
    filename: 'error-%DATE%.log', // Log file naming
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d', // Keep logs for 30 days
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: logFormat,
  transports,
});

// Export the logger
export default logger;
