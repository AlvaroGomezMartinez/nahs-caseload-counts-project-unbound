/**
 * @fileoverview Logging utility for NAHS Caseload application
 * Provides structured logging with different levels and error tracking for debugging and monitoring.
 * 
 * @author Alvaro Gomez, Academic Technology Coach
 * @version 1.0.0
 * @since 08-06-2025
 */

/**
 * Enumeration of available log levels.
 * @readonly
 * @enum {number}
 */
const LogLevel = {
  /** Debug level - detailed information for diagnosing problems */
  DEBUG: 0,
  /** Info level - general information about application flow */
  INFO: 1,
  /** Warning level - potentially harmful situations */
  WARN: 2,
  /** Error level - error events that might still allow the application to continue */
  ERROR: 3,
  /** Critical level - serious error events that may abort the application */
  CRITICAL: 4
};

/**
 * Human-readable names for log levels.
 *
 * @readonly
 */
const LogLevelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];

/**
 * Enhanced logging utility with error tracking and structured messages.
 * Provides comprehensive logging capabilities for the NAHS Caseload application.
 * 
 * @class ApplicationLogger
 */
class ApplicationLogger {
  /**
   * Creates a new ApplicationLogger instance.
   * Initializes session tracking and start time for performance monitoring.
   * 
   * @constructor
   */
  constructor() {
    /** Unique session identifier */
    this.sessionId = Utilities.getUuid();
    /** Session start time */
    this.startTime = new Date();
  }

  /**
   * Log a message with specified level.
   * Core logging method that handles formatting, persistence, and critical error handling.
   * 
   * @param {number} level - Log level from LogLevel enum
   * @param {string} message - The message to log
   * @param {Object|string|null} [data=null] - Additional data to log
   * @param {string} [context=''] - Context or function name where log originated
   * @returns {void}
   * 
   * @example
   * logger.log(LogLevel.INFO, 'User logged in', { userId: 123 }, 'Authentication');
   */
  log(level, message, data = null, context = '') {
    try {
      const timestamp = new Date().toISOString();
      const levelName = LogLevelNames[level] || 'UNKNOWN';
      const contextStr = context ? `[${context}] ` : '';
      
      let logEntry = `${timestamp} [${levelName}] ${contextStr}${message}`;
      
      if (data) {
        if (typeof data === 'object') {
          logEntry += ` | Data: ${JSON.stringify(data)}`;
        } else {
          logEntry += ` | Data: ${data}`;
        }
      }
      
      // Add session context for debugging
      logEntry += ` | Session: ${this.sessionId.substring(0, 8)}`;
      
      console.log(logEntry);
      
      // Also use Google Apps Script Logger for persistence
      Logger.log(logEntry);
      
      // For critical errors, you might want to send notifications
      if (level >= LogLevel.CRITICAL) {
        this.handleCriticalError(message, data, context);
      }
      
    } catch (error) {
      // Fallback logging if structured logging fails
      console.error('Logging error:', error.message);
      Logger.log(`LOGGING_ERROR: ${message}`);
    }
  }

  /**
   * Log debug information for detailed troubleshooting.
   * 
   * @param {string} message - Debug message
   * @param {Object|string|null} [data=null] - Additional debug data
   * @param {string} [context=''] - Context where debug occurred
   * @returns {void}
   */
  debug(message, data = null, context = '') {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Log informational messages about normal application flow.
   * 
   * @param {string} message - Information message
   * @param {Object|string|null} [data=null] - Additional information
   * @param {string} [context=''] - Context where info was generated
   * @returns {void}
   */
  info(message, data = null, context = '') {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * Log warnings about potentially harmful situations.
   * 
   * @param {string} message - Warning message
   * @param {Object|string|null} [data=null] - Additional warning data
   * @param {string} [context=''] - Context where warning occurred
   * @returns {void}
   */
  warn(message, data = null, context = '') {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * Log errors that might still allow the application to continue.
   * 
   * @param {string} message - Error message
   * @param {Object|string|null} [data=null] - Additional error data
   * @param {string} [context=''] - Context where error occurred
   * @returns {void}
   */
  error(message, data = null, context = '') {
    this.log(LogLevel.ERROR, message, data, context);
  }

  /**
   * Log critical errors that may require immediate attention.
   * 
   * @param {string} message - Critical error message
   * @param {Object|string|null} [data=null] - Additional error data
   * @param {string} [context=''] - Context where critical error occurred
   * @returns {void}
   */
  critical(message, data = null, context = '') {
    this.log(LogLevel.CRITICAL, message, data, context);
  }

  /**
   * Create an error object with tracking ID for better debugging.
   * Generates a unique error identifier and logs the error details.
   * 
   * @param {string} message - Error message
   * @param {Error|null} [originalError=null] - Original error object if available
   * @param {string} [context=''] - Context where error occurred
   * @returns {Object} Error object with tracking information
   * 
   * @example
   * const error = logger.createError('Database connection failed', originalErr, 'UserService');
   * // Returns: { id: 'uuid', message: '...', originalError: '...', context: '...', timestamp: '...', sessionId: '...' }
   */
  createError(message, originalError = null, context = '') {
    const errorId = Utilities.getUuid();
    const error = {
      id: errorId,
      message: message,
      originalError: originalError ? originalError.message : null,
      context: context,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };
    
    this.error(`Error ${errorId}: ${message}`, {
      originalError: originalError ? originalError.message : null,
      stack: originalError ? originalError.stack : null
    }, context);
    
    return error;
  }

  /**
   * Handle critical errors that may need immediate attention.
   * This method can be extended to send notifications or alerts in production.
   * 
   * @param {string} message - Critical error message
   * @param {Object|string|null} data - Error data
   * @param {string} context - Context where critical error occurred
   * @returns {void}
   * @private
   */
  handleCriticalError(message, data, context) {
    // This could be extended to send email notifications or alerts
    // For now, just ensure it's prominently logged
    const criticalErrorId = Utilities.getUuid();
    
    Logger.log(`CRITICAL_ERROR_${criticalErrorId}: ${message}`);
    
    // In a production environment, you might want to:
    // - Send email to administrators
    // - Write to a special error tracking sheet
    // - Send to external monitoring service
  }

  /**
   * Log performance metrics for function execution times.
   * Helps identify performance bottlenecks and optimization opportunities.
   * 
   * @param {string} functionName - Name of the function being measured
   * @param {Date} startTime - Function start time
   * @param {Date|null} [endTime=null] - Function end time (defaults to current time)
   * @returns {void}
   * 
   * @example
   * const start = new Date();
   * // ... function execution ...
   * logger.logPerformance('complexCalculation', start);
   */
  logPerformance(functionName, startTime, endTime = null) {
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    
    this.info(`Performance: ${functionName} completed`, {
      duration: `${duration}ms`,
      startTime: startTime.toISOString(),
      endTime: end.toISOString()
    }, 'PERFORMANCE');
  }

  /**
   * Log user activity for audit trail
   */
  logUserActivity(userEmail, action, details = null) {
    this.info(`User activity: ${action}`, {
      user: userEmail,
      action: action,
      details: details,
      userAgent: 'Google Apps Script', // Could be enhanced with more browser info
    }, 'USER_ACTIVITY');
  }

  /**
   * Get session information including ID, start time, and duration.
   * Useful for debugging and monitoring user sessions.
   * 
   * @returns {Object} Session information object
   * @returns {string} return.sessionId - Unique session identifier
   * @returns {string} return.startTime - Session start time in ISO format
   * @returns {number} return.duration - Session duration in milliseconds
   * 
   * @example
   * const sessionInfo = logger.getSessionInfo();
   * console.log(`Session ${sessionInfo.sessionId} has been active for ${sessionInfo.duration}ms`);
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime.toISOString(),
      duration: new Date().getTime() - this.startTime.getTime()
    };
  }
}

// Global logger instance
const AppLogger = new ApplicationLogger();

/**
 * Convenience functions for backward compatibility and ease of use
 */
function logDebug(message, data = null, context = '') {
  AppLogger.debug(message, data, context);
}

function logInfo(message, data = null, context = '') {
  AppLogger.info(message, data, context);
}

function logWarn(message, data = null, context = '') {
  AppLogger.warn(message, data, context);
}

function logError(message, data = null, context = '') {
  AppLogger.error(message, data, context);
}

function logCritical(message, data = null, context = '') {
  AppLogger.critical(message, data, context);
}

function createError(message, originalError = null, context = '') {
  return AppLogger.createError(message, originalError, context);
}

function logUserActivity(userEmail, action, details = null) {
  AppLogger.logUserActivity(userEmail, action, details);
}

function logPerformance(functionName, startTime, endTime = null) {
  AppLogger.logPerformance(functionName, startTime, endTime);
}
