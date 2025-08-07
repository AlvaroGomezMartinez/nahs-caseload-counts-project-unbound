# JSDoc Documentation Guide

## Generating Documentation

### Prerequisites
1. Install Node.js (version 14 or higher)
2. Install JSDoc and dependencies:
   ```bash
   npm install
   ```

### Generate Documentation
```bash
# Generate documentation only
npm run docs

# Generate and serve documentation locally
npm run docs:serve

# Clean and rebuild documentation
npm run docs:rebuild
```

### View Documentation
After running `npm run docs:serve`, open your browser to:
```
http://localhost:8080
```

## Documentation Structure

The generated documentation will include:

### Main Modules
- **MainAPI** - Core application functions and endpoints
- **CONFIG** - Configuration constants and settings
- **DataService** - Data processing and spreadsheet operations
- **UserService** - User authentication and permissions
- **AppLogger** - Logging and monitoring
- **ErrorUtils** - Error handling utilities
- **DevUtils** - Development and debugging tools

### Key Features Documented
- Function signatures and parameters
- Return types and examples
- Error handling patterns
- Configuration options
- Security considerations
- Performance notes

## Manual Documentation Reference

### Core API Functions

#### `doGet()`
Main entry point for the web application.
- **Returns**: `HtmlOutput` - The web application interface
- **Throws**: `Error` - If initialization fails

#### `filterCaseloadData()`
Retrieves filtered caseload data for the current user.
- **Returns**: `string` - JSON string containing filtered data array
- **Security**: Automatically filters by user's campus permissions
- **Performance**: Results are cached for 2 minutes

#### `clearUserCache()`
Clears cache for the current user.
- **Returns**: `Object` - Operation result with success status
- **Use Case**: Force data refresh or troubleshooting

#### `healthCheck()`
Performs system health diagnostics.
- **Returns**: `Object` - Health status and test results
- **Admin Only**: Provides detailed system information

### Configuration (CONFIG)

#### Core Settings
```javascript
CONFIG.APP.TITLE           // Application title
CONFIG.SPREADSHEET.ID      // Target spreadsheet ID
CONFIG.SECURITY.DOMAIN     // Allowed email domain
CONFIG.CACHE.DURATION      // Cache timeout settings
```

#### User Permissions
```javascript
CONFIG.LEGACY_EMAIL_CAMPUS_MAPPING
// Maps user emails to accessible campuses
```

### DataService Class

#### Key Methods
- `initializeSpreadsheet()` - Connect to Google Sheets
- `getRawData()` - Retrieve unprocessed spreadsheet data
- `getProcessedDataForUser(email)` - Get filtered and formatted data
- `filterDataByCampuses(data, campuses)` - Apply campus-based filtering
- `formatDates(data, dateColumns)` - Format date columns
- `removeColumns(data, columnIndexes)` - Remove specified columns

#### Data Flow
1. **Raw Data Retrieval** - Connect to spreadsheet and fetch all data
2. **Permission Check** - Verify user access and get campus list
3. **Data Filtering** - Filter rows by user's assigned campuses
4. **Column Processing** - Remove hidden columns and format dates
5. **Caching** - Store processed results for performance
6. **Return** - Send formatted data to frontend

### UserService Class

#### Authentication Methods
- `getCurrentUserEmail()` - Get current user's email
- `validateUserEmail(email)` - Check if email is valid
- `getUserPermissions(email)` - Get user's campus access
- `hasFullAccess(email)` - Check if user has admin privileges

#### Permission Logic
```javascript
// Campus-based access
const permissions = userService.getUserPermissions(email);
// Returns: { hasAccess: boolean, campuses: string[], isFullAccess: boolean }

// Admin access (17 campuses = full access)
const isAdmin = permissions.campuses.length >= 17;
```

### Migration Utilities

#### Year-to-Year Functions
- `testSpreadsheetConnection(id)` - Validate new spreadsheet
- `migrateToNewSchoolYear(id)` - Complete migration workflow
- `updateSpreadsheetConfig(id)` - Update configuration safely
- `emergencyRollback(id)` - Quick revert to previous spreadsheet

#### Migration Workflow
1. **Test Connection** - Verify access to new spreadsheet
2. **Analyze Compatibility** - Check data structure matches
3. **Update Configuration** - Modify spreadsheet ID
4. **Deploy** - Push changes to production
5. **Monitor** - Watch for issues and performance

### Error Handling

#### Error Types
```javascript
ERROR_MESSAGES.INVALID_EMAIL      // Email format issues
ERROR_MESSAGES.ACCESS_DENIED      // Permission problems
ERROR_MESSAGES.DATA_LOAD_ERROR    // Spreadsheet access issues
ERROR_MESSAGES.CACHE_ERROR        // Caching problems
```

#### Error Response Format
```javascript
{
  success: false,
  message: "Human-readable error description",
  errorId: "ERR_20250806_abc123",
  timestamp: "2025-08-06T12:00:00.000Z"
}
```

### Frontend Integration

#### Google Apps Script Calls
```javascript
// Load data
google.script.run
  .withSuccessHandler(handleSuccess)
  .withFailureHandler(handleError)
  .filterCaseloadData();

// Clear cache
google.script.run
  .withSuccessHandler(showMessage)
  .clearUserCache();
```

#### Data Processing
```javascript
// Expected data format: Array of arrays
// [
//   ["Header1", "Header2", "Header3", ...],  // Headers
//   ["Value1", "Value2", "Value3", ...],     // Row 1
//   ["Value1", "Value2", "Value3", ...],     // Row 2
//   ...
// ]
```

### Security Notes

#### Access Control
- Domain restriction: Only @nisd.net emails allowed
- Campus-based filtering: Users see only their assigned campuses
- Admin functions: Restricted to specific email addresses
- Session management: Automatic timeout after inactivity

#### Data Protection
- No sensitive data in client-side code
- Server-side filtering prevents data leakage
- Audit logging for all data access
- Cache isolation per user

### Performance Optimization

#### Caching Strategy
- User permissions: Cached for 5 minutes
- Processed data: Cached for 2 minutes
- Raw spreadsheet data: Fetched on cache miss only

#### Pagination
- Default page size: 50 records
- Maximum page size: 100 records
- Client-side pagination for responsiveness

## Troubleshooting

### Common Issues

#### "No data displayed"
1. Check user permissions in CONFIG.LEGACY_EMAIL_CAMPUS_MAPPING
2. Verify spreadsheet ID and sheet name
3. Run debugDataAccess() for detailed diagnosis

#### "Permission denied"
1. Confirm user has @nisd.net email
2. Check OAuth scopes in appsscript.json
3. Verify spreadsheet sharing permissions

#### "Data loading slowly"
1. Check cache status with healthCheck()
2. Monitor spreadsheet response times
3. Consider reducing data volume

### Debug Functions
- `debugDataAccess()` - Comprehensive system test
- `healthCheck()` - Quick status check
- `getSystemInfo()` - Environment details
- `getUserInfo(email)` - User-specific diagnostics

This documentation provides a complete reference for understanding, maintaining, and extending the NAHS Caseload Counts application.
