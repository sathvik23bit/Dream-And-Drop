// =============================================================
// DREAM DROP — FIREBASE CONFIGURATION
// =============================================================
// HOW TO SET UP (one-time, done by teacher / admin):
//
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → name it "dream-drop" → Create
// 3. In the project, click "Realtime Database" → Create Database
//    → choose a location → Start in TEST MODE (for now)
// 4. Go to Project Settings (gear icon) → Your apps → Add app (Web)
// 5. Copy the config values below from Firebase and paste them here
// 6. Save this file — that's it!
//
// DATA STRUCTURE in Firebase:
//   dreamdrop/
//     players/
//       {playerId}/
//         progress/  ← same structure as localStorage
//         mouseData/ ← level-by-level movement logs
// =============================================================

var FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  databaseURL:       "PASTE_YOUR_DATABASE_URL_HERE",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE"
};

// Set to true once you have filled in real values above
var FIREBASE_ENABLED = false;
