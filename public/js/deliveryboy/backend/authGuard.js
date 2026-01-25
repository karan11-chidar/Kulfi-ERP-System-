// public/js/deliveryboy/backend/dbAuthGuard.js

window.DBAuthGuard = {
  init: function () {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("🛵 DBGuard: User Detected -", user.uid);
        this.checkRole(user.uid);
      } else {
        console.log("🛵 DBGuard: No User. Redirecting...");
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

          // ✅ CHECK PASS: Access Granted
          if (userData.role === "delivery_boy") {
            console.log("✅ Access Granted: Raju Rider");

            if (window.DBUI) window.DBUI.updateProfile(userData);

            // 👇 JADOO YAHAN HAI: Ab Parda Hatao! 👇
            const loader = document.getElementById("auth-loader");
            if (loader) loader.style.display = "none";
          } else {
            // ❌ FAIL: Parda mat hatao, bas bhaga do
            alert("🚫 Access Denied!");
            this.logout();
          }
        } else {
          alert("User profile not found!");
          this.logout();
        }
      })
      .catch((error) => console.error("Database Error:", error));
  },

  logout: function () {
    auth.signOut().then(() => {
      this.redirectToLogin();
    });
  },

  redirectToLogin: function () {
    window.location.href = "../index.html";
  },
};
