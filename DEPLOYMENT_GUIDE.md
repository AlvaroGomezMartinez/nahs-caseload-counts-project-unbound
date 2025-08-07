# NAHS Caseload Counts - Unbound Script Deployment Guide

## Overview
This guide explains how to deploy the NAHS Caseload Counts application as an unbound Google Apps Script project that connects to your Google Sheets data source.

## What Changed for Unbound Migration

### Key Changes Made:
1. **Spreadsheet Connection**: Changed from `SpreadsheetApp.getActiveSpreadsheet()` to `SpreadsheetApp.openById()`
2. **Configuration**: Added `SPREADSHEET_ID` constant in `Config.js`
3. **Year-to-Year Migration**: Added utility functions for easy yearly transitions
4. **Enhanced Error Handling**: Better error messages for spreadsheet access issues

### Target Spreadsheet:
- **ID**: `1SxbUOEIaogQyy66E4fvLcIqblGnvueduSaYz1ftsAEA`
- **Sheet Name**: `CURRENT CASELOAD`

## Deployment Steps

### 1. Create New Google Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New project"
3. Rename the project to "NAHS Caseload Counts - Unbound"

### 2. Upload Project Files
Copy the contents of each file from this project to the new Apps Script project:

#### Required Files:
- `Code.js` → Copy from `src/backend/Code.js`
- `Config.js` → Copy from `src/backend/Config.js`  
- `DataService.js` → Copy from `src/backend/DataService.js`
- `UserService.js` → Copy from `src/backend/UserService.js`
- `Logger.js` → Copy from `src/backend/Logger.js`
- `Utils.js` → Copy from `src/backend/Utils.js`
- `Index.html` → Copy from `Index.html`

### 3. Configure Permissions
1. In the Apps Script editor, go to "Project Settings"
2. Check "Show 'appsscript.json' manifest file in editor"
3. Update `appsscript.json` with:
```json
{
  "timeZone": "America/Chicago",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "access": "DOMAIN",
    "executeAs": "USER_ACCESSING"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}
```

### 4. Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Description: "NAHS Caseload Counts - Production"
4. Execute as: "Me"
5. Who has access: "Anyone at Northside ISD"
6. Click "Deploy"
7. Copy the web app URL

### 5. Test the Deployment
1. Open the web app URL
2. Test with different user accounts (staff from different campuses)
3. Verify data loads correctly
4. Test search and filter functionality

## Spreadsheet Requirements

### Required Sheet Structure:
The target spreadsheet must have a sheet named "CURRENT CASELOAD" with these characteristics:
- Headers in the first row
- Must include a column with "CAMPUS" in the name (for filtering)
- Date columns should follow MM/dd/yy format
- No empty headers

### Recommended Column Structure:
The application expects these types of columns (exact names may vary):
- Student identification
- Campus information (required for filtering)
- Case manager/staff information  
- Entry dates
- Status information
- Contact information

## Year-to-Year Migration Process

### For Each New School Year:

#### Option 1: Using Built-in Migration Functions
1. Test the new spreadsheet:
   ```javascript
   // In Apps Script console, run:
   testSpreadsheetConnection('NEW_SPREADSHEET_ID_HERE')
   ```

2. If test passes, get current config:
   ```javascript
   getSpreadsheetConfig()
   ```

3. Validate the migration:
   ```javascript
   updateSpreadsheetConfig('NEW_SPREADSHEET_ID_HERE', 'CURRENT CASELOAD')
   ```

#### Option 2: Manual Configuration Update
1. Open `Config.js` in the Apps Script editor
2. Update the `SPREADSHEET_ID` value:
   ```javascript
   SPREADSHEET_ID: 'NEW_SPREADSHEET_ID_HERE',
   ```
3. Save and deploy a new version

### Migration Checklist:
- [ ] New spreadsheet has "CURRENT CASELOAD" sheet
- [ ] Sheet contains current year's data
- [ ] Column structure matches previous year
- [ ] Test connection using utility functions
- [ ] Update configuration
- [ ] Deploy new version
- [ ] Test with sample users
- [ ] Notify users of any changes

## Permissions and Security

### User Access:
- All users must have `@nisd.net` email addresses
- Campus-based filtering is automatic based on user email
- Full administrative access is granted to specified admin accounts

### Required Spreadsheet Permissions:
- The script must have "View" access to the target spreadsheet
- Consider using a service account for production deployments

### Administrative Functions:
The following functions are restricted to administrators:
- `updateSpreadsheetConfig()`
- `getSpreadsheetConfig()`
- `testSpreadsheetConnection()`

## Troubleshooting

### Common Issues:

#### "Cannot access spreadsheet" Error:
1. Verify the spreadsheet ID is correct
2. Check that the script has permission to access the spreadsheet
3. Ensure the "CURRENT CASELOAD" sheet exists

#### "No data found" Error:
1. Check that the sheet has data
2. Verify the sheet name is exactly "CURRENT CASELOAD"
3. Ensure headers are in the first row

#### User Access Issues:
1. Verify user has `@nisd.net` email
2. Check that user's campus is represented in the data
3. Review user permission logic in `UserService.js`

### Debug Functions:
Use these functions for troubleshooting:
- `healthCheck()` - Overall system health
- `getSystemInfo()` - System configuration
- `testSpreadsheetConnection()` - Test specific spreadsheet

## Maintenance

### Regular Tasks:
- Monitor application logs for errors
- Update spreadsheet ID for new school years
- Review and update user permissions as needed
- Test functionality after Google Apps Script updates

### Performance Optimization:
- Data is cached for 2 minutes to improve performance
- Large datasets are paginated (50 rows per page)
- Search is debounced to reduce server calls

## Support Contacts

### Technical Support:
- **Alvaro Gomez**, Academic Technology Coach
- **Email**: alvaro.gomez@nisd.net
- **Office**: 979408

### Campus Coordinator:
- **Linda Rodriguez**, NAHS Campus Coordinator  
- **Email**: linda.rodriguez@nisd.net
- **Office**: 977080

---

## Additional Notes

### Advantages of Unbound Script:
- Easier year-to-year migration
- Can connect to any spreadsheet with proper ID
- More flexible deployment options
- Better version control

### Migration Benefits:
- Reduced setup time for new school years
- Centralized configuration management
- Improved error handling and diagnostics
- Better support for multiple spreadsheet sources

This deployment approach provides a robust, maintainable solution for the NAHS Caseload Counts application that can easily adapt to yearly changes in data sources.
