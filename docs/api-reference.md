# API Reference

All endpoints are served through a single Google Apps Script Web App URL.

**Base URL:** `https://script.google.com/macros/s/{SCRIPT_ID}/exec`

## Authentication

All requests must include:
- `apiKey` — Your API key (configured in `Config.gs`)
- `sessionToken` — Session token obtained from login (for authenticated requests)

---

## GET Endpoints

Pass parameters as URL query strings: `?action=get_events&apiKey=...&sessionToken=...`

### `check_session`
Validate the current session token.

**Response:**
```json
{ "status": "success", "data": { "user": { "id": "usr_001", "name": "Admin", "email": "admin@vizevent.com", "role": "super_admin", "assignedEvents": [] } } }
```

### `get_events`
Return all events from the master spreadsheet.

### `get_attendees`
Return attendees for a specific event.
- `eventId` — The event ID

### `get_analytics`
Return scan statistics for an event.
- `eventId` — (optional) The event ID

### `get_users`
Return all registered users (admin-only).

### `export_attendees`
Return attendee data in exportable format.
- `eventId` — The event ID

---

## POST Endpoints

Send a JSON body as `text/plain` content type.

### `login`
Authenticate a user.
```json
{ "action": "login", "apiKey": "...", "email": "admin@vizevent.com", "password": "admin123" }
```
**Response:**
```json
{ "status": "success", "data": { "user": { ... }, "sessionToken": "uuid-string" } }
```

### `create_event`
Create a new event.
```json
{ "action": "create_event", "apiKey": "...", "sessionToken": "...", "event": { "name": "Tech Summit", "date": "2026-06-15", "venue": "Convention Center", "description": "...", "sheetUrl": "https://docs.google.com/...", "status": "draft" } }
```

### `update_event`
Update an existing event.
```json
{ "action": "update_event", "apiKey": "...", "sessionToken": "...", "event": { "id": "evt_001", "name": "Updated Name" } }
```

### `delete_event`
Delete an event.
```json
{ "action": "delete_event", "apiKey": "...", "sessionToken": "...", "eventId": "evt_001" }
```

### `sync_attendees` / `generate_tokens`
Sync attendees from Google Sheet and generate QR tokens.
```json
{ "action": "sync_attendees", "apiKey": "...", "sessionToken": "...", "eventId": "evt_001" }
```

### `validate_qr`
Validate a QR token during scanning.
```json
{ "action": "validate_qr", "apiKey": "...", "sessionToken": "...", "token": "EVT_evt001_abc123_def456", "eventId": "evt_001" }
```
**Response (success):**
```json
{ "status": "success", "data": { "valid": true, "status": "approved", "message": "Entry approved!", "attendee": { "fullName": "John Doe", "company": "TechCorp" } } }
```
**Response (already scanned):**
```json
{ "status": "success", "data": { "valid": false, "status": "already_scanned", "message": "Already checked in." } }
```

### `add_onspot`
Register a walk-in attendee.
```json
{ "action": "add_onspot", "apiKey": "...", "sessionToken": "...", "eventId": "evt_001", "attendee": { "fullName": "Jane Doe", "email": "jane@example.com", "phone": "+91-9876543210", "company": "Acme Corp" } }
```

### `create_user`
Create a new admin/scanner user.
```json
{ "action": "create_user", "apiKey": "...", "sessionToken": "...", "user": { "name": "Scanner Ops", "email": "scanner@vizevent.com", "password": "pass123", "role": "scanner", "assignedEvents": ["evt_001"] } }
```

### `delete_user`
Remove a user.
```json
{ "action": "delete_user", "apiKey": "...", "sessionToken": "...", "userId": "usr_003" }
```

### `change_password`
Change the current user's password.
```json
{ "action": "change_password", "apiKey": "...", "sessionToken": "...", "oldPassword": "old123", "newPassword": "new456" }
```

---

## Error Responses

All errors follow this format:
```json
{ "status": "error", "message": "Description of the error" }
```

Common error messages:
- `Invalid API key` — The API key doesn't match
- `Invalid session` — Session expired or invalid
- `Invalid credentials` — Wrong email or password
- `Event not found` — Event ID doesn't exist
- `Invalid QR code` — Token not found in the sheet
