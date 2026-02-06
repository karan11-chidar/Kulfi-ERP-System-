window.StockUI = {
  tableBody: document.getElementById("stock-table-body"),
  mainLoader: document.getElementById("auth-loader"),

  renderLoading: function () {
    this.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Loading...</td></tr>`;
  },

  renderTable: function (data, currentViewMode = "all") {
    this.tableBody.innerHTML = "";
    if (data.length === 0) {
      this.tableBody.innerHTML += `<tr><td colspan="7" style="text-align:center; padding: 20px;">No stock found here</td></tr>`;
      return;
    }
    data.forEach((item) => {
      let qty = Number(item.qty) || 0;
      let pktSize = Number(item.packetSize) || 1;
      let packets = Math.floor(qty / pktSize);

      let packetDisplay =
        pktSize > 1
          ? `<strong>${packets}</strong> Pkt <span style="font-size:11px; color:#777;">(${pktSize}/pkt)</span>`
          : `<span style="color:#999">-</span>`;

      let statusClass = qty > 10 ? "in-stock" : qty > 0 ? "low" : "out";
      let statusText =
        qty > 10 ? "In Stock" : qty > 0 ? "Low Stock" : "Out of Stock";

      const isGodown = currentViewMode === "all";

      // 🔥 CHANGE: Price ab hamesha dikhega (chahe godown ho ya boy)
      const priceDisplay = `₹${item.price || 0}`;

      // Actions sirf Godown me dikhenge, Boy me "Assigned" dikhega
      let actionButtons = isGodown
        ? `<div class="action-icons"><i data-lucide="edit-2" style="cursor:pointer; color:#0D8ABC; margin-right:10px;" onclick="window.StockController.openEditStock('${item.id}', '${item.name}', ${qty}, ${item.price}, '${item.category}', ${pktSize})"></i><i data-lucide="trash-2" class="delete" onclick="window.StockController.handleDelete('${item.id}')" style="cursor:pointer; color:red;"></i></div>`
        : `<span style="font-size:11px; color:#555;">Assigned</span>`;

      const row = `<tr><td><strong>${item.name}</strong></td><td>${packetDisplay}</td><td style="font-weight: bold; color: ${isGodown ? "#0D8ABC" : "#E67E22"};">${qty} Units</td><td>${item.category}</td><td>${priceDisplay}</td><td><span class="status ${statusClass}">${statusText}</span></td><td>${actionButtons}</td></tr>`;
      this.tableBody.innerHTML += row;
    });
    if (window.lucide) window.lucide.createIcons();
  },

  populateDropdowns: function (boys, products) {
    ["assign-boy-select", "return-boy-select", "boy-stock-filter"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML =
            id === "boy-stock-filter"
              ? '<option value="all">Godown (All Stock)</option>'
              : '<option value="">-- Select Boy --</option>';
          boys.forEach(
            (b) => (el.innerHTML += `<option value="${b}">${b}</option>`),
          );
        }
      },
    );
    ["assign-product-select"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '<option value="">-- Select Product --</option>';
        products.forEach(
          (p) =>
            (el.innerHTML += `<option value="${p.name}">${p.name}</option>`),
        );
      }
    });
    const dataList = document.getElementById("damage-name-list");
    if (dataList) {
      dataList.innerHTML = "";
      products.forEach((p) => {
        dataList.innerHTML += `<option value="${p.name}">`;
      });
    }
  },

  showMainLoader: function () {
    if (this.mainLoader) this.mainLoader.style.display = "flex";
  },
  hideMainLoader: function () {
    if (this.mainLoader) this.mainLoader.style.display = "none";
    else {
      const l = document.getElementById("auth-loader");
      if (l) l.style.display = "none";
    }
  },

  renderStats: function (
    godownUnits,
    godownPackets,
    boysStats,
    outOfStock,
    damageStats,
  ) {
    // 1. Godown Card
    const godownEl = document.getElementById("godown-stats-display");
    if (godownEl) {
      godownEl.innerHTML = `<h4 style="margin:0;">${godownPackets} Pkts</h4><span style="font-size:12px; color:#555;">(${godownUnits} Pieces)</span>`;
    }

    // 2. Boy Stock Card
    const boysEl = document.getElementById("boy-stock-count");
    if (boysEl) {
      boysEl.innerHTML = `<h4 style="margin:0; font-size:1.1rem; color:#0288d1;">${boysStats.totalPackets || 0} Pkts</h4><span style="font-size:11px; color:#555;">(${boysStats.totalUnits || 0} Items)</span>`;
    }

    // 3. Out of Stock Card
    const outEl = document.querySelectorAll(".mini-card.danger h4")[0];
    if (outEl) outEl.innerText = outOfStock + " Items";

    // 4. Damage Card
    const damageEl = document.getElementById("total-damaged-display");
    if (damageEl) {
      damageEl.innerHTML = `<h4 style="margin:0;">${damageStats.totalPkt || 0} Pkt + ${damageStats.totalPcs || 0} Pcs</h4>`;
    }
  },

  renderDamageList: function (list) {
    const tbody = document.getElementById("damage-history-list");
    tbody.innerHTML = "";
    if (list.length === 0) {
      tbody.innerHTML =
        "<tr><td colspan='3' style='text-align:center; padding:10px;'>No entries found</td></tr>";
      return;
    }
    list.forEach((item) => {
      tbody.innerHTML += `<tr style="border-bottom: 1px solid #eee;"><td style="padding:8px;"><div style="font-weight:bold;">${item.productName}</div><div style="font-size:11px; color:#777;">${item.category}</div></td><td style="padding:8px;">${item.packets} Pkt, ${item.pieces} Pcs</td><td style="padding:8px; text-align:right;"><button onclick="window.StockController.deleteDamageEntry('${item.id}')" style="background:none; border:none; color:red; cursor:pointer;"><i data-lucide="trash-2" style="width:16px;"></i></button></td></tr>`;
    });
    if (window.lucide) window.lucide.createIcons();
  },
};
