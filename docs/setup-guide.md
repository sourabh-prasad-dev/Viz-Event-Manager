# Setup & Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- A Google Account
- A Vercel or Netlify account (for deployment)

---

## 1. Frontend Setup

### Local Development

```bash
cd Viz_Event_Manager
npm install
cp .env.example .env
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_API_KEY=viz-event-api-key-2026
```

---

## 2. Google Sheets Setup

### Master Configuration Spreadsheet

1. Create a new Google Spreadsheet
2. Rename the first sheet to **Events** with headers:
   ```
   EventId | Name | Date | Venue | Description | SheetUrl | Status | CreatedAt
   ```
3. Add a sheet named **Users** with headers:
   ```
   UserId | Name | Email | PasswordHash | Role | AssignedEvents | SessionToken | TokenExpiry
   ```
4. Add a sheet named **Sessions** with headers:
   ```
   SessionToken | UserId | CreatedAt | ExpiresAt
   ```

### Add an Admin User

In the **Users** sheet, add a row:
- UserId: `usr_001`
- Name: `Admin`
- Email: `admin@vizevent.com`
- PasswordHash: Generate using SHA-256 of your password (use an online tool or the script's `hashPassword()` function)
- Role: `super_admin`
- AssignedEvents: (leave empty)

### Per-Event Spreadsheet

For each event, create a separate Google Spreadsheet with headers:
```
RegistrationId | FullName | Email | Phone | Company | EventId | QRToken | Status | ScanTime | AddedOnSpot
```

---

## 3. Google Apps Script Setup

### Deploy the Backend

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Delete the default `Code.gs` content
4. Create the following files by clicking **+** → **Script**:
   - `Config.gs` — Copy from `apps-script/Config.gs`
   - `Auth.gs` — Copy from `apps-script/Auth.gs`
   - `SheetHelpers.gs` — Copy from `apps-script/SheetHelpers.gs`
   - `QRTokens.gs` — Copy from `apps-script/QRTokens.gs`
   - `Code.gs` — Copy from `apps-script/Code.gs`

5. **Update Config.gs**:
   - Set `MASTER_SHEET_ID` to your master spreadsheet's ID
   - Set `API_KEY` to a secure random string
   - Set `HMAC_SECRET` to another secure random string

6. **Deploy as Web App**:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy the Web App URL

7. **Update your `.env`**:
   ```env
   VITE_GAS_URL=<your-web-app-url>
   VITE_API_KEY=<your-api-key>
   ```

### Important Notes

- After every code change, create a **New deployment** (or edit the current one)
- The script needs access to open external spreadsheets — grant permission when prompted
- The Web App URL ends with `/exec`

---

## 4. Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B: Git Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variables:
   - `VITE_GAS_URL` = your Apps Script URL
   - `VITE_API_KEY` = your API key
5. Deploy

### Build Settings

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

---

## 5. Deploy to Netlify (Alternative)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Set environment variables in **Site settings** → **Build & deploy** → **Environment**
5. Add a `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

---

## Troubleshooting

### CORS Issues
- Ensure your Apps Script is deployed with "Anyone" access
- The app uses `Content-Type: text/plain` to avoid preflight requests
- If you see opaque responses, check that `redirect: "follow"` is set

### Session Issues
- Sessions expire after 24 hours (configurable in `Config.gs`)
- Clear localStorage if you encounter stale sessions

### QR Scanner Not Working
- Camera access requires HTTPS (or localhost for development)
- Grant camera permissions when prompted
- On iOS Safari, ensure the site is accessed via HTTPS
