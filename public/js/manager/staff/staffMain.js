// Path: public/js/manager/staff/staffMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("👥 Staff Page Loaded...");

  // 1. Security Check (Guard)
  if (window.AuthGuard) {
    window.AuthGuard.init();
  } else {
    console.error("❌ AuthGuard missing!");
    window.location.href = "../index.html";
  }

  // 2. Engine Start (Controller)
  if (window.StaffController) {
    window.StaffController.init();
  } else {
    console.error("❌ StaffController Missing!");
  }

  // =================================================
  // 👇 3. MOBILE SIDEBAR LOGIC (FIXED) 👇
  // =================================================
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("close-sidebar");
  const overlay = document.getElementById("overlay");

  // Agar HTML me ye buttons hain, tabhi logic chalega
  if (menuBtn && sidebar && overlay) {
    // Open Sidebar
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });

    // Close Function
    const closeSidebar = () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    };

    // Close Button par click
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

    // Khali jagah (Overlay) par click
    overlay.addEventListener("click", closeSidebar);
  }
});
