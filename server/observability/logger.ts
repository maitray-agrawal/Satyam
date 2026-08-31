import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
const rawLevel = (process.env.LOG_LEVEL || '').toLowerCase();
const logLevel = validLevels.includes(rawLevel) ? rawLevel : (isProduction ? 'info' : 'debug');

/**
 * Enterprise Structured Logger using Pino
 * Ensures zero leakage of sensitive document bytes or secrets
 */
export const logger = pino({
  level: logLevel,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'secret',
      'apiKey',
      'geminiApiKey',
      'fileBuffer',
      'rawBase64',
      '*.password',
      '*.apiKey',
      '*.secret',
    ],
    censor: '[REDACTED_SECURE]',
  },
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export interface LogContext {
  requestId?: string;
  verificationId?: string;
  bidId?: string;
  tenderId?: string;
  service?: string;
  status?: string;
  durationMs?: number;
  actorRole?: string;
  actorId?: string;
  [key: string]: any;
}

export function createServiceLogger(serviceName: string) {
  return {
    info: (message: string, context: LogContext = {}) => {
      logger.info({ service: serviceName, ...context }, message);
    },
    warn: (message: string, context: LogContext = {}) => {
      logger.warn({ service: serviceName, ...context }, message);
    },
    error: (message: string, error?: any, context: LogContext = {}) => {
      logger.error(
        {
          service: serviceName,
          errorMessage: error?.message,
          stack: isProduction ? undefined : error?.stack,
          ...context,
        },
        message
      );
    },
    debug: (message: string, context: LogContext = {}) => {
      logger.debug({ service: serviceName, ...context }, message);
    },
  };
}
