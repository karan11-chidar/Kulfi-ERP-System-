// 🔥 Firebase configuration (Kulfi ERP Project)
const firebaseConfig = {
  apiKey: "AIzaSyAXwoBfclQpuwKGRRT4Vna4e7TUGZ1YYsA",
  authDomain: "kulfi-erp-system.firebaseapp.com",
  projectId: "kulfi-erp-system",
  storageBucket: "kulfi-erp-system.appspot.com",
  messagingSenderId: "882412733326",
  appId: "1:882412733326:web:b724a42b267f2c40f89adf",
};

// ✅ Initialize Firebase (COMPAT mode)
firebase.initializeApp(firebaseConfig);

// ✅ Auth reference (global)
const auth = firebase.auth();       

// Debug (optional)
console.log("Firebase initialized:", firebase.app().name);
// You can now use `auth` for authentication operations