// public/js/firebase-config.js

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXwoBfclQpuwKGRRT4Vna4e7TUGZ1YYsA",
  authDomain: "kulfi-erp-system.firebaseapp.com",
  projectId: "kulfi-erp-system",
  storageBucket: "kulfi-erp-system.firebasestorage.app",
  messagingSenderId: "882412733326",
  appId: "1:882412733326:web:b724a42b267f2c40f89adf",
  measurementId: "G-DG44QTZ5SL"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// 🔥 DB Reference (Cleaned Version)
const db = firebase.firestore();

// Sirf ye ek setting rakho, baaki sab hata do
db.settings({
  experimentalForceLongPolling: true,
});

console.log("✅ Firebase Config Loaded (Force Long Polling ON)");
