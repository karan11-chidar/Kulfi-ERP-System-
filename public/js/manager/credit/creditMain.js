document.addEventListener("DOMContentLoaded", function () {
  // 1. Auth & Init
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (window.CreditController) window.CreditController.init();
    } else {
      window.location.href = "../index.html";
    }
  });

  // 2. 🔥 SIDEBAR LOGIC (Fix for Mobile View)
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("close-sidebar");
  const overlay = document.getElementById("overlay");

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });
  }

  const closeMenu = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  };

  if (closeSidebar) closeSidebar.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  // 3. Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      firebase
        .auth()
        .signOut()
        .then(() => (window.location.href = "../index.html"));
    });
  }

  // 4. 🔥 Icons Fix
  if (window.lucide) window.lucide.createIcons();
});
