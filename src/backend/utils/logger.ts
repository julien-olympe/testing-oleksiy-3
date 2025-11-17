import { LogEntry } from '../types';

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogEntry['level'], message: string, context?: LogEntry['context'], error?: LogEntry['error']): void {
    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
      error,
    };

    // Output as JSON for structured logging
    console.log(JSON.stringify(logEntry));
  }

  error(message: string, context?: LogEntry['context'], error?: LogEntry['error']): void {
    this.log('ERROR', message, context, error);
  }

  warn(message: string, context?: LogEntry['context']): void {
    this.log('WARN', message, context);
  }

  info(message: string, context?: LogEntry['context']): void {
    this.log('INFO', message, context);
  }

  debug(message: string, context?: LogEntry['context']): void {
    this.log('DEBUG', message, context);
  }
}

export const logger = new Logger();
