document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Expense Page Initializing...");

  if (window.AuthGuard) {
    window.AuthGuard.init();
  }

  if (window.ExpenseController) {
    try {
      window.ExpenseController.init();
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
