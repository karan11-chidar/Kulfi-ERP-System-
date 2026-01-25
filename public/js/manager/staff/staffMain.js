// Path: public/js/manager/staff/staffMain.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Staff Module: Engine Starting...");

  // 1. UI System Start karo
  if (window.StaffUI) {
    window.StaffUI.init();
  } else {
    console.error("❌ Error: StaffUI file loaded nahi hai!");
  }

  // 2. Security Guard ko bulao (Global AuthGuard)
  if (window.AuthGuard) {
    console.log("👮‍♂️ AuthGuard: Verifying Manager...");
    // AuthGuard humare 'backend/authGuard.js' se ayega
    window.AuthGuard.init();
  } else {
    console.error("❌ Error: AuthGuard file missing hai!");
  }

  // 3. Backend Controller (Abhi khali hai, baad me connect karenge)
  if (window.StaffController) {
    // window.StaffController.init();
  }
});
