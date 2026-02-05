document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Expense Page Initializing...");

  // 1. Initialize UI Listeners (Sidebar, etc.)
  setupSidebar();

  // 2. AuthGuard Start (Security Check)
  if (window.AuthGuard) {
    window.AuthGuard.init();
  }

  // 3. 🔥 WAIT FOR AUTH BEFORE LOADING DATA 🔥
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ User Detected:", user.email);

      // Ab controller chalao (Kyunki ab user logged in hai)
      if (window.ExpenseController) {
        try {
          window.ExpenseController.init();
        } catch (e) {
          console.error("Controller Error:", e);
        }
      }
    } else {
      // User nahi hai toh AuthGuard waise hi sambhal lega (Redirect)
      console.log("🔒 Waiting for login...");
    }
  });
});

function setupSidebar() {
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("close-sidebar");
  const overlay = document.getElementById("overlay");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });
  }

  const closeSidebar = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);

  // Logout Button Logic (Redundant if AuthGuard handles it, but safe to keep)
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Logout?")) firebase.auth().signOut();
    });
  }
}
