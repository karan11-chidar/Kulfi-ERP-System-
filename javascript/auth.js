console.log("auth.js loaded");

// ===== Password toggle =====
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("passwordInput");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;

    if (type === "text") {
      eyeOpen.classList.add("hidden");
      eyeClosed.classList.remove("hidden");
    } else {
      eyeOpen.classList.remove("hidden");
      eyeClosed.classList.add("hidden");
    }
  });
}

// ===== Login logic =====
const emailInput = document.querySelector("input[type='email']");
const loginBtn = document.querySelector(".login-btn");

loginBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("Login successful");
      window.location.href = "manager_dashboard.html";
    })
    .catch((err) => {
      console.error("Login error:", err.code);
      alert("Invalid email or password");
    });
});
