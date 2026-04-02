// ══════════════════════════════════════════════════════════════
//  PRIVY — Firebase Configuration
//  ⚠️ REPLACE WITH YOUR OWN FIREBASE PROJECT CONFIG
//  Free tier: 50k reads/writes per day — no billing required
// ══════════════════════════════════════════════════════════════
//
//  HOW TO GET YOUR CONFIG:
//  ─────────────────────────────────────────────────────────────
//  1. Go to https://console.firebase.google.com
//  2. Click "Create project" → Name it "privy-chat"
//  3. Disable Google Analytics → Click "Create project"
//  4. Wait for project to be ready → Click "Continue"
//  5. In left sidebar, click "Firestore Database"
//  6. Click "Create database" → "Start in test mode" → Next
//  7. Choose a region close to you → "Enable"
//  8. In left sidebar, click the gear icon ⚙️ → "Project settings"
//  9. Scroll down to "Your apps" → Click "Add app" (</> icon)
//  10. Enter app nickname "privy-web" → Click "Register app"
//  11. Copy the firebaseConfig object (looks like below)
//  12. PASTE YOUR VALUES BELOW (replace the placeholder ones)
//
//  FIREBASE SECURITY RULES (paste in Firestore → Rules tab):
//  ─────────────────────────────────────────────────────────────
//  rules_version = '2';
//  service cloud.firestore {
//    match /databases/{database}/documents {
//      match /pairs/{pairId} {
//        allow read, write: if true;
//        match /messages/{messageId} {
//          allow read, write: if true;
//        }
//      }
//    }
//  }
//
// ══════════════════════════════════════════════════════════════

const firebaseConfig = {
  // ⬇️⬇️⬇️ REPLACE THESE WITH YOUR ACTUAL VALUES ⬇️⬇️⬇️
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
  // ⬆️⬆️⬆️ REPLACE THESE WITH YOUR ACTUAL VALUES ⬆️⬆️⬆️
};

// For Cloud Messaging (Push Notifications) — optional but recommended
const vapidPublicKey = "YOUR_VAPID_PUBLIC_KEY_HERE";

// Export for use in index.html
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, vapidPublicKey };
}