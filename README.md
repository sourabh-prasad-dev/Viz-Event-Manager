# VizEvent — Event Management & QR Ticketing Platform

A production-ready event management platform with QR-based ticketing, powered by React + Tailwind CSS on the frontend and Google Apps Script + Google Sheets on the backend.

## ✨ Features

- **Multi-Event Management** — Create, edit, and manage multiple events with dedicated Google Sheets
- **QR Ticketing** — Generate unique encrypted QR codes for every attendee
- **One-Time Scan Validation** — Validate QR codes during entry with real-time status updates
- **On-Spot Registration** — Register walk-in attendees with auto-generated QR tokens
- **Analytics Dashboard** — Real-time charts, stats, and attendance tracking
- **Role-Based Access** — Super Admin, Event Admin, and Scanner Operator roles
- **CSV/ZIP Export** — Export attendee lists and bulk-download QR codes
- **Responsive Design** — Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Bundler | Vite |
| Charts | Recharts |
| QR Generation | qrcode.react |
| QR Scanning | html5-qrcode |
| Icons | Lucide React |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Hosting | Vercel / Netlify |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/sourabh-prasad-dev/Viz-Event-Manager.git
cd Viz_Event_Manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Google Apps Script URL and API key

# Start development server
npm run dev
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@vizevent.com | admin123 |
| Event Admin | manager@vizevent.com | manager123 |
| Scanner | scanner@vizevent.com | scanner123 |

## 📁 Project Structure

```
├── src/
│   ├── components/ui/   # Reusable UI components
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route pages
│   ├── routes/          # Router configuration
│   ├── services/        # API & QR services
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── apps-script/         # Google Apps Script backend
├── docs/                # Documentation
└── public/              # Static assets
```

## 📖 Documentation

- [Setup Guide](docs/setup-guide.md) — Step-by-step deployment instructions
- [API Reference](docs/api-reference.md) — Apps Script endpoint documentation
- [Sheets Template](docs/sheets-template.md) — Google Sheets structure

