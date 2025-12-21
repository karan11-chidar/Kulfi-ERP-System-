// --- DOM Elements ---
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-sidebar");

// --- Menu Toggle Logic ---
function toggleMenu() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// --- Profile Modal Logic ---
const profileModal = document.getElementById("profile-modal");
const profileTrigger = document.getElementById("profile-trigger"); // Header wala Image
const sidebarProfileLink = document.getElementById("sidebar-profile-link"); // Sidebar wala Link
const closeModalBtn = document.getElementById("close-modal-btn");
const profileForm = document.getElementById("profile-form");

// Profile Image Elements
const fileUploadInput = document.getElementById("file-upload");
const modalProfilePic = document.getElementById("modal-profile-pic");
const headerProfileImg = document.getElementById("header-profile-img");

function openModal() {
  if (profileModal) profileModal.classList.add("active");
}

function closeModal() {
  if (profileModal) profileModal.classList.remove("active");
}

// Click Events for Modal
if (profileTrigger) profileTrigger.addEventListener("click", openModal);
if (sidebarProfileLink)
  sidebarProfileLink.addEventListener("click", (e) => {
    e.preventDefault(); // Link ko page reload karne se roko
    openModal();
    if (window.innerWidth <= 768) toggleMenu();
  });
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

// Close modal if clicked outside
if (profileModal) {
  profileModal.addEventListener("click", (e) => {
    if (e.target === profileModal) closeModal();
  });
}

// --- Image Upload Logic (Preview) ---
if (fileUploadInput) {
  fileUploadInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        // Image ko turant update karo (Preview)
        if (modalProfilePic) modalProfilePic.src = e.target.result;
        // Header wali image bhi update kar do (optional, for instant feel)
        // if(headerProfileImg) headerProfileImg.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });
}

// Form Submit (Sirf Alert dikhayega, page reload nahi karega)
if (profileForm) {
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Agar nayi image upload hui hai toh header bhi update kar do
    if (
      fileUploadInput.files &&
      fileUploadInput.files[0] &&
      headerProfileImg &&
      modalProfilePic
    ) {
      headerProfileImg.src = modalProfilePic.src;
    }

    alert("Profile & Photo Updated! (Static Design Only)");
    closeModal();
  });
}

// Icons Render (Lucide)
if (window.lucide) {
  window.lucide.createIcons();
}

