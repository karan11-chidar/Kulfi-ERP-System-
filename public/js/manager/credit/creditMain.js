document.addEventListener("DOMContentLoaded", () => {
  console.log("💳 Credit App Starting...");

  if (window.AuthGuard) window.AuthGuard.init();

  if (window.CreditController) {
    try {
      window.CreditController.init();
    } catch (e) {
      console.error("Controller Error:", e);
    }
  }

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
});
