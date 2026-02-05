document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 App Starting...");

  // 1. Initialize UI
  if (window.DashboardUI) {
    window.DashboardUI.init();
  }

  // 2. Auth Check & Data Load
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ Logged In:", user.email);

      // A. Update Profile UI
      if (
        window.DashboardUI &&
        typeof window.DashboardUI.updateProfile === "function"
      ) {
        window.DashboardUI.updateProfile({
          name: user.displayName || "Manager",
          email: user.email,
          photo: user.photoURL || null,
          phone: user.phoneNumber || "",
        });
      }

      // B. Init Controller
      if (window.DashboardController) {
        window.DashboardController.init();
      }

      // 🔥 C. PROFILE SAVE LISTENER (Backend Logic)
      const profileForm = document.getElementById("profile-form");
      if (profileForm) {
        profileForm.onsubmit = async (e) => {
          e.preventDefault();
          const btn = profileForm.querySelector("button");
          const originalText = btn.innerText;
          btn.innerText = "Saving...";
          btn.disabled = true;

          const newName = document.getElementById("profile-name").value;
          const newPhone = document.getElementById("profile-phone").value;
          // Note: Image upload requires Storage, skipping for simple profile update

          try {
            // 1. Update Auth Profile
            await user.updateProfile({
              displayName: newName,
            });

            // 2. Update Database (Optional: If you maintain a users collection)
            // await db.collection("users").doc(user.uid).set({ name: newName, phone: newPhone }, { merge: true });

            alert("✅ Profile Updated Successfully!");

            // Refresh UI Name
            if (window.DashboardUI) {
              document.querySelector(".role").innerText = newName; // Or specific element
            }
          } catch (err) {
            console.error("Profile Update Error", err);
            alert("Error updating profile: " + err.message);
          } finally {
            btn.innerText = originalText;
            btn.disabled = false;
            if (window.DashboardUI) window.DashboardUI.closeModal();
          }
        };
      }
    } else {
      // Not Logged In
      window.location.href = "../index.html";
    }
  });
});
