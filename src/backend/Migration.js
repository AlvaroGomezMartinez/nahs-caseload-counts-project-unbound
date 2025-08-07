/**
 * @fileoverview Migration utilities for yearly spreadsheet updates
 * This file contains helper functions specifically for managing year-to-year
 * transitions in the NAHS Caseload Counts application.
 * 
 * @author Alvaro Gomez, Academic Technology Coach
 * @version 1.0.0
 * @since 08-06-2025
 */

/**
 * Quick migration script for updating to a new school year spreadsheet.
 * This function provides an all-in-one solution for validating and updating
 * the spreadsheet configuration for a new school year.
 * 
 * IMPORTANT: After running this function successfully, you must manually
 * update the SPREADSHEET_ID in Config.js and redeploy the application.
 * 
 * @param {string} newSpreadsheetId - The Google Sheets ID for the new school year
 * @param {string} [newSheetName='CURRENT CASELOAD'] - Sheet name (usually unchanged)
 * @returns {Object} Migration results and instructions
 * 
 * @example
 * // Run this in the Apps Script console for new school year migration:
 * migrateToNewSchoolYear('1NewSpreadsheetIdForNewYear2025')
 */
function migrateToNewSchoolYear(newSpreadsheetId, newSheetName = 'CURRENT CASELOAD') {
  const migrationStart = new Date();
  const currentUserEmail = userService.getCurrentUserEmail();
  
  try {
    logInfo('Starting school year migration process', {
      newSpreadsheetId: newSpreadsheetId,
      requestedBy: currentUserEmail,
      migrationStart: migrationStart.toISOString()
    }, 'migrateToNewSchoolYear');
    
    // Step 1: Verify administrator access
    if (!currentUserEmail.includes('alvaro.gomez@nisd.net') && 
        !currentUserEmail.includes('linda.rodriguez@nisd.net')) {
      throw new Error('Unauthorized: Only administrators can perform school year migration');
    }
    
    // Step 2: Test connection to new spreadsheet
    console.log('Step 1: Testing connection to new spreadsheet...');
    const connectionTest = testSpreadsheetConnection(newSpreadsheetId, newSheetName);
    
    if (!connectionTest.success) {
      throw new Error(`New spreadsheet validation failed: ${connectionTest.message}`);
    }
    
    console.log('✓ New spreadsheet validation successful');
    
    // Step 3: Get current configuration for comparison
    console.log('Step 2: Getting current configuration...');
    const currentConfig = getSpreadsheetConfig();
    
    // Step 4: Analyze data structure compatibility
    console.log('Step 3: Analyzing data structure compatibility...');
    const compatibility = analyzeDataCompatibility(currentConfig, connectionTest);
    
    // Step 5: Create backup recommendation
    console.log('Step 4: Preparing migration summary...');
    
    const migrationSummary = {
      success: true,
      migrationId: generateErrorId(), // Using error ID generator for unique ID
      timestamp: new Date().toISOString(),
      performedBy: currentUserEmail,
      
      // Current state
      currentConfiguration: {
        spreadsheetId: currentConfig.spreadsheetId,
        sheetName: currentConfig.sheetName
      },
      
      // New state
      newConfiguration: {
        spreadsheetId: newSpreadsheetId,
        sheetName: newSheetName,
        spreadsheetName: connectionTest.spreadsheetName,
        dataRows: connectionTest.dataRows,
        dataColumns: connectionTest.dataColumns
      },
      
      // Compatibility analysis
      compatibility: compatibility,
      
      // Next steps
      instructions: {
        step1: 'Update CONFIG.SPREADSHEET.SPREADSHEET_ID in Config.js',
        step2: 'Save the configuration changes',
        step3: 'Deploy a new version of the web app',
        step4: 'Test with sample users from different campuses',
        step5: 'Notify users of any changes or downtime',
        
        configUpdate: `Change line in Config.js from:\nSPREADSHEET_ID: '${currentConfig.spreadsheetId}',\nTo:\nSPREADSHEET_ID: '${newSpreadsheetId}',`
      },
      
      // Warnings and recommendations
      warnings: compatibility.warnings || [],
      recommendations: [
        'Test the application thoroughly before announcing to users',
        'Keep the old spreadsheet ID documented for emergency rollback',
        'Monitor application logs for the first few days after migration',
        'Verify that all expected campuses appear in the new data'
      ]
    };
    
    // Step 6: Clear caches to ensure fresh data on next load
    console.log('Step 5: Clearing application caches...');
    clearUserCache();
    
    logInfo('School year migration analysis completed successfully', {
      migrationId: migrationSummary.migrationId,
      newSpreadsheetId: newSpreadsheetId,
      dataRows: connectionTest.dataRows,
      compatibilityScore: compatibility.score
    }, 'migrateToNewSchoolYear');
    
    return migrationSummary;
    
  } catch (error) {
    logError('School year migration failed', {
      error: error.message,
      newSpreadsheetId: newSpreadsheetId,
      requestedBy: currentUserEmail
    }, 'migrateToNewSchoolYear');
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      instructions: {
        troubleshooting: 'Check the error message above and verify spreadsheet access permissions'
      }
    };
  }
}

/**
 * Analyze compatibility between current and new spreadsheet data structures.
 * Helps identify potential issues before migration.
 * 
 * @param {Object} currentConfig - Current spreadsheet configuration
 * @param {Object} newSpreadsheetTest - Test results from new spreadsheet
 * @returns {Object} Compatibility analysis results
 */
function analyzeDataCompatibility(currentConfig, newSpreadsheetTest) {
  const compatibility = {
    score: 0,
    maxScore: 100,
    warnings: [],
    recommendations: []
  };
  
  try {
    // Check if new spreadsheet has data
    if (newSpreadsheetTest.dataRows > 0) {
      compatibility.score += 30;
    } else {
      compatibility.warnings.push('New spreadsheet appears to have no data rows');
    }
    
    // Check for campus column
    if (newSpreadsheetTest.campusColumnFound) {
      compatibility.score += 25;
    } else {
      compatibility.warnings.push('Campus column not clearly identified in new spreadsheet');
      compatibility.recommendations.push('Verify that a column containing campus information exists');
    }
    
    // Check headers exist
    if (newSpreadsheetTest.headers && newSpreadsheetTest.headers.length > 0) {
      compatibility.score += 20;
    } else {
      compatibility.warnings.push('No headers found in new spreadsheet');
    }
    
    // Check reasonable number of columns
    if (newSpreadsheetTest.dataColumns >= 5 && newSpreadsheetTest.dataColumns <= 50) {
      compatibility.score += 15;
    } else if (newSpreadsheetTest.dataColumns < 5) {
      compatibility.warnings.push('New spreadsheet has very few columns - may be missing data');
    } else {
      compatibility.warnings.push('New spreadsheet has many columns - may need configuration updates');
    }
    
    // Check data volume is reasonable
    if (newSpreadsheetTest.dataRows >= 10 && newSpreadsheetTest.dataRows <= 10000) {
      compatibility.score += 10;
    } else if (newSpreadsheetTest.dataRows < 10) {
      compatibility.warnings.push('New spreadsheet has very little data');
    } else {
      compatibility.warnings.push('New spreadsheet has a large amount of data - performance may be affected');
    }
    
    // Determine overall compatibility level
    let compatibilityLevel;
    if (compatibility.score >= 90) {
      compatibilityLevel = 'EXCELLENT';
    } else if (compatibility.score >= 70) {
      compatibilityLevel = 'GOOD';
    } else if (compatibility.score >= 50) {
      compatibilityLevel = 'FAIR';
    } else {
      compatibilityLevel = 'POOR';
    }
    
    compatibility.level = compatibilityLevel;
    compatibility.summary = `Compatibility: ${compatibilityLevel} (${compatibility.score}/${compatibility.maxScore})`;
    
    return compatibility;
    
  } catch (error) {
    logError('Error analyzing data compatibility', { error: error.message }, 'analyzeDataCompatibility');
    return {
      score: 0,
      level: 'ERROR',
      error: error.message,
      warnings: ['Could not analyze data compatibility due to error']
    };
  }
}

/**
 * Emergency rollback function to quickly revert to previous spreadsheet.
 * Use this if issues are discovered after migration.
 * 
 * @param {string} previousSpreadsheetId - The previous spreadsheet ID to roll back to
 * @returns {Object} Rollback results
 * 
 * @example
 * // Emergency rollback to previous year:
 * emergencyRollback('1PreviousSpreadsheetId')
 */
function emergencyRollback(previousSpreadsheetId) {
  try {
    const currentUserEmail = userService.getCurrentUserEmail();
    
    logWarn('Emergency rollback initiated', {
      requestedBy: currentUserEmail,
      rollbackToSpreadsheetId: previousSpreadsheetId,
      currentSpreadsheetId: CONFIG.SPREADSHEET.SPREADSHEET_ID
    }, 'emergencyRollback');
    
    // Test the rollback target
    const rollbackTest = testSpreadsheetConnection(previousSpreadsheetId);
    
    if (!rollbackTest.success) {
      throw new Error(`Rollback target validation failed: ${rollbackTest.message}`);
    }
    
    // Clear all caches
    clearUserCache();
    
    return {
      success: true,
      message: 'Rollback target validated successfully',
      instructions: {
        step1: `Update CONFIG.SPREADSHEET.SPREADSHEET_ID in Config.js to: '${previousSpreadsheetId}'`,
        step2: 'Deploy the rollback version immediately',
        step3: 'Test the application functionality',
        step4: 'Notify users of the temporary rollback'
      },
      rollbackTarget: rollbackTest,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logCritical('Emergency rollback failed', {
      error: error.message,
      rollbackToSpreadsheetId: previousSpreadsheetId
    }, 'emergencyRollback');
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate a pre-migration checklist for administrators.
 * Helps ensure all necessary steps are completed before migration.
 * 
 * @returns {Object} Pre-migration checklist
 */
function generatePreMigrationChecklist() {
  return {
    checklist: {
      dataPreparation: [
        '□ New school year spreadsheet has been created',
        '□ Data has been populated in the new spreadsheet',
        '□ Sheet is named "CURRENT CASELOAD"',
        '□ Column headers match expected format',
        '□ Campus column contains recognizable campus names',
        '□ Date columns are properly formatted',
        '□ No sensitive data is exposed inappropriately'
      ],
      technicalPreparation: [
        '□ Current application is functioning normally',
        '□ Recent backup of current configuration exists',
        '□ New spreadsheet ID has been obtained',
        '□ Test user accounts are available for validation',
        '□ Rollback plan has been prepared'
      ],
      communicationPreparation: [
        '□ Users have been notified of planned maintenance window',
        '□ Campus coordinators are aware of the migration',
        '□ Support contacts are available during migration',
        '□ Documentation has been updated for new school year'
      ],
      postMigrationPlan: [
        '□ Testing plan for different user types prepared',
        '□ Performance monitoring plan in place',
        '□ User feedback collection method established',
        '□ Issue escalation process defined'
      ]
    },
    recommendations: [
      'Perform migration during low-usage periods (evenings/weekends)',
      'Have the previous spreadsheet ID ready for emergency rollback',
      'Test thoroughly with users from multiple campuses',
      'Monitor application logs closely for the first week'
    ],
    emergencyContacts: [
      'Alvaro Gomez (Technical): alvaro.gomez@nisd.net',
      'Linda Rodriguez (Coordinator): linda.rodriguez@nisd.net'
    ]
  };
}
