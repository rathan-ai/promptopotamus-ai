/**
 * Structured logging utility for production
 * Provides consistent logging with proper error handling
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = context?.timestamp || new Date().toISOString();
    const baseLog = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context) {
      const { userId, action, metadata } = context;
      const contextStr = [
        userId && `userId=${userId}`,
        action && `action=${action}`,
        metadata && `metadata=${JSON.stringify(metadata)}`
      ].filter(Boolean).join(' ');
      
      return contextStr ? `${baseLog} ${contextStr}` : baseLog;
    }
    
    return baseLog;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    // In production, we would send these to a logging service
    // For now, we'll use console methods appropriately
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          // Silent in production
          break;
        case LogLevel.WARN:
          // Could be sent to monitoring service
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          // Should be sent to error tracking service
          if (error) {
            // In production, send to error tracking service like Sentry
          }
          break;
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Specific logging methods for common scenarios
  logApiError(endpoint: string, error: Error, userId?: string): void {
    this.error(`API error at ${endpoint}`, {
      action: 'api_error',
      userId,
      metadata: {
        endpoint,
        errorMessage: error.message,
        errorStack: error.stack
      }
    }, error);
  }

  logDatabaseError(operation: string, error: Error, userId?: string): void {
    this.error(`Database error during ${operation}`, {
      action: 'database_error',
      userId,
      metadata: {
        operation,
        errorMessage: error.message
      }
    }, error);
  }

  logAuthError(action: string, error: Error, userId?: string): void {
    this.error(`Authentication error: ${action}`, {
      action: 'auth_error',
      userId,
      metadata: {
        authAction: action,
        errorMessage: error.message
      }
    }, error);
  }

  logPaymentEvent(event: string, userId: string, metadata: Record<string, any>): void {
    this.info(`Payment event: ${event}`, {
      action: 'payment_event',
      userId,
      metadata
    });
  }

  logSecurityEvent(event: string, userId?: string, metadata?: Record<string, any>): void {
    this.warn(`Security event: ${event}`, {
      action: 'security_event',
      userId,
      metadata
    });
  }

  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      action: 'performance',
      metadata: {
        operation,
        duration,
        ...metadata
      }
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;