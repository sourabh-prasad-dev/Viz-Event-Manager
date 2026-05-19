/**
 * VizEvent — Google Apps Script Configuration
 * Contains constants, sheet references, and API keys.
 */

// ─── Configuration ──────────────────────────────────────
var CONFIG = {
  // Master config spreadsheet ID (replace with your actual spreadsheet ID)
  MASTER_SHEET_ID: 'YOUR_MASTER_SPREADSHEET_ID',

  // Sheet names in the master spreadsheet
  EVENTS_SHEET: 'Events',
  USERS_SHEET: 'Users',
  SESSIONS_SHEET: 'Sessions',

  // Per-event spreadsheet column order
  EVENT_COLUMNS: ['RegistrationId', 'FullName', 'Email', 'Phone', 'Company', 'EventId', 'QRToken', 'Status', 'ScanTime', 'AddedOnSpot'],

  // API key for endpoint authentication
  API_KEY: 'viz-event-api-key-2026',

  // Session expiry in hours
  SESSION_EXPIRY_HOURS: 24,

  // HMAC secret for QR token signing
  HMAC_SECRET: 'viz-event-hmac-secret-change-me',
};

/**
 * Get the master config spreadsheet
 */
function getMasterSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
}

/**
 * Get a specific sheet from the master spreadsheet
 */
function getMasterSheet(sheetName) {
  var ss = getMasterSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Set headers based on sheet type
    if (sheetName === CONFIG.EVENTS_SHEET) {
      sheet.appendRow(['EventId', 'Name', 'Date', 'Venue', 'Description', 'SheetUrl', 'Status', 'CreatedAt']);
    } else if (sheetName === CONFIG.USERS_SHEET) {
      sheet.appendRow(['UserId', 'Name', 'Email', 'PasswordHash', 'Role', 'AssignedEvents', 'SessionToken', 'TokenExpiry']);
    } else if (sheetName === CONFIG.SESSIONS_SHEET) {
      sheet.appendRow(['SessionToken', 'UserId', 'CreatedAt', 'ExpiresAt']);
    }
  }
  return sheet;
}
