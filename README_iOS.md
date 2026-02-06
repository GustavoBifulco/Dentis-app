// Dentis iOS – Setup & Instructions

// Build & Run

// 1. Requirements:
//    - Xcode 15+
//    - iOS 17 SDK (minimum)
// 2. Clone this repo and open `DentisApp.xcodeproj` in Xcode.
// 3. Configure Environment:
//    - Place Clerk/Stripe keys (if needed) in Xcode project settings or `.xcconfig` files.
//    - Set the backend base URL in `AppConfig.swift`:
//         - Debug: `http://localhost:PORT`
//         - Release: `https://dentis.com.br`
// 4. Run on the iOS Simulator (Device: iPhone 15 or later recommended).

// Project Structure

// - `App/`: App shell, entry point, AppConfig
// - `Core/Networking/`: API Client, request/response, token storage
// - `Core/Auth/`: Clerk/Auth management, Keychain
// - `DesignSystem/`: AuroraTheme, reusable colors/tokens
// - `Features/Dashboard/`: Dashboard UI & logic
// - `Features/Patients/`: List/create/search patients
// - `Features/PatientChart/`: Prontuário/patient chart

// Environment & Keys

// - All secrets (Clerk/Stripe keys) must be stored securely; missing keys result in clear runtime errors.
// - Place placeholder values if you lack real credentials, and follow on-screen error instructions.

// Changing Base URL

// - Edit `AppConfig.swift` or the appropriate `.xcconfig` file for Debug/Release URLs.

// Manual Test Checklist (Simulator)

// - [ ] Login/logout flow
// - [ ] Fetch user profile ("me")
// - [ ] Dashboard loads with real name & cards
// - [ ] Patients list loads, supports search
// - [ ] Create patient (add with name only)
// - [ ] Patient chart view opens on selection
// - [ ] Upload document (if endpoint ready)
// - [ ] Dark mode and "Clinical Aurora" theme applied
// - [ ] Handles empty data elegantly
// - [ ] Shows missing key errors when secrets are not configured

// ---
// Update this README as new features are implemented.
