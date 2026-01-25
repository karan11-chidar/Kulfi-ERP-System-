// public/js/deliveryboy/dbMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("🛵 Delivery App Engine Starting...");

  // 1. UI Load Karo
  if (window.DBUI) {
    window.DBUI.init();
  } else {
    console.error("❌ DBUI Not Found!");
  }

  // 2. Security Check Start Karo
  if (window.DBAuthGuard) {
    window.DBAuthGuard.init();
  } else {
    console.error("❌ DBAuthGuard Not Found!");
  }
});
