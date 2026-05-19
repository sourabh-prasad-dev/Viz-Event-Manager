# Google Sheets Template

## Master Configuration Spreadsheet

This is the central spreadsheet that stores events, users, and sessions.

### Events Sheet

| Column | Type | Description |
|--------|------|-------------|
| EventId | String | Unique event identifier (e.g., `evt_abc123`) |
| Name | String | Event name |
| Date | String | Event date (YYYY-MM-DD) |
| Venue | String | Event venue/location |
| Description | String | Brief event description |
| SheetUrl | String | URL to the event's dedicated Google Sheet |
| Status | String | `draft`, `active`, or `completed` |
| CreatedAt | String | ISO timestamp of creation |

### Users Sheet

| Column | Type | Description |
|--------|------|-------------|
| UserId | String | Unique user identifier (e.g., `usr_001`) |
| Name | String | User's full name |
| Email | String | Login email address |
| PasswordHash | String | SHA-256 hash of the password |
| Role | String | `super_admin`, `event_admin`, or `scanner` |
| AssignedEvents | String | Comma-separated event IDs |
| SessionToken | String | Current active session token |
| TokenExpiry | String | Session expiry timestamp |

### Sessions Sheet

| Column | Type | Description |
|--------|------|-------------|
| SessionToken | String | UUID session token |
| UserId | String | Associated user ID |
| CreatedAt | String | Session creation timestamp |
| ExpiresAt | String | Session expiry timestamp |

---

## Per-Event Spreadsheet

Each event has its own dedicated spreadsheet for attendee data.

### Attendee Sheet (first sheet)

| Column | Type | Description |
|--------|------|-------------|
| RegistrationId | String | Unique registration ID (e.g., `REG001`) |
| FullName | String | Attendee's full name |
| Email | String | Attendee's email |
| Phone | String | Attendee's phone number |
| Company | String | Attendee's company/organization |
| EventId | String | Associated event ID |
| QRToken | String | Generated QR token (auto-filled on sync) |
| Status | String | `Pending`, `Approved`, or `Rejected` |
| ScanTime | String | ISO timestamp of when QR was scanned |
| AddedOnSpot | String | `true` if walk-in, `false` if pre-registered |

---

## Setup Instructions

1. **Create the Master Spreadsheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Add three sheets: `Events`, `Users`, `Sessions`
   - Add the headers as listed above
   - Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

2. **Create Per-Event Spreadsheets**
   - For each event, create a new Google Spreadsheet
   - Add the attendee headers listed above
   - Share the sheet with the Google account running the Apps Script
   - Copy the full URL for the event's `SheetUrl` field

3. **Set Sharing Permissions**
   - All spreadsheets should be accessible to the Google account that owns the Apps Script
   - For the Apps Script to open external sheets, the owner account must have at least "Viewer" access

## Sample Data

### Events Sheet Example
```
evt_001 | Tech Summit 2026 | 2026-06-15 | Convention Center, Bangalore | Annual tech conference | https://docs.google.com/spreadsheets/d/xxx | active | 2026-05-01T10:00:00Z
```

### Users Sheet Example
```
usr_001 | Admin | admin@vizevent.com | <sha256-hash> | super_admin | | | 
```

### Attendee Sheet Example
```
REG001 | Aarav Sharma | aarav@example.com | +91-9876543210 | TechCorp | evt_001 | EVT_evt001_abc123_def456 | Pending | | false
```
