// AuthGuard Object - Delivery Boy Dashboard Security with Animation
window.AuthGuard = {
  init: function () {
    console.log("👮‍♂️ AuthGuard: Monitoring Delivery Boy Session...");

    // 1. Initial State: Page ko hide karo taaki flash na ho
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s ease-in-out";

    // 2. Firebase Auth Listener
    auth.onAuthStateChanged((user) => {
      if (user) {
        // Agar user login hai, toh uska role check karo
        this.checkRole(user.uid);
      } else {
        // Agar login nahi hai, toh seedha login page par bhejo
        console.log("🔒 Access Denied. Redirecting to Login...");
        this.redirectToLogin();
      }
    });

    // 3. Universal Logout Listener
    document.addEventListener("click", (e) => {
      if (
        e.target &&
        (e.target.id === "logout-btn" || e.target.closest("#logout-btn"))
      ) {
        e.preventDefault();
        this.logout();
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

          // Dashboard par sirf delivery_boy ko aane do
          if (userData.role === "delivery_boy") {
            console.log("✅ Access Granted: Welcome", userData.name);

            // UI par user ka naam update karein
            const profileName = document.querySelector(".user-name h4");
            if (profileName && userData.name) {
              profileName.innerText = userData.name;
            }

            // Animation ke sath loader hatana aur page dikhana
            this.showContent();
          } else {
            alert("🚫 Access Denied! This area is for Delivery Boys only.");
            this.logout();
          }
        } else {
          alert("User record not found in database!");
          this.logout();
        }
      })
      .catch((error) => {
        console.error("Database Error:", error);
        this.logout();
      });
  },

  showContent: function () {
    const loader = document.getElementById("auth-loader");

    // Loader ko fade out karein
    if (loader) {
      loader.style.transition = "opacity 0.4s ease";
      loader.style.opacity = "0";

      setTimeout(() => {
        loader.style.display = "none";
        // Page content ko smooth tarike se dikhayein
        document.body.style.display = "block";
        setTimeout(() => {
          document.body.style.opacity = "1";
        }, 50);
      }, 400);
    } else {
      // Agar loader ID na mile tab bhi page dikha do
      document.body.style.display = "block";
      document.body.style.opacity = "1";
    }
  },

  logout: function () {
    console.log("👋 Logging out user...");
    auth
      .signOut()
      .then(() => {
        this.redirectToLogin();
      })
      .catch((error) => {
        console.error("Logout Error:", error);
        this.redirectToLogin();
      });
  },

  redirectToLogin: function () {
    window.location.href = "../index.html";
  },
};

// Auto-initialize AuthGuard
window.AuthGuard.init();
