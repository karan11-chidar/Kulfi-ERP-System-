// Path: public/js/manager/expense/expenseMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 1. Main File Loaded");

  // Check AuthGuard
  if (window.AuthGuard) {
    console.log("🟢 2. AuthGuard Found");
    window.AuthGuard.init();
  } else {
    console.error("🔴 AuthGuard Missing!");
  }

  // Check Controller
  if (window.ExpenseController) {
    console.log("🟢 3. Controller Found, Initializing...");
    try {
      window.ExpenseController.init();
    } catch (error) {
      console.error("🔴 Controller Crash:", error);
      // Agar crash ho, to loader hata do taaki screen dikhe
      document.getElementById("auth-loader").style.display = "none";
      alert("Code Crash: " + error.message);
    }
  } else {
    console.error(
      "🔴 ExpenseController NOT Found! (Check expenseController.js for syntax errors)",
    );
    // Loader hatao taaki user ko pata chale kuch gadbad hai
    document.getElementById("auth-loader").style.display = "none";
  }

  // Sidebar Logic
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
});
