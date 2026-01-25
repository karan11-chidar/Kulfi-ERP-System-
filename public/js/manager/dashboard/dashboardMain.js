// public/js/manager/dashboardMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App Starting...");

  // 1. Pehle UI ko ready karo (Event Listeners attach karo)
  if (window.DashboardUI) {
    window.DashboardUI.init();
  } else {
    console.error("❌ DashboardUI file missing or not loaded!");
  }

  // 2. Phir Security Check start karo
  if (window.AuthGuard) {
    window.AuthGuard.init();
  } else {
    console.error("❌ AuthGuard file missing or not loaded!");
  }
});
