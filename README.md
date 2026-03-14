# Sunny Assignment (React + Node.js)

## Stack

- Backend: Node.js (Express, MongoDB, Google Vision OCR)
- Frontend: React + Vite
- Database: MongoDB

## Features

- Login and registration with session persistence
- Upload image and extract text using Google Vision API
- Save and view previous OCR history by user
- Mobile responsive single-page UI

## Prerequisites

- Node.js 20+
- MongoDB running locally (`mongodb://localhost:27017` by default)
- Google Vision credentials JSON file

Set credentials before starting backend:

- Windows: `set GOOGLE_APPLICATION_CREDENTIALS=My Custom Project-00b9a5618780.json`
- macOS/Linux: `export GOOGLE_APPLICATION_CREDENTIALS=My Custom Project-00b9a5618780.json`

## Repository Structure

- `backend/` - Node.js API, OCR integration, MongoDB access
- `frontend/` - React + Vite web app

## Run

1. Install backend dependencies:
   - `cd backend`
   - `npm install`
2. Start backend API server:
   - `npm start`
3. In another terminal, install frontend dependencies:
   - `cd frontend`
   - `npm install`
4. Start frontend dev server:
   - `npm run dev`
5. Open `http://localhost:4200`

## Backend Endpoints

- `GET /health/vision` (validates Google Vision credential configuration)
- `POST /saveUserDetails`
- `GET /userLogin`
- `GET /getHistoryData`
- `POST /getTextFromFile`

## Verify Vision Setup Before OCR

After setting a service account JSON file, call `GET http://localhost:3000/health/vision`.

- `200` + `success: true` means credentials are valid and Vision client auth is working.
- `503` + `success: false` means credentials are missing/invalid and OCR calls will fail.
