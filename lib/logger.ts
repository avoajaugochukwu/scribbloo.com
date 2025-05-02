import pino from 'pino';

// Determine if running in development or production
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure Pino logger - NO transport option here
const logger = pino({
  level: isDevelopment ? 'debug' : 'info', // Log more in dev
  base: isDevelopment ? undefined : { pid: process.pid }, // Add PID in production if needed
  timestamp: pino.stdTimeFunctions.isoTime, // Use ISO time format
});

// Add a child logger for specific modules if needed, e.g.:
// export const storageLogger = logger.child({ module: 'storageUtils' });

export default logger; // Export the main logger instance 