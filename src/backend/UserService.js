/**
 * @fileoverview User authentication and authorization service for NAHS Caseload Counts application.
 * 
 * Provides comprehensive user management including email validation, permission checking,
 * campus access control, and session management. Integrates with Google Apps Script
 * Session services and implements caching for performance optimization.
 * 
 * @namespace UserService
 * @requires CONFIG - Application configuration constants
 * @requires AppLogger - Application logging service
 * @requires CacheService - Google Apps Script caching service
 * @requires Session - Google Apps Script session service
 * @requires HtmlService - Google Apps Script HTML service
 * 
 * @author Alvaro Gomez, Academic Technology Coach
 * @version 1.0.0
 * @since 08-06-2025
 */

/**
 * User service class for handling authentication, authorization, and user management.
 * Centralizes all user-related operations including email validation, permission checking,
 * and campus access control.
 * 
 * @class UserService
 * @classdesc Manages user authentication, permissions, and access control for the application
 */
class UserService {
  /**
   * Create a UserService instance.
   * Initializes caching for performance optimization.
   * 
   * @constructor
   */
  constructor() {
    this.cache = CacheService.getScriptCache();
  }

  /**
   * Get the current user's email address from Google Apps Script Session.
   * Handles authentication and provides error context for debugging.
   * 
   * @returns {string} The authenticated user's email address
   * @throws {Error} If user authentication fails or email cannot be retrieved
   * 
   * @example
   * const userService = new UserService();
   * const email = userService.getCurrentUserEmail();
   * console.log(`Current user: ${email}`);
   */
  getCurrentUserEmail() {
    try {
      const email = Session.getActiveUser().getEmail();
      logDebug('Retrieved current user email', { email: email ? 'present' : 'missing' }, 'UserService.getCurrentUserEmail');
      return email;
    } catch (error) {
      logError('Failed to get current user email', { error: error.message }, 'UserService.getCurrentUserEmail');
      throw createError(ERROR_MESSAGES.PERMISSION_ERROR, error, 'UserService.getCurrentUserEmail');
    }
  }

  /**
   * Validate email format and domain restrictions.
   * Checks if the provided email meets format requirements and domain policies.
   * 
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email is valid, false otherwise
   * 
   * @example
   * const userService = new UserService();
   * const isValid = userService.validateUserEmail('user@example.com');
   * if (!isValid) {
   *   console.log('Invalid email format or domain');
   * }
   */
  validateUserEmail(email) {
    try {
      if (!email || typeof email !== 'string') {
        logWarn('Invalid email format provided', { email: typeof email }, 'UserService.validateUserEmail');
        return false;
      }

      if (!email.endsWith(CONFIG.SECURITY.ALLOWED_DOMAIN)) {
        logWarn('Email from unauthorized domain', { domain: email.split('@')[1] }, 'UserService.validateUserEmail');
        return false;
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        logWarn('Email failed format validation', null, 'UserService.validateUserEmail');
        return false;
      }

      logDebug('Email validation passed', null, 'UserService.validateUserEmail');
      return true;
    } catch (error) {
      logError('Error during email validation', { error: error.message }, 'UserService.validateUserEmail');
      return false;
    }
  }

  /**
   * Get user permissions from cache or configuration.
   * Retrieves and caches user permission settings including campus access and roles.
   * 
   * @param {string} email - User's email address
   * @returns {Object} User permissions object containing roles and campus access
   * @returns {Array<string>} return.campuses - List of campuses user has access to
   * @returns {string} return.role - User's role (admin, user, etc.)
   * @returns {boolean} return.fullAccess - Whether user has full system access
   * 
   * @throws {Error} If email is invalid or permissions cannot be loaded
   * 
   * @example
   * const userService = new UserService();
   * const permissions = userService.getUserPermissions('user@nisd.net');
   * console.log(`User has access to: ${permissions.campuses.join(', ')}`);
   */
  getUserPermissions(email) {
    try {
      const startTime = new Date();
      
      if (!this.validateUserEmail(email)) {
        throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
      }

      // Try to get from cache first
      const cacheKey = `${CONFIG.CACHE.PREFIX}permissions_${email}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        logDebug('User permissions retrieved from cache', null, 'UserService.getUserPermissions');
        const permissions = JSON.parse(cached);
        logPerformance('getUserPermissions (cached)', startTime);
        return permissions;
      }

      // Load from configuration (legacy method)
      const permissions = this.loadUserPermissionsFromConfig(email);
      
      // Cache the permissions
      try {
        this.cache.put(cacheKey, JSON.stringify(permissions), CONFIG.CACHE.USER_PERMISSIONS_DURATION);
        logDebug('User permissions cached successfully', null, 'UserService.getUserPermissions');
      } catch (cacheError) {
        logWarn('Failed to cache user permissions', { error: cacheError.message }, 'UserService.getUserPermissions');
        // Continue without caching
      }

      logPerformance('getUserPermissions (fresh)', startTime);
      return permissions;

    } catch (error) {
      logError('Failed to get user permissions', { error: error.message, email }, 'UserService.getUserPermissions');
      throw createError(ERROR_MESSAGES.PERMISSION_ERROR, error, 'UserService.getUserPermissions');
    }
  }

  /**
   * Load user permissions from the configuration mapping.
   * Retrieves permissions from the legacy email-to-campus mapping configuration.
   * 
   * @param {string} email - User's email address
   * @returns {Object} Permissions object with campus access and role information
   * @returns {Array<string>} return.campuses - Array of campus codes user can access
   * @returns {string} return.role - User's role based on access level
   * @returns {boolean} return.fullAccess - Whether user has access to all campuses
   * 
   * @private
   * 
   * @example
   * // Internal usage only
   * const permissions = this.loadUserPermissionsFromConfig('user@nisd.net');
   * // Returns: { campuses: ['NAHS'], role: 'campus_user', fullAccess: false }
   */
  loadUserPermissionsFromConfig(email) {
    try {
      const campusList = CONFIG.LEGACY_EMAIL_CAMPUS_MAPPING[email];
      
      if (!campusList) {
        logInfo('User not found in permissions mapping', { email }, 'UserService.loadUserPermissionsFromConfig');
        return {
          email: email,
          campuses: [],
          hasAccess: false,
          isFullAccess: false,
          role: 'none'
        };
      }

      const isFullAccess = campusList.length >= CONFIG.SECURITY.FULL_ACCESS_CAMPUS_COUNT;
      
      const permissions = {
        email: email,
        campuses: campusList,
        hasAccess: true,
        isFullAccess: isFullAccess,
        role: isFullAccess ? 'administrator' : 'coordinator',
        lastUpdated: new Date().toISOString()
      };

      logInfo('User permissions loaded from config', {
        campusCount: campusList.length,
        isFullAccess: isFullAccess
      }, 'UserService.loadUserPermissionsFromConfig');

      return permissions;

    } catch (error) {
      logError('Error loading permissions from config', { error: error.message, email }, 'UserService.loadUserPermissionsFromConfig');
      throw error;
    }
  }

  /**
   * Check if user has access to a specific campus.
   * Validates user permissions against the requested campus access.
   * 
   * @param {string} email - User's email address
   * @param {string} campus - Campus code to check access for
   * @returns {boolean} True if user has access to the specified campus
   * 
   * @example
   * const userService = new UserService();
   * const hasAccess = userService.hasAccessToCampus('user@nisd.net', 'NAHS');
   * if (hasAccess) {
   *   console.log('User can access NAHS data');
   * }
   */
  hasAccessToCampus(email, campus) {
    try {
      const permissions = this.getUserPermissions(email);
      const hasAccess = permissions.hasAccess && permissions.campuses.includes(campus);
      
      logDebug('Campus access check', {
        campus: campus,
        hasAccess: hasAccess
      }, 'UserService.hasAccessToCampus');
      
      return hasAccess;
    } catch (error) {
      logError('Error checking campus access', { error: error.message, email, campus }, 'UserService.hasAccessToCampus');
      return false;
    }
  }

  /**
   * Get list of campuses the user has access to.
   * Returns an array of campus codes the user is authorized to view.
   * 
   * @param {string} email - User's email address
   * @returns {Array<string>} Array of campus codes user can access
   * 
   * @example
   * const userService = new UserService();
   * const campuses = userService.getUserCampuses('user@nisd.net');
   * console.log(`User can access: ${campuses.join(', ')}`);
   */
  getUserCampuses(email) {
    try {
      const permissions = this.getUserPermissions(email);
      
      if (!permissions.hasAccess) {
        logInfo('User has no campus access', { email }, 'UserService.getUserCampuses');
        return [];
      }

      return permissions.campuses;
    } catch (error) {
      logError('Error getting user campuses', { error: error.message, email }, 'UserService.getUserCampuses');
      return [];
    }
  }

  /**
   * Check if user has full administrative access to all campuses.
   * Determines if the user has system-wide administrative privileges.
   * 
   * @param {string} email - User's email address
   * @returns {boolean} True if user has full system access, false otherwise
   * 
   * @example
   * const userService = new UserService();
   * const isAdmin = userService.hasFullAccess('admin@nisd.net');
   * if (isAdmin) {
   *   console.log('User has administrative privileges');
   * }
   */
  hasFullAccess(email) {
    try {
      const permissions = this.getUserPermissions(email);
      return permissions.isFullAccess;
    } catch (error) {
      logError('Error checking full access', { error: error.message, email }, 'UserService.hasFullAccess');
      return false;
    }
  }

  /**
   * Log user activity for audit and monitoring purposes.
   * Records user actions with timestamps and context for security auditing.
   * 
   * @param {string} email - User's email address
   * @param {string} action - Action performed by the user
   * @param {Object} [details={}] - Additional details about the action
   * @param {string} [details.resource] - Resource accessed
   * @param {string} [details.result] - Result of the action
   * @param {Object} [details.metadata] - Additional metadata
   * 
   * @example
   * const userService = new UserService();
   * userService.logUserActivity('user@nisd.net', 'data_export', {
   *   resource: 'caseload_data',
   *   campus: 'NAHS',
   *   recordCount: 150
   * });
   */
  logUserActivity(email, action, details = {}) {
    try {
      const activityData = {
        timestamp: new Date().toISOString(),
        user: email,
        action: action,
        details: details,
        sessionId: AppLogger.sessionId
      };

      logUserActivity(email, action, details);
      
      // @todo Future feature: create a separate audit log sheet to also write to
      // this.writeToAuditLog(activityData);
      
    } catch (error) {
      logError('Failed to log user activity', { error: error.message, email, action }, 'UserService.logUserActivity');
    }
  }

  /**
   * Clear user permissions cache for testing or when permissions change.
   * Removes cached permission data to force fresh retrieval on next access.
   * 
   * @param {string} email - User's email address
   * 
   * @example
   * const userService = new UserService();
   * userService.clearUserCache('user@nisd.net');
   * console.log('User cache cleared - next access will reload permissions');
   */
  clearUserCache(email) {
    try {
      const cacheKey = `${CONFIG.CACHE.PREFIX}permissions_${email}`;
      this.cache.remove(cacheKey);
      logInfo('User cache cleared', { email }, 'UserService.clearUserCache');
    } catch (error) {
      logWarn('Failed to clear user cache', { error: error.message, email }, 'UserService.clearUserCache');
    }
  }

  /**
   * Get comprehensive user information summary for debugging and monitoring.
   * Provides detailed user status including permissions, access rights, and validation status.
   * 
   * @param {string} email - User's email address
   * @returns {Object} User summary information object
   * @returns {string} return.email - User's email address
   * @returns {boolean} return.isValid - Whether email passes validation
   * @returns {boolean} return.hasAccess - Whether user has any system access
   * @returns {number} return.campusCount - Number of campuses user can access
   * @returns {boolean} return.isFullAccess - Whether user has full administrative access
   * @returns {string} return.role - User's role in the system
   * @returns {Array<string>} return.campuses - List of accessible campus codes
   * @returns {string} [return.error] - Error message if summary retrieval fails
   * 
   * @example
   * const userService = new UserService();
   * const summary = userService.getUserSummary('user@nisd.net');
   * console.log(`User ${summary.email} has access to ${summary.campusCount} campuses`);
   */
  getUserSummary(email) {
    try {
      const permissions = this.getUserPermissions(email);
      
      return {
        email: email,
        isValid: this.validateUserEmail(email),
        hasAccess: permissions.hasAccess,
        campusCount: permissions.campuses.length,
        isFullAccess: permissions.isFullAccess,
        role: permissions.role,
        campuses: permissions.campuses
      };
    } catch (error) {
      logError('Error getting user summary', { error: error.message, email }, 'UserService.getUserSummary');
      return {
        email: email,
        isValid: false,
        hasAccess: false,
        error: error.message
      };
    }
  }
}

/**
 * Global UserService instance for application-wide use.
 * Provides a singleton pattern for consistent user management across the application.
 * 
 * @type {UserService}
 * @global
 * 
 * @example
 * // Use the global instance throughout the application
 * const email = userService.getCurrentUserEmail();
 * const permissions = userService.getUserPermissions(email);
 */
var userService = new UserService();
