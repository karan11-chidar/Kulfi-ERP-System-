document.addEventListener("DOMContentLoaded", function () {
  // 🔥 Safety Timeout: 5 sec baad loader hata do
  setTimeout(() => {
    const loader = document.getElementById("auth-loader");
    if (loader) loader.style.display = "none";
  }, 5000);

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (window.StockController) window.StockController.init();
    } else {
      window.location.href = "../index.html";
    }
  });

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
});
