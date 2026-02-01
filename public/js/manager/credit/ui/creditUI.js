window.CreditUI = {
  tableBody: document.getElementById("credit-table-body"),
  mainLoader: document.getElementById("auth-loader"),

  // --- 1. RENDER TABLE ---
  renderTable: function (list, viewType, dateVal) {
    this.tableBody.innerHTML = "";

    // Empty State Messages
    if (list.length === 0) {
      let msg = "No records found.";
      if (viewType === "date") msg = `No transactions on ${dateVal}.`;
      if (viewType === "pending") msg = "Great! No pending credit.";

      this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color:#777;">${msg}</td></tr>`;
      return;
    }

    list.forEach((shop) => {
      const credit = shop.currentCredit || 0;
      // Red for Debt (>0), Green for Clear (<=0)
      const color = credit > 0 ? "#e74c3c" : "#2ecc71";
      const bg = credit > 0 ? "#fdedec" : "#e8f5e9";

      let dateDisplay = shop.lastTransactionDate
        ? shop.lastTransactionDate
        : "-";

      const row = `
        <tr>
            <td style="font-weight:600;">
                ${shop.shopName}
                <br><span style="font-size:11px; color:#888; font-weight:normal;">${shop.ownerName || ""}</span>
            </td>
            <td>${shop.mobile || "-"}</td>
            <td>${shop.address || "-"}</td>
            <td>
                <span style="color:${color}; background:${bg}; padding:5px 10px; border-radius:15px; font-weight:bold; font-size:13px;">
                    ₹${credit.toLocaleString()}
                </span>
            </td>
            <td style="font-size:12px; color:#555;">${dateDisplay}</td>
            <td>
                <button onclick="window.CreditController.openModal('${shop.id}', '${shop.shopName}', ${credit})" 
                   style="background:#0D8ABC; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:5px;">
                   <i data-lucide="edit-2" style="width:14px; height:14px;"></i> Update
                </button>
            </td>
        </tr>`;
      this.tableBody.innerHTML += row;
    });

    this.ensureScrollLoader();

    // 🔥 FIX 2: Lucide ko Jagana (Refresh Icons)
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // --- 2. UPDATE STATS (Colored Logic) ---
  updateStats: function (stats) {
    // A. Total Market (Outstanding Debt)
    const totalEl = document.getElementById("total-credit-display");
    if (totalEl)
      totalEl.innerText = "₹" + (stats.totalMarket || 0).toLocaleString();

    // Helper function for Color Logic
    const formatNet = (val, elId) => {
      const el = document.getElementById(elId);
      if (!el) return;
      const num = val || 0;

      if (num > 0) {
        el.style.color = "#e74c3c"; // Red
        el.innerText = "+₹" + num.toLocaleString();
      } else if (num < 0) {
        el.style.color = "#2ecc71"; // Green
        el.innerText = "-₹" + Math.abs(num).toLocaleString();
      } else {
        el.style.color = "#333";
        el.innerText = "₹0";
      }
    };

    // B. Today & Weekly Update
    formatNet(stats.todayNet, "today-credit-display");
    formatNet(stats.weekNet, "week-credit-display");
  },

  // --- 3. FILTER BUTTON STYLES ---
  updateFilterButtons: function (viewType) {
    const pendingBtn = document.getElementById("filter-pending");
    const dateInput = document.getElementById("filter-date");

    if (viewType === "pending") {
      if (pendingBtn) {
        pendingBtn.style.background = "#0D8ABC";
        pendingBtn.style.color = "#fff";
      }
      if (dateInput) {
        dateInput.style.border = "1px solid #ddd";
      }
    } else {
      if (pendingBtn) {
        pendingBtn.style.background = "#fff";
        pendingBtn.style.color = "#333";
      }
      if (dateInput) {
        dateInput.style.border = "2px solid #0D8ABC";
      }
    }
  },

  // --- 4. LOADERS ---
  showTableLoader: function () {
    this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px;"><div class="spinner" style="display:inline-block; width:30px; height:30px; border:3px solid #eee; border-top:3px solid #0D8ABC; border-radius:50%; animation:spin 0.6s linear infinite;"></div><div style="margin-top:10px; color:#666;">Searching...</div></td></tr>`;
  },
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
      tr.innerHTML = `<td colspan="6" style="text-align:center; padding:15px;"><span style="display:inline-block; width:20px; height:20px; border:2px solid #ddd; border-top:2px solid #0D8ABC; border-radius:50%; animation:spin 1s infinite;"></span><span style="margin-left:10px; color:#666; font-size:14px;">Loading more...</span></td>`;
      this.tableBody.appendChild(tr);
    }
  },
  showScrollLoader: function (show) {
    const loader = document.getElementById("scroll-loader-row");
    if (loader) loader.style.display = show ? "table-row" : "none";
  },
};
