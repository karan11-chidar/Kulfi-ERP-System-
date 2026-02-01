// Path: public/js/manager/shops/ui/shopsUI.js

window.ShopsUI = {
  tableBody: document.getElementById("shops-table-body"),
  mainLoader: document.getElementById("auth-loader"),

  // 1. DATA DIKHANE WALA FUNCTION
  renderTable: function (list) {
    this.tableBody.innerHTML = "";
    if (!list || list.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#777;">No shops found</td></tr>`;
      return;
    }

    list.forEach((item) => {
      // Status Color Logic
      let statusBadge =
        item.status === "Active"
          ? `<span style="background:#e8f5e9; color:#2e7d32; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600;">Active</span>`
          : `<span style="background:#ffebee; color:#c62828; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600;">Inactive</span>`;

      const row = `
        <tr>
          <td style="font-weight:600; color:#333;">${item.shopName}</td>
          <td>${item.ownerName}</td>
          <td>${item.mobile}</td>
          <td>${item.address}</td>
          <td>${statusBadge}</td>
          <td>
             <button onclick="window.ShopsController.openEditModal('${item.id}')" title="Edit" style="border:none; background:none; cursor:pointer; margin-right:8px;">
                <i data-lucide="edit-2" style="color:#0D8ABC; width:18px;"></i>
             </button>
             <button onclick="window.ShopsController.deleteShop('${item.id}')" title="Delete" style="border:none; background:none; cursor:pointer;">
                <i data-lucide="trash-2" style="color:#d32f2f; width:18px;"></i>
             </button>
          </td>
        </tr>
      `;
      this.tableBody.innerHTML += row;
    });

    if (window.lucide) window.lucide.createIcons();
    this.ensureScrollLoader();
  },

  // 2. STATS UPDATE
  updateStats: function (stats) {
    if (!stats) return;
    const totalEl = document.getElementById("total-shops-count");
    if (totalEl) totalEl.innerText = stats.total;

    const activeEl = document.getElementById("active-shops-count");
    if (activeEl) activeEl.innerText = stats.active;

    const inactiveEl = document.getElementById("inactive-shops-count");
    if (inactiveEl) inactiveEl.innerText = stats.inactive;
  },

  // 3. LOADERS (Yahan Change Kiya Hai)

  // 🔥 NEW: Sirf Table ke andar Loading dikhayega (Full screen nahi)
  showTableLoader: function () {
    this.tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center; padding:40px;">
                <div class="spinner" style="display:inline-block; width:30px; height:30px; border:3px solid #eee; border-top:3px solid #0D8ABC; border-radius:50%; animation:spin 0.6s linear infinite;"></div>
                <div style="margin-top:10px; color:#666; font-size:14px;">Searching...</div>
            </td>
        </tr>
      `;
  },

  clearTable: function () {
    this.tableBody.innerHTML = "";
  },

  // Ye Full Screen wala hai (Sirf shuru me use karenge)
  showMainLoader: function () {
    if (this.mainLoader) this.mainLoader.style.display = "flex";
  },
  hideMainLoader: function () {
    if (this.mainLoader) this.mainLoader.style.display = "none";
  },

  ensureScrollLoader: function () {
    if (!document.getElementById("scroll-loader-row")) {
      const tr = document.createElement("tr");
      tr.id = "scroll-loader-row";
      tr.style.display = "none";
      tr.innerHTML = `
            <td colspan="6" style="text-align:center; padding:15px;">
                <span style="display:inline-block; width:20px; height:20px; border:2px solid #ddd; border-top:2px solid #0D8ABC; border-radius:50%; animation:spin 1s infinite;"></span>
                <span style="margin-left:10px; color:#666; font-size:14px;">Loading more...</span>
            </td>
          `;
      this.tableBody.appendChild(tr);
    }
  },

  showScrollLoader: function (show) {
    const loader = document.getElementById("scroll-loader-row");
    if (loader) loader.style.display = show ? "table-row" : "none";
  },
};
