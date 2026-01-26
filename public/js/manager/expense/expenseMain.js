// Path: public/js/manager/expense/expenseMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Expense Page Loaded...");

  // 1. Security Check (Guard)
  if (window.AuthGuard) {
    window.AuthGuard.init();
  } else {
    console.error("❌ AuthGuard missing!");
    window.location.href = "../index.html";
  }

  // 2. Engine Start (Controller)
  if (window.ExpenseController) {
    window.ExpenseController.init();
  } else {
    console.error("❌ ExpenseController Missing!");
  }

  // =================================================
  // 👇 3. MOBILE SIDEBAR LOGIC (NEW ADDITION) 👇
  // =================================================
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("close-sidebar");
  const overlay = document.getElementById("overlay");

  // Agar saare elements page par hain, tabhi logic lagao
  if (menuBtn && sidebar && overlay) {
    // Open Sidebar
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active"); // Peeche ka background dhundhla karo
    });

    // Close Function (Donon jagah use hoga)
    const closeSidebar = () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    };

    // Close Button par click
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

    // Overlay (khali jagah) par click karne se bhi band ho
    overlay.addEventListener("click", closeSidebar);
  }
});
