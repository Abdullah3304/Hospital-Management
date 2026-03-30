# ALCOS - Hospital Management System

A basic hospital management system for managing patients, their diseases, and treatment checklists.

## Tech Stack

- **Backend:** Node.js 22, Express
- **Frontend:** React 19, Vite
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens)

## Project Structure

```
├── package.json                    # Root scripts
├── server/
│   ├── index.js                    # Express server entry point
│   ├── db.js                       # PostgreSQL connection pool
│   ├── auth.js                     # JWT middleware & secret
│   ├── seed.js                     # Database setup & admin user seed
│   └── routes/
│       ├── auth.js                 # POST /api/auth/login
│       └── patients.js             # Patient, disease & checklist endpoints
└── client/
    ├── vite.config.js              # Vite config with API proxy
    ├── index.html
    └── src/
        ├── App.jsx                 # Route definitions
        ├── App.css                 # All styles
        ├── api.js                  # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx     # Auth state management
        ├── components/
        │   └── Layout.jsx          # Header (logo + logout) wrapper
        └── pages/
            ├── Login.jsx           # Login screen
            ├── PatientListing.jsx  # Paginated patient list with search
            ├── PatientForm.jsx     # Create / Edit patient / Add disease
            └── PatientDiseases.jsx # Disease list + checklist modal
```

## Database Schema

### Tables

- **users** — id, username, password (hashed), created_at, updated_at
- **patients** — id, name, age, gender, mobile_number (UNIQUE, indexed), created_at, updated_at
- **patient_diseases** — id, patient_id (FK), disease, fees, created_at, updated_at (UNIQUE on patient_id + disease)
- **disease_checklists** — id, patient_disease_id (FK, UNIQUE), blood_pressure, weight, scan, medication, doctor_notes, created_at, updated_at

All tables have auto-updating `updated_at` via PostgreSQL triggers.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password, returns JWT |
| GET | `/api/patients?page=1&search=` | List patients (25/page, newest first, LIKE search on mobile) |
| GET | `/api/patients/:id` | Get patient with latest disease & existing disease list |
| POST | `/api/patients` | Create patient + first disease |
| PUT | `/api/patients/:id` | Update patient + disease (discards checklist if disease changed) |
| GET | `/api/patients/:id/diseases` | List all diseases for a patient |
| POST | `/api/patients/:id/diseases` | Add new disease to existing patient |
| GET | `/api/patients/diseases/:diseaseId/checklist` | Get checklist for a disease |
| PUT | `/api/patients/diseases/:diseaseId/checklist` | Save/update checklist for a disease |

All endpoints except login require `Authorization: Bearer <token>` header.

## Setup

### Prerequisites

- Node.js 22+
- PostgreSQL with a database created:
  ```sql
  CREATE DATABASE hospital_management;
  ```

### Install Dependencies

```bash
npm run install:all
```

### Configure Database

Edit `server/db.js` with your PostgreSQL credentials:

```js
const pool = new Pool({
  user: 'usama',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'hospital_management'
});
```

### Seed Database

Creates all tables, triggers, and the admin user:

```bash
npm run seed
```

### Run Development

Start backend and frontend in two separate terminals:

```bash
# Terminal 1 — Backend (port 3001)
npm run server

# Terminal 2 — Frontend (port 3000)
npm run client
```

Open `http://localhost:3000` in your browser.

### Login Credentials

- **Username:** admin
- **Password:** admin123

## Features

### Login
- JWT-based authentication with 24h token expiry
- Auto-redirect to login on token expiration

### Patient Listing
- Paginated list (25 per page, newest first)
- Search by mobile number (partial match)
- Click any row to edit patient
- Treatment Status button per row

### Create / Edit Patient
- Fields: Mobile Number (digits only, unique), Name, Age (1-99), Gender, Disease (dropdown), Fees (> 0)
- All fields required
- **Add New Disease** button (enabled only in edit mode):
  - Patient info fields become read-only
  - Disease dropdown excludes already-assigned diseases
  - Saves as a new disease entry for the same patient

### Patient Diseases
- Lists all diseases for a patient
- Click any disease row to open the checklist modal

### Checklist Modal
- Configurable checkboxes per disease (default: Blood Pressure, Weight, Scan, Medication)
- Doctor Notes textarea
- All fields optional
- Checklist data is **discarded** if the disease is changed during patient edit

### Disease Checklist Configuration

To customize checklist items per disease, edit `CHECKLIST_CONFIG` in `client/src/pages/PatientDiseases.jsx`:

```js
const CHECKLIST_CONFIG = {
  'Sugar': ['blood_pressure', 'weight', 'scan', 'medication'],
  'Foot Machine': ['blood_pressure', 'weight', 'scan', 'medication'],
  'Lipo': ['blood_pressure', 'weight', 'scan', 'medication'],
};
```

### Navigation
- ALCOS logo (top-left on all screens) links to Patient Listing
- Logout button (top-right) clears token and redirects to login
