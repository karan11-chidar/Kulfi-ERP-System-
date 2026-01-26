setTimeout(() => {
  const screen = document.getElementById("welcome-screen");
  if (screen) {
    screen.style.opacity = "0"; // Dhire se gayab karo
    setTimeout(() => {
      screen.style.display = "none"; // Pura hata do
    }, 1000); // 1 sec transition ke liye
  }
}, 3000); // Total 3 Seconds ka wait

console.log("auth.js loaded");

// ===== Password toggle =====
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("passwordInput");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;

    if (type === "text") {
      eyeOpen.classList.add("hidden");
      eyeClosed.classList.remove("hidden");
    } else {
      eyeOpen.classList.remove("hidden");
      eyeClosed.classList.add("hidden");
    }
  });
}

// Login Logic
const emailInput = document.querySelector("input[type='email']");
const loginBtn = document.querySelector(".login-btn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // 1. Firebase Auth Check (ID Card Check)
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Login Success! Checking Database for Role...");

        // 2. Database Check (Register Check)
        // Hum 'users' collection me UID dhoondh rahe hain
        return db.collection("users").doc(user.uid).get();
      })
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const userRole = userData.role;
          const userStatus = userData.status;

          // 3. Status Check (Active hai ya nahi?)
          if (userStatus !== "active") {
            alert("Account Blocked! Please contact Admin.");
            auth.signOut(); // Turant logout kar do
            return;
          }

          // 4. Role Based Redirect (Manager vs Delivery Boy)
          if (userRole === "manager") {
            window.location.href = "./manager/dashboard.html";
          } else if (userRole === "delivery_boy") {
            window.location.href = "./deliveryboy/dashboard.html";
          } else {
            alert("Unknown Role! Contact Admin.");
          }
        } else {
          // Agar login ho gaya par database me entry nahi hai
          console.error("User document not found in Firestore!");
          alert("User data missing in Database! Contact Admin.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Login Failed: " + error.message);
      });
  });
}
