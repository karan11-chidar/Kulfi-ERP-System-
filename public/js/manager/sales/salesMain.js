// Path: public/js/manager/sales/salesMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Sales App Starting...");

  // 1. Security Check
  if (window.AuthGuard) window.AuthGuard.init();

  // 2. Controller Start
  if (window.SalesController) {
    try {
      window.SalesController.init();
    } catch (e) {
      console.error("Controller Error:", e);
    }
  }

  // 3. Sidebar Logic
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("close-sidebar");
  const overlay = document.getElementById("overlay");
  const toggleMenu = () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
  if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
  if (overlay) overlay.addEventListener("click", toggleMenu);

  // 🔥🔥🔥 FIX: ICONS KO JAGANA (Page Load Hote Hi) 🔥🔥🔥
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
