// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXwoBfclQpuwKGRRT4Vna4e7TUGZ1YYsA",
  authDomain: "kulfi-erp-system.firebaseapp.com",
  projectId: "kulfi-erp-system",
  storageBucket: "kulfi-erp-system.firebasestorage.app",
  messagingSenderId: "882412733326",
  appId: "1:882412733326:web:b724a42b267f2c40f89adf",
};

// Initialize Firebase (CDN style)
firebase.initializeApp(firebaseConfig);

// Auth reference
const auth = firebase.auth();
