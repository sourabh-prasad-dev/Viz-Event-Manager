/**
 * VizEvent — Google Apps Script Main Entry Point
 * Handles all HTTP GET and POST requests.
 */

function doGet(e) {
  var params = e.parameter;
  if (!validateApiKey(params.apiKey)) return jsonResponse({ status: 'error', message: 'Invalid API key' });

  var action = params.action;
  try {
    switch (action) {
      case 'check_session':
        var user = validateSession(params.sessionToken);
        if (!user) return jsonResponse({ status: 'error', message: 'Invalid session' });
        return jsonResponse({ status: 'success', data: { user: user } });

      case 'get_events':
        var eventsSheet = getMasterSheet(CONFIG.EVENTS_SHEET);
        var events = getSheetData(eventsSheet);
        return jsonResponse({ status: 'success', data: events });

      case 'get_attendees':
        return jsonResponse({ status: 'success', data: generateTokensForEvent(params.eventId) });

      case 'get_analytics':
        var analytics = computeAnalytics(params.eventId);
        return jsonResponse({ status: 'success', data: analytics });

      case 'get_users':
        var usersSheet = getMasterSheet(CONFIG.USERS_SHEET);
        var users = getSheetData(usersSheet).map(function(u) {
          return { id: u.UserId, name: u.Name, email: u.Email, role: u.Role, assignedEvents: u.AssignedEvents ? u.AssignedEvents.split(',') : [] };
        });
        return jsonResponse({ status: 'success', data: users });

      case 'export_attendees':
        return jsonResponse({ status: 'success', data: generateTokensForEvent(params.eventId) });

      default:
        return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  var json;
  try { json = JSON.parse(e.postData.contents); } catch (err) { return jsonResponse({ status: 'error', message: 'Invalid JSON' }); }
  if (!validateApiKey(json.apiKey)) return jsonResponse({ status: 'error', message: 'Invalid API key' });

  var action = json.action;
  try {
    switch (action) {
      case 'login':
        var loginResult = authenticateUser(json.email, json.password);
        if (!loginResult) return jsonResponse({ status: 'error', message: 'Invalid credentials' });
        return jsonResponse({ status: 'success', data: loginResult });

      case 'create_event':
        var evSheet = getMasterSheet(CONFIG.EVENTS_SHEET);
        var evt = json.event;
        var evtId = generateUniqueId('evt_');
        appendRowSafe(evSheet, [evtId, evt.name, evt.date, evt.venue, evt.description || '', evt.sheetUrl || '', evt.status || 'draft', new Date().toISOString()]);
        return jsonResponse({ status: 'success', data: { id: evtId, name: evt.name, date: evt.date, venue: evt.venue, description: evt.description, sheetUrl: evt.sheetUrl, status: evt.status || 'draft', createdAt: new Date().toISOString() } });

      case 'update_event':
        var uEvSheet = getMasterSheet(CONFIG.EVENTS_SHEET);
        var uEvt = json.event;
        var uRow = findRowIndex(uEvSheet, 'EventId', uEvt.id);
        if (uRow === -1) return jsonResponse({ status: 'error', message: 'Event not found' });
        var updates = {};
        if (uEvt.name) updates.Name = uEvt.name;
        if (uEvt.date) updates.Date = uEvt.date;
        if (uEvt.venue) updates.Venue = uEvt.venue;
        if (uEvt.description !== undefined) updates.Description = uEvt.description;
        if (uEvt.sheetUrl !== undefined) updates.SheetUrl = uEvt.sheetUrl;
        if (uEvt.status) updates.Status = uEvt.status;
        updateRowData(uEvSheet, uRow, updates);
        return jsonResponse({ status: 'success', data: uEvt });

      case 'delete_event':
        var dEvSheet = getMasterSheet(CONFIG.EVENTS_SHEET);
        var dRow = findRowIndex(dEvSheet, 'EventId', json.eventId);
        if (dRow === -1) return jsonResponse({ status: 'error', message: 'Event not found' });
        deleteRow(dEvSheet, dRow);
        return jsonResponse({ status: 'success' });

      case 'sync_attendees':
      case 'generate_tokens':
        var attendees = generateTokensForEvent(json.eventId);
        return jsonResponse({ status: 'success', data: attendees });

      case 'validate_qr':
        var qrResult = validateQRToken(json.token, json.eventId);
        return jsonResponse({ status: 'success', data: qrResult });

      case 'add_onspot':
        var onspot = addOnSpotRegistration(json.eventId, json.attendee);
        return jsonResponse({ status: 'success', data: onspot });

      case 'create_user':
        var uSheet = getMasterSheet(CONFIG.USERS_SHEET);
        var newUser = json.user;
        var uid = generateUniqueId('usr_');
        appendRowSafe(uSheet, [uid, newUser.name, newUser.email, hashPassword(newUser.password), newUser.role, (newUser.assignedEvents || []).join(','), '', '']);
        return jsonResponse({ status: 'success', data: { id: uid, name: newUser.name, email: newUser.email, role: newUser.role, assignedEvents: newUser.assignedEvents || [] } });

      case 'delete_user':
        var duSheet = getMasterSheet(CONFIG.USERS_SHEET);
        var duRow = findRowIndex(duSheet, 'UserId', json.userId);
        if (duRow === -1) return jsonResponse({ status: 'error', message: 'User not found' });
        deleteRow(duSheet, duRow);
        return jsonResponse({ status: 'success' });

      case 'change_password':
        var user = validateSession(json.sessionToken);
        if (!user) return jsonResponse({ status: 'error', message: 'Invalid session' });
        var changed = changeUserPassword(user.id, json.oldPassword, json.newPassword);
        if (!changed) return jsonResponse({ status: 'error', message: 'Invalid current password' });
        return jsonResponse({ status: 'success' });

      default:
        return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function computeAnalytics(eventId) {
  if (!eventId) return { totalRegistered: 0, totalCheckedIn: 0, totalPending: 0, totalOnSpot: 0, hourlyScans: [], statusDistribution: [] };
  try {
    var attendees = generateTokensForEvent(eventId);
    var checkedIn = 0, pending = 0, onSpot = 0;
    for (var i = 0; i < attendees.length; i++) {
      if (attendees[i].status === 'Approved') checkedIn++;
      if (attendees[i].status === 'Pending') pending++;
      if (attendees[i].addedOnSpot) onSpot++;
    }
    return { totalRegistered: attendees.length, totalCheckedIn: checkedIn, totalPending: pending, totalOnSpot: onSpot, statusDistribution: [{ name: 'Checked In', value: checkedIn }, { name: 'Pending', value: pending }, { name: 'On-Spot', value: onSpot }] };
  } catch (e) {
    return { totalRegistered: 0, totalCheckedIn: 0, totalPending: 0, totalOnSpot: 0 };
  }
}
