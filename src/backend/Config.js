/**
 * @fileoverview Configuration settings for NAHS Caseload Counts application
 * Centralizes all configuration data for easier maintenance and updates.
 * 
 * @author Alvaro Gomez
 * @version 1.0.0
 * @since 08-06-2025
 */

/**
 * Main configuration object containing all application settings.
 * This object centralizes configuration to make the application easier to maintain.
 * 
 * @namespace CONFIG
 *
 * @readonly
 */
const CONFIG = {
  /**
   * Application-wide settings and metadata.
   * @namespace CONFIG.APP
   *
   */
  APP: {
    /** Title displayed in browser tab */
    TITLE: 'NAHS Caseload',
    /** Full project name */
    PROJECT_NAME: 'NAHS CASELOAD/COUNTS',
    /** Department responsible for the project */
    DEPARTMENT: 'Academic Technology',
    /** Organization name */
    ORGANIZATION: 'Northside ISD - Northside Alternative High School'
  },

  /**
   * Spreadsheet-related configuration settings.
   * @namespace CONFIG.SPREADSHEET
   *
   */
  SPREADSHEET: {
    /** 
     * Google Sheets ID for the data source
     * 
     * IMPORTANT: For yearly updates, change this ID to the new spreadsheet.
     * Use the testSpreadsheetConnection() function to validate new spreadsheets
     * before updating this configuration.
     * 
     * Year-to-year migration process:
     * 1. Run testSpreadsheetConnection('new_spreadsheet_id') to validate
     * 2. Update this SPREADSHEET_ID value
     * 3. Deploy the updated script
     * 4. Test the application with a few users
     * 
     * Current spreadsheet: NAHS Caseload 2024-2025
     */
    SPREADSHEET_ID: '1SxbUOEIaogQyy66E4fvLcIqblGnvueduSaYz1ftsAEA',
    /** Name of the main data sheet */
    SHEET_NAME: 'CURRENT CASELOAD',
    /** Name of user permissions sheet (future implementation) */
    USER_PERMISSIONS_SHEET: 'User Permissions',
    /** Column name containing campus information */
    CAMPUS_COLUMN: 'HOME CAMPUS',
    /** Columns containing date values that need formatting */
    DATE_COLUMNS: ['ENTRY DATE', 'ESCHOOL ', 'LAST ARD', 'DATA SHARED', 'IEP SHARED'],
    /** Column indices to remove from display (0-indexed) */
    COLUMNS_TO_REMOVE: [7, 8, 9, 12, 13, 14],
    /** Format string for date display */
    DATE_FORMAT: 'MM/dd/yy'
  },

  /**
   * Caching configuration for performance optimization.
   * @namespace CONFIG.CACHE
   *
   */
  CACHE: {
    /** Duration in seconds for user permissions cache */
    USER_PERMISSIONS_DURATION: 5 * 60,
    /** Duration in seconds for data cache */
    DATA_CACHE_DURATION: 2 * 60,
    /** Prefix for all cache keys */
    PREFIX: 'nahs_caseload_'
  },

  /**
   * Security and access control settings.
   * @namespace CONFIG.SECURITY
   *
   */
  SECURITY: {
    /** Required email domain for access */
    ALLOWED_DOMAIN: '@nisd.net',
    /** Number of campuses that indicates full administrative access */
    FULL_ACCESS_CAMPUS_COUNT: 17,
    /** Session timeout in seconds */
    SESSION_TIMEOUT: 30 * 60
  },

  /**
   * Pagination settings for data display.
   * @namespace CONFIG.PAGINATION
   *
   */
  PAGINATION: {
    /** Default number of records per page */
    DEFAULT_PAGE_SIZE: 50,
    /** Maximum allowed records per page */
    MAX_PAGE_SIZE: 100
  },

  /**
   * List of all campus names in the district.
   *
   */
  CAMPUSES: [
    'Brandeis', 'Brennan', 'Clark', 'Harlan', 'Holmgreen', 
    'Health Careers', 'Excel', 'Holmes', 'Jay', 'Marshall', 
    'O\'Connor', 'NAHS', 'Sotomayor', 'Stevens', 'Taft', 
    'Warren', 'Reddix'
  ],

  /**
   * Contact information for project stakeholders.
   * @namespace CONFIG.CONTACTS
   *
   */
  CONTACTS: {
    /** 
     * Person who requested this feature.
     *
     * @property {string} name - Full name
     * @property {string} email - Email address
     */
    TEACHER: {
      name: 'Linda Rodriguez',
      email: 'linda.rodriguez@nisd.net'
    },
    /** 
     * Developer and maintainer of the application.
     *
     * @property {string} name - Full name
     * @property {string} email - Email address
     * @property {string} office - Office phone number
     */
    DEVELOPER: {
      name: 'Alvaro Gomez',
      email: 'alvaro.gomez@nisd.net',
      office: '1-210-397-9408',
    }
  },

  /**
   * Legacy email-to-campus mapping for user permissions.
   * @deprecated This will be migrated to a spreadsheet-based system in future versions.
   *
   * @description Maps user email addresses to arrays of campus names they can access.
   */
  LEGACY_EMAIL_CAMPUS_MAPPING: {
    "alvaro.gomez@nisd.net": ["Brandeis", "Brennan", "Clark", "Harlan"],
    
    // Brandeis staff
    "desiree.stjean@nisd.net": ["Brandeis"],
    "belinda.myles@nisd.net": ["Brandeis"],
    "sabina.turov@nisd.net": ["Brandeis"],

    // Brennan staff
    "dora.salazar@nisd.net": ["Brennan"],

    // Clark staff
    "elizabeth.rockgutierrez@nisd.net": ["Clark"],
    "karen.pumphrey@nisd.net": ["Clark"],

    // Harlan staff
    "erica.koegellara@nisd.net": ["Harlan"],
    "andrea.aguirre@nisd.net": ["Harlan"],

    // Health Careers, Excel, Holmgreen staff
    "eva.longoria@nisd.net": ["Health Careers", "Excel", "Holmgreen"],

    // Holmes staff
    "leticia.lerma@nisd.net": ["Holmes"],
    "demi.cruz@nisd.net": ["Holmes"],

    // Jay staff
    "erin.ramos@nisd.net": ["Jay"],
    "richard.ramos@nisd.net": ["Jay"],

    // Marshall staff
    "kayla.webb@nisd.net": ["Marshall"],
    "shelley.stogsdill@nisd.net": ["Marshall"],

    // O'Connor staff
    "anita.packen@nisd.net": ["O'Connor"],
    "mike.mcnierney@nisd.net": ["O'Connor"],

    // Full access - Linda Rodriguez
    "linda.rodriguez@nisd.net": [
      "Brandeis", "Brennan", "Clark", "Harlan", "Holmgreen", 
      "Health Careers", "Excel", "Holmes", "Jay", "Marshall", 
      "O'Connor", "NAHS", "Sotomayor", "Stevens", "Taft", 
      "Warren", "Reddix"
    ],

    // Sotomayor staff
    "javonne.collier@nisd.net": ["Sotomayor"],

    // Stevens staff
    "claudia.justice@nisd.net": ["Stevens"],
    "ariel.hill@nisd.net": ["Stevens"],

    // Taft staff
    "jasmine-1.flores@nisd.net": ["Taft"],
    "judy.harlin-alamo@nisd.net": ["Taft"],

    // Warren staff
    "stephanie.lucero-moncada@nisd.net": ["Warren"],
    "jace.pierson@nisd.net": ["Warren"],

    // Reddix staff
    "mark.marcinik@nisd.net": ["Reddix"],
    "lizeth.herrera@nisd.net": ["Reddix"]
  }
};

/**
 * Column name constants for better maintainability and type safety.
 * @namespace COLUMNS
 *
 * @readonly
 */
const COLUMNS = {
  /** Column containing home campus information */
  HOME_CAMPUS: 'HOME CAMPUS',
  /** Column containing student entry date */
  ENTRY_DATE: 'ENTRY DATE',
  /** Column containing eSchool information */
  ESCHOOL: 'ESCHOOL ',
  /** Column containing last ARD date */
  LAST_ARD: 'LAST ARD',
  /** Column containing data shared information */
  DATA_SHARED: 'DATA SHARED',
  /** Column containing IEP shared information */
  IEP_SHARED: 'IEP SHARED'
};

/**
 * Standardized error messages used throughout the application.
 * @namespace ERROR_MESSAGES
 *
 * @readonly
 */
const ERROR_MESSAGES = {
  /** Error when email format is invalid */
  INVALID_EMAIL: 'Invalid email format provided',
  /** Error when user lacks proper permissions */
  ACCESS_DENIED: 'Access denied: Invalid domain or permissions',
  /** Error when campus column is not found */
  NO_CAMPUS_COLUMN: 'No HOME CAMPUS column found in the sheet',
  /** Error when data cannot be loaded from spreadsheet */
  DATA_LOAD_ERROR: 'Error loading data from spreadsheet',
  /** Error when cache service fails */
  CACHE_ERROR: 'Error accessing cache service',
  /** Error when checking user permissions */
  PERMISSION_ERROR: 'Error checking user permissions',
  /** Error when data is invalid or corrupted */
  INVALID_DATA: 'Invalid or corrupted data received'
};

/**
 * Standardized success messages for user feedback.
 * @namespace SUCCESS_MESSAGES
 *
 * @readonly
 */
const SUCCESS_MESSAGES = {
  /** Success message for data loading */
  DATA_LOADED: 'Data loaded successfully',
  /** Success message for cache updates */
  CACHE_UPDATED: 'Cache updated successfully',
  /** Success message for permission verification */
  PERMISSIONS_VERIFIED: 'User permissions verified'
};
