document.addEventListener("DOMContentLoaded", function () {
  // 1. Loader Safety
  setTimeout(() => {
    const loader = document.getElementById("auth-loader");
    if (loader) loader.style.display = "none";
  }, 5000);

  // 2. Auth Check
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (window.StockController) window.StockController.init();
    } else {
      window.location.href = "../index.html";
    }
  });

  // 3. Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          window.location.href = "../index.html";
        });
    });
  }

  // 🔥 4. MOBILE SIDEBAR TOGGLE FIX
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

  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }
});
