// Path: public/js/manager/stock/stockMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Sales Page Loaded...");

  // 1. Security Guard ko bulao
  if (window.AuthGuard) {
    window.AuthGuard.init(); // Ye check karega ki Manager hai ya nahi
  } else {
    console.error("❌ AuthGuard missing!");
    window.location.href = "../index.html";
  }

  // 2. Future me yahan StockUI aur StockController connect karenge
  // if (window.StockUI) window.StockUI.init();
  // if (window.StockController) window.StockController.init();
});
