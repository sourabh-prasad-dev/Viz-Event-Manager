/**
 * VizEvent — QR Token Generation & Validation
 */

function generateQRToken(eventId, registrationId) {
  var uuid = Utilities.getUuid().replace(/-/g, '').substring(0, 16);
  var payload = eventId + '_' + registrationId + '_' + uuid;
  var signature = Utilities.computeHmacSha256Signature(payload, CONFIG.HMAC_SECRET);
  var hmac = signature.map(function(b) { return ((b < 0 ? b + 256 : b).toString(16)).padStart(2, '0'); }).join('').substring(0, 16);
  return 'EVT_' + eventId + '_' + uuid + '_' + hmac;
}

function generateTokensForEvent(eventId) {
  var eventsSheet = getMasterSheet(CONFIG.EVENTS_SHEET);
  var events = getSheetData(eventsSheet);
  var event = null;
  for (var e = 0; e < events.length; e++) { if (events[e].EventId === eventId) { event = events[e]; break; } }
  if (!event || !event.SheetUrl) throw new Error('Event not found or no sheet URL.');
  var ss = openSpreadsheetByUrl(event.SheetUrl);
  var sheet = ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var lock = LockService.getScriptLock();
  lock.waitLock(60000);
  try {
    var attendees = [];
    for (var i = 1; i < data.length; i++) {
      var regId = data[i][headers.indexOf('RegistrationId')];
      if (!data[i][headers.indexOf('QRToken')]) {
        var token = generateQRToken(eventId, regId);
        sheet.getRange(i + 1, headers.indexOf('QRToken') + 1).setValue(token);
        if (!data[i][headers.indexOf('EventId')]) sheet.getRange(i + 1, headers.indexOf('EventId') + 1).setValue(eventId);
        if (!data[i][headers.indexOf('Status')]) sheet.getRange(i + 1, headers.indexOf('Status') + 1).setValue('Pending');
        data[i][headers.indexOf('QRToken')] = token;
      }
      attendees.push({ registrationId: regId, fullName: data[i][headers.indexOf('FullName')], email: data[i][headers.indexOf('Email')], phone: data[i][headers.indexOf('Phone')], company: data[i][headers.indexOf('Company')], eventId: data[i][headers.indexOf('EventId')] || eventId, qrToken: data[i][headers.indexOf('QRToken')], status: data[i][headers.indexOf('Status')] || 'Pending', scanTime: data[i][headers.indexOf('ScanTime')] || '', addedOnSpot: String(data[i][headers.indexOf('AddedOnSpot')]) === 'true' });
    }
    return attendees;
  } finally { lock.releaseLock(); }
}

function validateQRToken(token, eventId) {
  var eventsSheet = getMasterSheet(CONFIG.EVENTS_SHEET);
  var events = getSheetData(eventsSheet);
  var event = null;
  for (var e = 0; e < events.length; e++) { if (events[e].EventId === eventId) { event = events[e]; break; } }
  if (!event || !event.SheetUrl) return { valid: false, status: 'not_found', message: 'Event not found.' };
  var ss = openSpreadsheetByUrl(event.SheetUrl);
  var sheet = ss.getSheets()[0];
  var rowIndex = findRowIndex(sheet, 'QRToken', token);
  if (rowIndex === -1) return { valid: false, status: 'not_found', message: 'Invalid QR code.' };
  var data = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (data[headers.indexOf('Status')] === 'Approved') {
    return { valid: false, status: 'already_scanned', message: 'Already checked in.', attendee: { fullName: data[headers.indexOf('FullName')], company: data[headers.indexOf('Company')] } };
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    sheet.getRange(rowIndex, headers.indexOf('Status') + 1).setValue('Approved');
    sheet.getRange(rowIndex, headers.indexOf('ScanTime') + 1).setValue(new Date().toISOString());
  } finally { lock.releaseLock(); }
  return { valid: true, status: 'approved', message: 'Entry approved!', attendee: { fullName: data[headers.indexOf('FullName')], company: data[headers.indexOf('Company')] } };
}

function addOnSpotRegistration(eventId, attendeeData) {
  var eventsSheet = getMasterSheet(CONFIG.EVENTS_SHEET);
  var events = getSheetData(eventsSheet);
  var event = null;
  for (var e = 0; e < events.length; e++) { if (events[e].EventId === eventId) { event = events[e]; break; } }
  if (!event || !event.SheetUrl) throw new Error('Event not found.');
  var ss = openSpreadsheetByUrl(event.SheetUrl);
  var sheet = ss.getSheets()[0];
  var regId = generateUniqueId('REG');
  var qrToken = generateQRToken(eventId, regId);
  appendRowSafe(sheet, [regId, attendeeData.fullName, attendeeData.email, attendeeData.phone || '', attendeeData.company || '', eventId, qrToken, 'Pending', '', 'true']);
  return { registrationId: regId, fullName: attendeeData.fullName, email: attendeeData.email, phone: attendeeData.phone || '', company: attendeeData.company || '', eventId: eventId, qrToken: qrToken, status: 'Pending', scanTime: '', addedOnSpot: true };
}
