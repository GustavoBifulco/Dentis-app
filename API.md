// API Endpoints (Dentis iOS)

// This document lists and describes the backend endpoints consumed by the Dentis iOS app.

// User Authentication

// - POST /api/auth/login — Authenticate user credentials (email/password/Clerk SDK)
// - GET /api/auth/me — Returns current user profile, including: name, role (dentist/patient/admin), organizationId

// Patients

// - GET /api/patients — List all patients (searchable)
// - POST /api/patients — Create new patient (body: name at minimum)
// - GET /api/patients/:id — Get patient details/chart
// - PUT /api/patients/:id — Update patient (if supported)
// - DELETE /api/patients/:id — Archive/delete patient (if supported)

// Patient Chart — Documents & Financials

// - GET /api/patient/financials — (If user is a patient) Get financial info
// - GET /api/patient/scans — (If user is a patient) Get scan documents
// - GET /api/patients/:id/clinicalRecords — (If available) Clinical records/timeline
// - GET /api/patients/:id/documents — (If available) List patient documents
// - POST /api/upload — Upload document (multipart/form-data)

// Notes
// - Endpoints and parameters must be confirmed and updated after backend inspection.
// - All routes are served by the existing Dentis backend (see web repo for implementation details).
// - All routes require HTTPS in production; session tokens must be used securely.
