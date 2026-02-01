// Path: public/js/manager/shops/shopsMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("🏪 Shop App Starting...");

  if (window.AuthGuard) window.AuthGuard.init();

  if (window.ShopsController) {
    try {
      window.ShopsController.init();
    } catch (e) {
      console.error("Controller Error:", e);
    }
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
