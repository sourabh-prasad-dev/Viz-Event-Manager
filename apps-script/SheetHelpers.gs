/**
 * VizEvent — Google Sheets Helper Functions
 * Generic CRUD operations for Google Sheets with concurrency protection.
 */

/**
 * Get all data from a sheet as array of objects
 */
function getSheetData(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Find a row index by column value (1-indexed, includes header)
 */
function findRowIndex(sheet, columnName, value) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var colIndex = headers.indexOf(columnName);

  if (colIndex === -1) return -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colIndex]) === String(value)) {
      return i + 1; // 1-indexed row number
    }
  }
  return -1;
}

/**
 * Append a row to a sheet with lock protection
 */
function appendRowSafe(sheet, rowData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    sheet.appendRow(rowData);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Update a specific cell value
 */
function updateCell(sheet, rowIndex, columnName, value) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colIndex = headers.indexOf(columnName);
  if (colIndex === -1) return false;

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    sheet.getRange(rowIndex, colIndex + 1).setValue(value);
  } finally {
    lock.releaseLock();
  }
  return true;
}

/**
 * Update multiple cells in a row
 */
function updateRowData(sheet, rowIndex, updates) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    for (var key in updates) {
      var colIndex = headers.indexOf(key);
      if (colIndex !== -1) {
        sheet.getRange(rowIndex, colIndex + 1).setValue(updates[key]);
      }
    }
  } finally {
    lock.releaseLock();
  }
}

/**
 * Delete a row by index
 */
function deleteRow(sheet, rowIndex) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    sheet.deleteRow(rowIndex);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Open an external spreadsheet by URL
 */
function openSpreadsheetByUrl(url) {
  try {
    return SpreadsheetApp.openByUrl(url);
  } catch (e) {
    throw new Error('Cannot open spreadsheet. Check the URL and sharing permissions.');
  }
}

/**
 * Generate a unique ID
 */
function generateUniqueId(prefix) {
  return (prefix || '') + Utilities.getUuid().replace(/-/g, '').substring(0, 12);
}
