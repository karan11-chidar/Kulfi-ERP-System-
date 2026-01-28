window.AuthGuard = {
  init: function () {
    console.log("👮‍♂️ AuthGuard: Active & Watching...");

    // 1. Firebase Auth Listener (ID Card Check)
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User login hai -> Role check karo
        this.checkRole(user.uid);
      } else {
        // User login nahi hai -> Bahar feko
        console.log("🔒 No User Found. Redirecting to Login...");
        this.redirectToLogin();
      }
    });

    // 2. 👇 NEW: UNIVERSAL LOGOUT LISTENER 👇
    // Ye code har page par Logout button dhundega aur uspe click sunega
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Link par mat jao
        this.logout(); // Asli Logout function chalao
      });
    }
  },

  checkRole: function (uid) {
    db.collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();

          // Case 1: Manager Verified
          if (userData.role === "delivery_boy") {
            console.log("✅ Access Granted.");

            // UI Updates (Universal)
            if (window.DashboardUI) window.DashboardUI.updateProfile(userData);

            if (window.StaffUI) {
              window.StaffUI.hideLoader();
              if (window.StaffController) window.StaffController.init();
            }

            // Fallback Loader Hide
            const loader = document.getElementById("auth-loader");
            if (loader) loader.style.display = "none";
          } else {
            // Case 2: Intruder
            alert("🚫 Access Denied! Managers Only.");
            this.logout();
          }
        } else {
          alert("User record not found!");
          this.logout();
        }
      })
      .catch((error) => {
        console.error("Database Error:", error);
      });
  },

  // 3. Asli Logout Function (Firebase se bahar nikalne wala)
  logout: function () {
    console.log("👋 Logging out...");
    auth
      .signOut()
      .then(() => {
        // SignOut hone ke baad redirect karo
        this.redirectToLogin();
      })
      .catch((error) => {
        console.error("Logout Error:", error);
        // Agar error aaye tab bhi bahar fek do safety ke liye
        this.redirectToLogin();
      });
  },

  redirectToLogin: function () {
    // Check karo hum kahan hain, taki path sahi bane
    // Agar hum 'manager/staff/' folder me hue to '../../' chahiye hoga
    // Lekin abhi hum simple rakhte hain
    window.location.href = "../index.html";
  },
};
