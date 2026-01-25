// public/js/manager/ui/dashboardUI.js

window.DashboardUI = {
  // Saare Elements yahan cache kar lo
  elements: {
    roleBadge: document.querySelector(".role"),
    headerImg: document.getElementById("header-profile-img"),
    modalName: document.getElementById("profile-name"),
    modalEmail: document.getElementById("profile-email"),

    // Sidebar Elements
    menuBtn: document.getElementById("menu-btn"),
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("overlay"),
    closeSidebar: document.getElementById("close-sidebar"),
    logoutBtn: document.getElementById("logout-btn"),

    // Modal Elements
    profileModal: document.getElementById("profile-modal"),
    profileTrigger: document.getElementById("profile-trigger"),
    closeModalBtn: document.getElementById("close-modal-btn"),
    sidebarProfileLink: document.getElementById("sidebar-profile-link"),
    fileInput: document.getElementById("file-upload"),
    modalProfilePic: document.getElementById("modal-profile-pic"),
  },

  init: function () {
    console.log("🎨 DashboardUI: Initialized");
    this.setupEventListeners();
    if (window.lucide) window.lucide.createIcons();
  },

  // Backend se data aane par yahan update hoga
  updateProfile: function (user) {
    console.log("🎨 DashboardUI: Updating Profile for", user.name);
    if (this.elements.roleBadge) this.elements.roleBadge.innerText = "Manager"; // Ya user.name bhi laga sakte ho
    // Header Name agar alag se dikhana ho to yahan add kar lena

    if (this.elements.modalName) this.elements.modalName.value = user.name;
    if (this.elements.modalEmail) this.elements.modalEmail.value = user.email;
  },

  // Saare Click Events
  setupEventListeners: function () {
    const el = this.elements;

    // Sidebar Toggles
    if (el.menuBtn)
      el.menuBtn.addEventListener("click", () => this.toggleSidebar());
    if (el.closeSidebar)
      el.closeSidebar.addEventListener("click", () => this.toggleSidebar());
    if (el.overlay)
      el.overlay.addEventListener("click", () => this.toggleSidebar());

    // Logout (AuthGuard ko call karega)
    if (el.logoutBtn) {
      el.logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to logout?")) {
          if (window.AuthGuard) {
            window.AuthGuard.logout();
          } else {
            console.error("AuthGuard not found!");
          }
        }
      });
    }

    // Profile Modal
    if (el.profileTrigger)
      el.profileTrigger.addEventListener("click", () => this.openModal());
    if (el.closeModalBtn)
      el.closeModalBtn.addEventListener("click", () => this.closeModal());
    if (el.sidebarProfileLink) {
      el.sidebarProfileLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.openModal();
      });
    }

    // Image Preview
    if (el.fileInput) {
      el.fileInput.addEventListener("change", (e) =>
        this.handleImagePreview(e),
      );
    }
  },

  // Helper Functions
  toggleSidebar: function () {
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
        if (this.elements.headerImg)
          this.elements.headerImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },
};
