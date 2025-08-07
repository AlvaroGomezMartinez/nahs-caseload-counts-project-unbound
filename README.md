# NAHS Caseload Counts - API Documentation
<img alt="Google Apps Script" src="https://img.shields.io/badge/Google Apps Script-4285F4?style=flat&amp;logo=google&amp;logoColor=white">
<img alt="Education" src="https://img.shields.io/badge/Education-Technology-green">
<img alt="NISD" src="https://img.shields.io/badge/Northside ISD-Academic Tech-blue">

## Overview

The NAHS Caseload Counts application is a Google Apps Script-based web application that provides secure, role-based access to student caseload data for Northside ISD's Northside Alternative High School (NAHS). The application automatically filters data based on user permissions and campus assignments.

## Architecture

This application follows a modular architecture with clear separation of concerns:

### Backend Components
- **Code.js** - Main API endpoints and application entry points
- **Config.js** - Centralized configuration and constants
- **DataService.js** - Data processing and spreadsheet operations
- **UserService.js** - User authentication and permission management
- **Logger.js** - Comprehensive logging system
- **Utils.js** - Utility functions and error handling
- **Migration.js** - Year-to-year migration utilities

### Frontend
- **Index.html** - Complete web interface with embedded CSS and JavaScript

## Key Features

### Security & Access Control
- Domain-restricted access (@nisd.net emails only)
- Campus-based data filtering
- Role-based permissions
- Session management and caching

### Data Management
- Real-time spreadsheet integration
- Automatic data processing and formatting
- Performance optimization through caching
- Pagination for large datasets

### User Experience
- Responsive design for all devices
- Real-time search and filtering
- Export functionality (CSV)
- Print-friendly formatting
- Loading states and error handling

### Administrative Tools
- Health monitoring and diagnostics
- Year-to-year migration utilities
- Configuration management
- Comprehensive logging and analytics

## Getting Started

1. Deploy as an unbound Google Apps Script project
2. Configure OAuth scopes in appsscript.json
3. Update SPREADSHEET_ID in Config.js
4. Deploy as web app with domain access
5. Test with authorized users

## API Reference

The following documentation covers all public functions, classes, and configuration options available in the application.
