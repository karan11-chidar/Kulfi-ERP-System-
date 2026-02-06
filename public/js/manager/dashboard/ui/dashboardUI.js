window.DashboardUI = {
  elements: {
    roleBadge: document.querySelector(".role"),
    headerImg: document.getElementById("header-profile-img"),

    modalName: document.getElementById("profile-name"),
    modalEmail: document.getElementById("profile-email"),
    modalPhone: document.getElementById("profile-phone"),
    modalProfilePic: document.getElementById("modal-profile-pic"),

    menuBtn: document.getElementById("menu-btn"),
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("overlay"),
    closeSidebar: document.getElementById("close-sidebar"),
    logoutBtn: document.getElementById("logout-btn"),

    profileModal: document.getElementById("profile-modal"),
    profileTrigger: document.getElementById("profile-trigger"),
    closeModalBtn: document.getElementById("close-modal-btn"),
    sidebarProfileLink: document.getElementById("sidebar-profile-link"),
    fileInput: document.getElementById("file-upload"),

    stockCount: document.getElementById("dash-stock-count"),
    salesCount: document.getElementById("dash-sales-count"),
    pendingCount: document.getElementById("dash-pending-count"),
    boyCount: document.getElementById("dash-active-boys"),

    // List Container
    pendingList: document.getElementById("dash-pending-list"),
    loader: document.getElementById("auth-loader"),
  },

  init: function () {
    console.log("📊 DashboardUI: Initialized");
    this.setupEventListeners();
    if (window.lucide) window.lucide.createIcons();
  },

  showLoader: function () {
    if (this.elements.loader) this.elements.loader.style.display = "flex";
  },
  hideLoader: function () {
    if (this.elements.loader) this.elements.loader.style.display = "none";
  },

  updateProfile: function (user) {
    if (this.elements.roleBadge) this.elements.roleBadge.innerText = "Manager";
    if (user.photo && this.elements.headerImg)
      this.elements.headerImg.src = user.photo;
    if (user.photo && this.elements.modalProfilePic)
      this.elements.modalProfilePic.src = user.photo;
    if (this.elements.modalName)
      this.elements.modalName.value = user.name || "";
    if (this.elements.modalEmail)
      this.elements.modalEmail.value = user.email || "";
    if (this.elements.modalPhone)
      this.elements.modalPhone.value = user.phone || "";
  },

  updateDashboard: function (data) {
    const formatMoney = (amt) => "₹" + (amt || 0).toLocaleString();

    if (this.elements.stockCount)
      this.elements.stockCount.innerHTML = `${data.stockPackets} Pkts <span style="font-size:0.8em; font-weight:normal; color:#555;">(${data.stockUnits} Units)</span>`;
    if (this.elements.salesCount)
      this.elements.salesCount.innerText = formatMoney(data.salesToday);
    if (this.elements.pendingCount)
      this.elements.pendingCount.innerText = formatMoney(data.totalCredit);
    if (this.elements.boyCount)
      this.elements.boyCount.innerHTML = `<strong>Live</strong> ${data.activeBoys}`;

    // Render List
    this.renderPendingList(data.topPending);
  },

  // 🔥 UPDATED: Clickable Address & Phone Number
  renderPendingList: function (list) {
    if (!this.elements.pendingList) return;
    this.elements.pendingList.innerHTML = "";

    if (!list || list.length === 0) {
      this.elements.pendingList.innerHTML = `<div style="padding:20px; text-align:center; color:#777;">No Pending Dues ✅</div>`;
      return;
    }

    list.forEach((item) => {
      let borderClass = "border-left: 4px solid var(--success-color);";
      let riskClass = "color: var(--success-color);";

      // Risk Colors
      if (item.amount > 10000) {
        borderClass = "border-left: 4px solid var(--danger-color);";
        riskClass = "color: var(--danger-color); font-weight:bold;";
      } else if (item.amount > 5000) {
        borderClass = "border-left: 4px solid var(--warning-color);";
        riskClass = "color: var(--warning-color); font-weight:bold;";
      }

      // 🔗 Clickable Logic
      const mapLink = item.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`
        : "#";
      const phoneLink = item.mobile ? `tel:${item.mobile}` : "#";
      const phoneDisplay = item.mobile || "No Number";

      const html = `
            <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; border-radius:8px; margin-bottom:10px; box-shadow:0 2px 5px rgba(0,0,0,0.05); ${borderClass}">
              <div class="shop-info">
                <h4 style="margin:0; font-size:1rem; font-weight:600;">${item.name}</h4>
                
                <div style="margin-top:4px;">
                    <a href="${mapLink}" target="_blank" style="font-size:0.85rem; color:#666; text-decoration:none; display:flex; align-items:center; gap:5px;">
                        <i data-lucide="map-pin" style="width:14px; color:#0D8ABC;"></i> ${item.address}
                    </a>
                </div>

                <div style="margin-top:4px;">
                    <a href="${phoneLink}" style="font-size:0.85rem; color:#666; text-decoration:none; display:flex; align-items:center; gap:5px;">
                        <i data-lucide="phone" style="width:14px; color:#28a745;"></i> ${phoneDisplay}
                    </a>
                </div>
              </div>
              
              <div class="credit-amount" style="font-size:1rem; ${riskClass}">
                ₹${item.amount.toLocaleString()}
              </div>
            </div>`;

      this.elements.pendingList.innerHTML += html;
    });
    if (window.lucide) window.lucide.createIcons();
  },

  setupEventListeners: function () {
    const el = this.elements;
    if (el.menuBtn)
      el.menuBtn.addEventListener("click", () => this.toggleSidebar());
    if (el.closeSidebar)
      el.closeSidebar.addEventListener("click", () => this.toggleSidebar());
    if (el.overlay)
      el.overlay.addEventListener("click", () => this.toggleSidebar());

    if (el.logoutBtn) {
      el.logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Logout?"))
          firebase
            .auth()
            .signOut()
            .then(() => (window.location.href = "../index.html"));
      });
    }

    if (el.profileTrigger)
      el.profileTrigger.addEventListener("click", () =>
        el.profileModal.classList.add("active"),
      );
    if (el.closeModalBtn)
      el.closeModalBtn.addEventListener("click", () =>
        el.profileModal.classList.remove("active"),
      );
    if (el.fileInput)
      el.fileInput.addEventListener("change", (e) =>
        this.handleImagePreview(e),
      );
  },

  toggleSidebar: function () {
    this.elements.sidebar.classList.toggle("active");
    this.elements.overlay.classList.toggle("active");
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
