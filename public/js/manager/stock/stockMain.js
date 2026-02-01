document.addEventListener("DOMContentLoaded", function () {
  // 1. Auth State Check
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ User Logged In:", user.email);

      // 2. Initialize Stock Module
      if (window.StockController) {
        window.StockController.init();
      } else {
        console.error("❌ StockController not found! Check script imports.");
      }
    } else {
      // Agar user login nahi hai, login page par bhejo
      console.log("⛔ No user found. Redirecting to login...");
      window.location.href = "../index.html";
    }
  });

  // 3. Logout Button Logic (Sidebar wala)
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("Logged Out");
          window.location.href = "../index.html";
        })
        .catch((error) => console.error("Logout Error:", error));
    });
  }
});
