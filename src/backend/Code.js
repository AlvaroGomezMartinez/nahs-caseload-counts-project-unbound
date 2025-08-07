/**
 * @fileoverview Main entry point and API functions for NAHS Caseload Counts application.
 * 
 * Provides the primary Google Apps Script functions that serve as the application's
 * API layer. Includes web app initialization, data retrieval endpoints, user management
 * functions, and system health monitoring. All functions implement comprehensive
 * error handling, logging, and security validation.
 * 
 * @namespace MainAPI
 * @requires CONFIG - Application configuration constants
 * @requires AppLogger - Application logging service
 * @requires userService - User authentication and permission service
 * @requires dataService - Data processing and spreadsheet service
 * @requires ErrorUtils - Error handling utilities
 * @requires HtmlService - Google Apps Script HTML service
 * @requires CacheService - Google Apps Script caching service
 * 
 * @author Alvaro Gomez, Academic Technology Coach
 * @version 1.0.0
 * @since 08-06-2025
 */

/**
 * Main entry point for the Google Apps Script web application.
 * Initializes the HTML interface and handles user access logging.
 * 
 * @returns {GoogleAppsScript.HTML.HtmlOutput} HTML output for the web application
 * @throws {Error} If web application initialization fails
 * 
 * @example
 * // This function is automatically called when users access the web app URL
 * // No direct invocation needed - handled by Google Apps Script runtime
 */
function doGet() {
  try {
    // First, try to create the basic HTML output
    const htmlOutput = HtmlService.createHtmlOutputFromFile('Index')
      .setTitle(CONFIG.APP.TITLE)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    // Only attempt logging after successful HTML creation
    try {
      logInfo('Web application accessed', null, 'doGet');
    } catch (logError) {
      // Ignore logging errors during initialization
      console.log('Logging not available yet:', logError.message);
    }
    
    // Log the access attempt
    try {
      const userEmail = userService.getCurrentUserEmail();
      userService.logUserActivity(userEmail, 'webapp_accessed');
    } catch (error) {
      try {
        logWarn('Could not log user activity for webapp access', { error: error.message }, 'doGet');
      } catch (logError) {
        console.log('Could not log user activity:', error.message);
      }
    }
    
    return htmlOutput;
  } catch (error) {
    // Create error page with detailed error information for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    };
    
    try {
      logCritical('Failed to initialize web application', { error: error.message }, 'doGet');
    } catch (logError) {
      console.log('Failed to initialize web application:', error.message);
    }
    
    // Return a detailed error page for debugging
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>Application Error - Debug Info</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .error-details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
            pre { background: #eee; padding: 10px; overflow-x: auto; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h2>Application Error - Debug Information</h2>
          <p>Sorry, the application encountered an error during initialization.</p>
          <div class="error-details">
            <h3>Error Details:</h3>
            <p><strong>Error:</strong> ${errorDetails.message}</p>
            <p><strong>Type:</strong> ${errorDetails.name}</p>
            <p><strong>Time:</strong> ${errorDetails.timestamp}</p>
            <h4>Stack Trace:</h4>
            <pre>${errorDetails.stack || 'No stack trace available'}</pre>
          </div>
          <p>If the problem persists, please contact Alvaro Gomez at alvaro.gomez@nisd.net with the above error details.</p>
        </body>
      </html>
    `).setTitle('Application Error - Debug Info');
  }
}

/**
 * Filter and return caseload data based on current user's permissions.
 * Main API endpoint for retrieving filtered student caseload data with caching,
 * permission validation, and comprehensive error handling.
 * 
 * @returns {string} JSON string containing filtered caseload data or error response
 * @returns {Object} response - Parsed JSON contains either success data or error info
 * @returns {boolean} response.success - Whether operation succeeded
 * @returns {Array<Array<*>>} [response.data] - 2D array of filtered data (if success)
 * @returns {number} [response.totalRecords] - Total number of records (if success)
 * @returns {Array<string>} [response.userCampuses] - User's accessible campuses (if success)
 * @returns {string} [response.message] - Error message (if failure)
 * @returns {string} [response.errorId] - Unique error identifier (if failure)
 * 
 * @example
 * // Called from frontend JavaScript
 * google.script.run
 *   .withSuccessHandler(data => console.log('Data loaded:', data))
 *   .withFailureHandler(error => console.error('Error:', error))
 *   .filterCaseloadData();
 */
function filterCaseloadData() {
  const startTime = new Date();
  let userEmail = null;
  
  try {
    logInfo('Starting caseload data filtering', null, 'filterCaseloadData');
    
    // Get current user
    userEmail = userService.getCurrentUserEmail();
    if (!userEmail) {
      throw new Error('Unable to identify current user');
    }
    
    logInfo('Processing data request for user', { userEmail }, 'filterCaseloadData');
    
    // Validate user access
    if (!userService.validateUserEmail(userEmail)) {
      logWarn('User access denied - invalid email', { userEmail }, 'filterCaseloadData');
      return JSON.stringify([]);
    }
    
    // Get user permissions
    const permissions = userService.getUserPermissions(userEmail);
    if (!permissions.hasAccess) {
      logInfo('User has no access permissions', { userEmail }, 'filterCaseloadData');
      userService.logUserActivity(userEmail, 'access_denied', { reason: 'no_permissions' });
      return JSON.stringify([]);
    }
    
    logDebug('User permissions verified', {
      campusCount: permissions.campuses.length,
      isFullAccess: permissions.isFullAccess
    }, 'filterCaseloadData');
    
    // Get processed data
    const data = dataService.getCachedDataForUser(userEmail);
    
    if (!data || data.length === 0) {
      logInfo('No data available for user', { userEmail }, 'filterCaseloadData');
      userService.logUserActivity(userEmail, 'data_access', { result: 'no_data' });
      return JSON.stringify([]);
    }
    
    // Log successful data access
    userService.logUserActivity(userEmail, 'data_access', {
      result: 'success',
      rowCount: data.length - 1, // Exclude header
      campusCount: permissions.campuses.length
    });
    
    logInfo('Data filtering completed successfully', {
      userEmail: userEmail,
      rowCount: data.length - 1,
      campusCount: permissions.campuses.length
    }, 'filterCaseloadData');
    
    logPerformance('filterCaseloadData (complete)', startTime);
    
    return JSON.stringify(data);
    
  } catch (error) {
    const errorResponse = ErrorUtils.handleException(error, 'filterCaseloadData');
    
    // Log user activity for failed attempts
    if (userEmail) {
      userService.logUserActivity(userEmail, 'data_access', {
        result: 'error',
        errorId: errorResponse.errorId
      });
    }
    
    logCritical('Critical error in filterCaseloadData', {
      error: error.message,
      stack: error.stack,
      userEmail: userEmail,
      errorId: errorResponse.errorId
    }, 'filterCaseloadData');
    
    // Return empty array for any errors to prevent breaking the UI
    return JSON.stringify([]);
  }
}

/**
 * Get user information for debugging (admin function)
 * @param {string} email - Optional email to check (defaults to current user)
 * @returns {Object} User information summary
 */
function getUserInfo(email = null) {
  try {
    const targetEmail = email || userService.getCurrentUserEmail();
    
    // Only allow this function for users with full access
    const currentUserEmail = userService.getCurrentUserEmail();
    if (!userService.hasFullAccess(currentUserEmail)) {
      return { error: 'Access denied - admin privileges required' };
    }
    
    const userSummary = userService.getUserSummary(targetEmail);
    const dataStats = dataService.getDataStatistics();
    
    logInfo('User info requested', { 
      requestedBy: currentUserEmail, 
      targetUser: targetEmail 
    }, 'getUserInfo');
    
    return {
      user: userSummary,
      dataStatistics: dataStats,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logError('Error getting user info', { error: error.message }, 'getUserInfo');
    return ErrorUtils.handleException(error, 'getUserInfo');
  }
}

/**
 * Clear cache for current user (useful for testing or when data updates)
 * @returns {Object} Operation result
 */
function clearUserCache() {
  try {
    const userEmail = userService.getCurrentUserEmail();
    
    if (!userEmail) {
      throw new Error('Unable to identify current user');
    }
    
    // Clear both user permissions and data cache
    userService.clearUserCache(userEmail);
    dataService.clearDataCache(userEmail);
    
    userService.logUserActivity(userEmail, 'cache_cleared');
    
    logInfo('User cache cleared successfully', { userEmail }, 'clearUserCache');
    
    return ErrorUtils.createSuccessResponse(null, 'Cache cleared successfully');
    
  } catch (error) {
    logError('Error clearing user cache', { error: error.message }, 'clearUserCache');
    return ErrorUtils.handleException(error, 'clearUserCache');
  }
}

/**
 * Health check function for monitoring application status
 * @returns {Object} Application health status
 */
function healthCheck() {
  try {
    const startTime = new Date();
    
    // Test basic functionality
    const tests = {
      spreadsheetAccess: false,
      userService: false,
      cacheService: false,
      dataProcessing: false
    };
    
    try {
      // Test spreadsheet access
      dataService.initializeSpreadsheet();
      tests.spreadsheetAccess = true;
    } catch (error) {
      logWarn('Health check: Spreadsheet access failed', { error: error.message }, 'healthCheck');
    }
    
    try {
      // Test user service
      const userEmail = userService.getCurrentUserEmail();
      tests.userService = !!userEmail;
    } catch (error) {
      logWarn('Health check: User service failed', { error: error.message }, 'healthCheck');
    }
    
    try {
      // Test cache service
      const cache = CacheService.getScriptCache();
      cache.put('health_test', 'test', 1);
      tests.cacheService = true;
    } catch (error) {
      logWarn('Health check: Cache service failed', { error: error.message }, 'healthCheck');
    }
    
    try {
      // Test data processing (basic)
      const stats = dataService.getDataStatistics();
      tests.dataProcessing = !stats.error;
    } catch (error) {
      logWarn('Health check: Data processing failed', { error: error.message }, 'healthCheck');
    }
    
    const allTestsPassed = Object.values(tests).every(test => test === true);
    const duration = new Date().getTime() - startTime.getTime();
    
    const healthStatus = {
      status: allTestsPassed ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      tests: tests,
      version: '2.0.0', // Update as needed
      environment: 'production'
    };
    
    logInfo('Health check completed', healthStatus, 'healthCheck');
    
    return healthStatus;
    
  } catch (error) {
    logError('Health check failed', { error: error.message }, 'healthCheck');
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Get application configuration (admin function)
 * @returns {Object} Safe configuration data
 */
function getAppConfig() {
  try {
    const currentUserEmail = userService.getCurrentUserEmail();
    
    // Only allow this function for users with full access
    if (!userService.hasFullAccess(currentUserEmail)) {
      return { error: 'Access denied - admin privileges required' };
    }
    
    // Return safe configuration data (exclude sensitive information)
    const safeConfig = {
      app: CONFIG.APP,
      spreadsheet: {
        sheetName: CONFIG.SPREADSHEET.SHEET_NAME,
        campusColumn: CONFIG.SPREADSHEET.CAMPUS_COLUMN,
        dateColumns: CONFIG.SPREADSHEET.DATE_COLUMNS,
        dateFormat: CONFIG.SPREADSHEET.DATE_FORMAT
      },
      campuses: CONFIG.CAMPUSES,
      contacts: CONFIG.CONTACTS,
      version: '2.0.0'
    };
    
    logInfo('App configuration requested', { requestedBy: currentUserEmail }, 'getAppConfig');
    
    return safeConfig;
    
  } catch (error) {
    logError('Error getting app config', { error: error.message }, 'getAppConfig');
    return ErrorUtils.handleException(error, 'getAppConfig');
  }
}

/**
 * Development function to get system information
 * @returns {Object} System information
 */
function getSystemInfo() {
  try {
    const currentUserEmail = userService.getCurrentUserEmail();
    
    // Only allow this function for users with full access
    if (!userService.hasFullAccess(currentUserEmail)) {
      return { error: 'Access denied - admin privileges required' };
    }
    
    DevUtils.logSystemInfo();
    
    const systemInfo = {
      timezone: Session.getScriptTimeZone(),
      locale: Session.getActiveUserLocale(),
      timestamp: new Date().toISOString(),
      sessionInfo: AppLogger.getSessionInfo(),
      user: currentUserEmail
    };
    
    logInfo('System information requested', { requestedBy: currentUserEmail }, 'getSystemInfo');
    
    return systemInfo;
    
  } catch (error) {
    logError('Error getting system info', { error: error.message }, 'getSystemInfo');
    return ErrorUtils.handleException(error, 'getSystemInfo');
  }
}

// Legacy function aliases for backward compatibility
function getCurrentUserEmail() {
  return userService.getCurrentUserEmail();
}

function removeColumns(data, columnIndexes) {
  return dataService.removeColumns(data, columnIndexes);
}

function formatDates(data, dateColumnIndexes) {
  return dataService.formatDates(data, dateColumnIndexes);
}

/**
 * Generate a unique error ID for tracking purposes.
 * @returns {string} Unique error identifier
 */
function generateErrorId() {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
  const random = Math.random().toString(36).substring(2, 8);
  return `ERR_${timestamp}_${random}`;
}

/**
 * Administrative function to update the spreadsheet ID for a new school year.
 * This function allows administrators to easily switch to a new spreadsheet
 * without modifying code. Should only be called by authorized personnel.
 * 
 * @param {string} newSpreadsheetId - The Google Sheets ID for the new spreadsheet
 * @param {string} [newSheetName='CURRENT CASELOAD'] - Optional new sheet name
 * @returns {Object} Status of the update operation
 * 
 * @example
 * // Update to new school year spreadsheet
 * updateSpreadsheetConfig('1NewSpreadsheetIdForThisYear', 'CURRENT CASELOAD');
 */
function updateSpreadsheetConfig(newSpreadsheetId, newSheetName = 'CURRENT CASELOAD') {
  try {
    const currentUserEmail = userService.getCurrentUserEmail();
    
    // Verify user has admin permissions (you may want to implement more robust checking)
    if (!currentUserEmail.includes('alvaro.gomez@nisd.net') && 
        !currentUserEmail.includes('linda.rodriguez@nisd.net')) {
      throw new Error('Unauthorized: Only administrators can update spreadsheet configuration');
    }
    
    logInfo('Spreadsheet configuration update requested', {
      requestedBy: currentUserEmail,
      newSpreadsheetId: newSpreadsheetId,
      newSheetName: newSheetName
    }, 'updateSpreadsheetConfig');
    
    // Test access to the new spreadsheet
    try {
      const testSpreadsheet = SpreadsheetApp.openById(newSpreadsheetId);
      const testSheet = testSpreadsheet.getSheetByName(newSheetName);
      
      if (!testSheet) {
        throw new Error(`Sheet "${newSheetName}" not found in the specified spreadsheet`);
      }
      
      // Test data access
      const testData = testSheet.getDataRange().getValues();
      if (!testData || testData.length === 0) {
        throw new Error('No data found in the specified sheet');
      }
      
      logInfo('New spreadsheet validated successfully', {
        spreadsheetId: newSpreadsheetId,
        sheetName: newSheetName,
        dataRows: testData.length,
        dataColumns: testData[0] ? testData[0].length : 0
      }, 'updateSpreadsheetConfig');
      
    } catch (testError) {
      throw new Error(`Cannot access new spreadsheet: ${testError.message}`);
    }
    
    // Clear all caches to force reload with new configuration
    clearUserCache();
    
    logInfo('Spreadsheet configuration would be updated', {
      oldSpreadsheetId: CONFIG.SPREADSHEET.SPREADSHEET_ID,
      newSpreadsheetId: newSpreadsheetId,
      updatedBy: currentUserEmail
    }, 'updateSpreadsheetConfig');
    
    return {
      success: true,
      message: `Validation successful! To complete the update, please modify CONFIG.SPREADSHEET.SPREADSHEET_ID in Config.js from "${CONFIG.SPREADSHEET.SPREADSHEET_ID}" to "${newSpreadsheetId}"`,
      currentSpreadsheetId: CONFIG.SPREADSHEET.SPREADSHEET_ID,
      newSpreadsheetId: newSpreadsheetId,
      updatedBy: currentUserEmail,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logError('Failed to update spreadsheet configuration', {
      error: error.message,
      newSpreadsheetId: newSpreadsheetId
    }, 'updateSpreadsheetConfig');
    
    return {
      success: false,
      message: error.message,
      errorId: generateErrorId(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get current spreadsheet configuration information.
 * Useful for administrators to verify current settings and plan migrations.
 * 
 * @returns {Object} Current spreadsheet configuration
 * 
 * @example
 * const config = getSpreadsheetConfig();
 * console.log('Current spreadsheet ID:', config.spreadsheetId);
 */
function getSpreadsheetConfig() {
  try {
    const currentUserEmail = userService.getCurrentUserEmail();
    
    logInfo('Spreadsheet configuration requested', {
      requestedBy: currentUserEmail
    }, 'getSpreadsheetConfig');
    
    return {
      success: true,
      spreadsheetId: CONFIG.SPREADSHEET.SPREADSHEET_ID,
      sheetName: CONFIG.SPREADSHEET.SHEET_NAME,
      campusColumn: CONFIG.SPREADSHEET.CAMPUS_COLUMN,
      dateColumns: CONFIG.SPREADSHEET.DATE_COLUMNS,
      columnsToRemove: CONFIG.SPREADSHEET.COLUMNS_TO_REMOVE,
      dateFormat: CONFIG.SPREADSHEET.DATE_FORMAT,
      requestedBy: currentUserEmail,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logError('Failed to get spreadsheet configuration', {
      error: error.message
    }, 'getSpreadsheetConfig');
    
    return {
      success: false,
      message: error.message,
      errorId: generateErrorId(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test connection to a specific spreadsheet without updating configuration.
 * Useful for validating new spreadsheets before migration.
 * 
 * @param {string} spreadsheetId - The Google Sheets ID to test
 * @param {string} [sheetName='CURRENT CASELOAD'] - Sheet name to test
 * @returns {Object} Test results
 * 
 * @example
 * const testResult = testSpreadsheetConnection('1NewSpreadsheetId');
 * if (testResult.success) {
 *   console.log('Spreadsheet is ready for migration');
 * }
 */
function testSpreadsheetConnection(spreadsheetId, sheetName = 'CURRENT CASELOAD') {
  try {
    const currentUserEmail = userService.getCurrentUserEmail();
    
    logInfo('Testing spreadsheet connection', {
      requestedBy: currentUserEmail,
      testSpreadsheetId: spreadsheetId,
      testSheetName: sheetName
    }, 'testSpreadsheetConnection');
    
    // Test spreadsheet access
    const testSpreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const spreadsheetName = testSpreadsheet.getName();
    
    // Test sheet access
    const testSheet = testSpreadsheet.getSheetByName(sheetName);
    if (!testSheet) {
      throw new Error(`Sheet "${sheetName}" not found in spreadsheet`);
    }
    
    // Test data access
    const testData = testSheet.getDataRange().getValues();
    if (!testData || testData.length === 0) {
      return {
        success: false,
        message: 'No data found in the specified sheet',
        spreadsheetId: spreadsheetId,
        sheetName: sheetName
      };
    }
    
    // Analyze data structure
    const headers = testData[0] || [];
    const campusColumnIndex = headers.findIndex(header => 
      header && header.toString().toUpperCase().includes('CAMPUS')
    );
    
    const analysisResult = {
      success: true,
      message: 'Spreadsheet connection test successful',
      spreadsheetId: spreadsheetId,
      spreadsheetName: spreadsheetName,
      sheetName: sheetName,
      dataRows: testData.length - 1, // Exclude header
      dataColumns: headers.length,
      headers: headers,
      campusColumnFound: campusColumnIndex >= 0,
      campusColumnIndex: campusColumnIndex,
      sampleData: testData.slice(0, Math.min(3, testData.length)), // First 3 rows including header
      testedBy: currentUserEmail,
      timestamp: new Date().toISOString()
    };
    
    logInfo('Spreadsheet connection test completed successfully', {
      spreadsheetId: spreadsheetId,
      dataRows: analysisResult.dataRows,
      campusColumnFound: analysisResult.campusColumnFound
    }, 'testSpreadsheetConnection');
    
    return analysisResult;
    
  } catch (error) {
    logError('Spreadsheet connection test failed', {
      error: error.message,
      spreadsheetId: spreadsheetId,
      sheetName: sheetName
    }, 'testSpreadsheetConnection');
    
    return {
      success: false,
      message: `Connection test failed: ${error.message}`,
      spreadsheetId: spreadsheetId,
      sheetName: sheetName,
      errorId: generateErrorId(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * DEBUG FUNCTION: Test the current spreadsheet configuration and data access.
 * Use this to troubleshoot why data isn't showing up in the webapp.
 * 
 * @returns {Object} Comprehensive debugging information
 */
function debugDataAccess() {
  try {
    const currentUserEmail = userService.getCurrentUserEmail();
    const debugResult = {
      timestamp: new Date().toISOString(),
      user: currentUserEmail,
      steps: {}
    };
    
    // Step 1: Test spreadsheet access
    console.log('Step 1: Testing spreadsheet access...');
    debugResult.steps.step1_spreadsheet = testSpreadsheetConnection(CONFIG.SPREADSHEET.SPREADSHEET_ID, CONFIG.SPREADSHEET.SHEET_NAME);
    
    // Step 2: Test user permissions
    console.log('Step 2: Testing user permissions...');
    try {
      const permissions = userService.getUserPermissions(currentUserEmail);
      debugResult.steps.step2_permissions = {
        success: true,
        hasAccess: permissions.hasAccess,
        campuses: permissions.campuses,
        isFullAccess: permissions.isFullAccess,
        userEmail: currentUserEmail
      };
    } catch (error) {
      debugResult.steps.step2_permissions = {
        success: false,
        error: error.message
      };
    }
    
    // Step 3: Test data service
    console.log('Step 3: Testing data service...');
    try {
      dataService.initializeSpreadsheet();
      const rawData = dataService.getRawData();
      debugResult.steps.step3_dataService = {
        success: true,
        rawDataRows: rawData ? rawData.length : 0,
        rawDataColumns: rawData && rawData[0] ? rawData[0].length : 0,
        firstFewRows: rawData ? rawData.slice(0, 3) : []
      };
    } catch (error) {
      debugResult.steps.step3_dataService = {
        success: false,
        error: error.message
      };
    }
    
    // Step 4: Test full data retrieval for user
    console.log('Step 4: Testing full data retrieval...');
    try {
      const userData = dataService.getCachedDataForUser(currentUserEmail);
      debugResult.steps.step4_userData = {
        success: true,
        userDataRows: userData ? userData.length : 0,
        userDataColumns: userData && userData[0] ? userData[0].length : 0,
        sampleUserData: userData ? userData.slice(0, 3) : []
      };
    } catch (error) {
      debugResult.steps.step4_userData = {
        success: false,
        error: error.message
      };
    }
    
    // Step 5: Test configuration
    console.log('Step 5: Testing configuration...');
    debugResult.steps.step5_config = {
      spreadsheetId: CONFIG.SPREADSHEET.SPREADSHEET_ID,
      sheetName: CONFIG.SPREADSHEET.SHEET_NAME,
      campusColumn: CONFIG.SPREADSHEET.CAMPUS_COLUMN,
      userInLegacyMapping: !!CONFIG.LEGACY_EMAIL_CAMPUS_MAPPING[currentUserEmail]
    };
    
    console.log('Debug analysis complete!');
    console.log('Check the returned object for detailed results');
    
    return debugResult;
    
  } catch (error) {
    console.error('Debug function failed:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
