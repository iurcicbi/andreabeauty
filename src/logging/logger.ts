import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  msg: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  'password', 'token', 'authorization', 'cookie', 'secret',
  'jwt', 'refreshToken', 'accessToken', 'csrf',
]);

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function writeLog(level: LogLevel, entry: Omit<LogEntry, 'timestamp' | 'level'>): void {
  if (level === 'debug' && env.LOG_LEVEL !== 'debug') return;

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    ...entry,
  };

  const output = JSON.stringify(sanitize(logEntry as unknown as Record<string, unknown>));

  if (level === 'error') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }
}

export const logger = {
  debug: (entry: Omit<LogEntry, 'timestamp' | 'level'>) => writeLog('debug', entry),
  info: (entry: Omit<LogEntry, 'timestamp' | 'level'>) => writeLog('info', entry),
  warn: (entry: Omit<LogEntry, 'timestamp' | 'level'>) => writeLog('warn', entry),
  error: (entry: Omit<LogEntry, 'timestamp' | 'level'>) => writeLog('error', entry),
};
