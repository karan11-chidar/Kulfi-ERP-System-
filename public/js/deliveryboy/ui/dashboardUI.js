// public/js/deliveryboy/ui/dbUI.js

window.DBUI = {
  // 1. Saare Elements yahan define kar lo (Clean Code)
  elements: {
    // Sidebar
    menuBtn: document.getElementById("menu-btn"),
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("overlay"),
    closeBtn: document.getElementById("close-sidebar"),

    // Profile Modal
    profileModal: document.getElementById("profile-modal"),
    profileTrigger: document.getElementById("profile-trigger"), // Header Image
    sidebarProfileLink: document.getElementById("sidebar-profile-link"),
    closeModalBtn: document.getElementById("close-modal-btn"),
    profileForm: document.getElementById("profile-form"),

    // Inputs & Images
    fileInput: document.getElementById("file-upload"),
    modalProfilePic: document.getElementById("modal-profile-pic"),
    headerProfileImg: document.getElementById("header-profile-img"),

    // Text Inputs
    nameInput: document.getElementById("profile-name"),
    phoneInput: document.getElementById("profile-phone"),

    // Logout Button (Agar dashboard me hai)
    logoutBtn: document.getElementById("logout-btn"),
  },

  // 2. Init Function (Sab yahan se start hoga)
  init: function () {
    console.log("🎨 DBUI: Design Logic Loaded");
    this.setupEventListeners();
    if (window.lucide) window.lucide.createIcons();
  },

  // 3. Data Update Logic (Backend se data aane par)
  updateProfile: function (user) {
    // Header me naam/photo dikhana
    console.log("🎨 Updating Header for:", user.name);

    // Agar tumhare HTML me username ka element hai to yahan update karna
    // document.getElementById("header-username").innerText = user.name;

    // Modal me purana data pre-fill karna
    if (this.elements.nameInput)
      this.elements.nameInput.value = user.name || "";
    if (this.elements.phoneInput)
      this.elements.phoneInput.value = user.mobile || "";
  },

  // 4. Saare Click Events
  setupEventListeners: function () {
    const el = this.elements;

    // --- Sidebar Logic ---
    if (el.menuBtn)
      el.menuBtn.addEventListener("click", () => this.toggleMenu());
    if (el.closeBtn)
      el.closeBtn.addEventListener("click", () => this.toggleMenu());
    if (el.overlay)
      el.overlay.addEventListener("click", () => this.toggleMenu());

    // --- Logout Logic ---
    if (el.logoutBtn) {
      el.logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Logout karna chahte ho Raju Bhai?")) {
          // Backend ko bolo logout kare
          if (window.DBAuthGuard) window.DBAuthGuard.logout();
        }
      });
    }

    // --- Profile Modal Logic ---
    if (el.profileTrigger)
      el.profileTrigger.addEventListener("click", () => this.openModal());
    if (el.closeModalBtn)
      el.closeModalBtn.addEventListener("click", () => this.closeModal());

    if (el.sidebarProfileLink) {
      el.sidebarProfileLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.openModal();
        // Mobile me menu band kar do
        if (window.innerWidth <= 768) this.toggleMenu();
      });
    }

    // Close if clicked outside
    if (el.profileModal) {
      el.profileModal.addEventListener("click", (e) => {
        if (e.target === el.profileModal) this.closeModal();
      });
    }

    // --- Image Preview Logic ---
    if (el.fileInput) {
      el.fileInput.addEventListener("change", (e) =>
        this.handleImagePreview(e),
      );
    }

    // --- Form Submit (Simulated for now) ---
    if (el.profileForm) {
      el.profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleProfileUpdate();
      });
    }
  },

  // --- Helper Functions ---
  toggleMenu: function () {
    this.elements.sidebar.classList.toggle("active");
    this.elements.overlay.classList.toggle("active");
  },

  openModal: function () {
    if (this.elements.profileModal)
      this.elements.profileModal.classList.add("active");
  },

  closeModal: function () {
    if (this.elements.profileModal)
      this.elements.profileModal.classList.remove("active");
  },

  handleImagePreview: function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.elements.modalProfilePic)
          this.elements.modalProfilePic.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  handleProfileUpdate: function () {
    // UI Update (Backend baad me connect karenge)
    const newName = this.elements.nameInput.value;
    const newPhone = this.elements.phoneInput.value;

    // Photo Sync
    if (this.elements.headerProfileImg && this.elements.modalProfilePic) {
      this.elements.headerProfileImg.src = this.elements.modalProfilePic.src;
    }

    alert(
      `Profile Updated Successfully!\nName: ${newName}\nPhone: ${newPhone}`,
    );
    this.closeModal();
  },
};
