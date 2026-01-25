// public/js/manager/backend/authGuard.js

window.AuthGuard = {
  init: function () {
    // Firebase Auth Listener (ID Card Check)
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("🔒 AuthGuard: Checking User...", user.uid);
        this.checkRole(user.uid);
      } else {
        console.log("🔒 AuthGuard: No User. Redirecting...");
        this.redirectToLogin();
      }
    });
  },

  checkRole: function (uid) {
    db.collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();

          // 🛑 Case 1: Role Missing
          if (!userData.role) {
            alert("⚠️ Error: No Role Assigned!");
            this.logout();
            return;
          }

          // ✅ Case 2: Success (Manager Verified)
          if (userData.role === "manager") {
            console.log("✅ AuthGuard: Manager Access Granted.");

            // ----------------------------------------------
            // 👇 UNIVERSAL UI UPDATES (Har Page ke liye) 👇
            // ----------------------------------------------

            // 1. Agar Dashboard Page hai:
            if (window.DashboardUI) {
              window.DashboardUI.updateProfile(userData);
            }

            // 2. Agar Staff Page hai:
            if (window.StaffUI) {
              // Staff UI me humne loader hide karne ka function banaya tha
              window.StaffUI.hideLoader();

              // Controller bhi start kar do
              if (window.StaffController) window.StaffController.init();
            }

            // 3. Fallback: Agar upar walo ne loader nahi hataya, to zabardasti hatao
            const loader = document.getElementById("auth-loader");
            if (loader) loader.style.display = "none";
          } else {
            // 🚫 Case 3: Intruder
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

  logout: function () {
    auth.signOut().then(() => {
      this.redirectToLogin();
    });
  },

  redirectToLogin: function () {
    // Ek folder bahar nikalkar index.html par jao
    window.location.href = "../index.html";
  },
};
