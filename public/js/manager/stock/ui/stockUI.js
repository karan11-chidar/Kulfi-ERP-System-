window.StockUI = {
  tableBody: document.getElementById("stock-table-body"),
  mainLoader: document.getElementById("auth-loader"),

  renderLoading: function () {
    this.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Loading...</td></tr>`;
  },

  renderTable: function (data) {
    this.tableBody.innerHTML = "";
    if (data.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No products found</td></tr>`;
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

      const row = `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${packetDisplay}</td>
                <td style="font-weight: bold; color: #0D8ABC;">${qty} Units</td>
                <td>${item.category}</td>
                <td>₹${item.price}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-icons">
                        <i data-lucide="edit-2" style="cursor:pointer; color:#0D8ABC; margin-right:10px;" onclick="window.StockController.openEditStock('${item.id}', '${item.name}', ${qty}, ${item.price}, '${item.category}', ${pktSize})"></i>
                        <i data-lucide="trash-2" class="delete" onclick="window.StockController.handleDelete('${item.id}')" style="cursor:pointer; color:red;"></i>
                    </div>
                </td>
            </tr>`;
      this.tableBody.innerHTML += row;
    });
    if (window.lucide) window.lucide.createIcons();
  },

  // 🔥 STATS DISPLAY (Updated for Boys Stock)
  renderStats: function (
    godownUnits,
    godownPackets,
    boysTotalUnits,
    outOfStock,
  ) {
    const godownEl = document.getElementById("godown-stats-display");
    if (godownEl) {
      godownEl.innerHTML = `
            <h4 style="margin:0;">${godownPackets} Pkts</h4>
            <span style="font-size:12px; color:#555; font-weight:500;">(${godownUnits} Pieces)</span>
          `;
    }

    const boysEl = document.getElementById("boy-stock-count");
    if (boysEl) boysEl.innerText = `${boysTotalUnits} Items`;

    const outEl = document.querySelectorAll(".mini-card.danger h4")[0];
    if (outEl) outEl.innerText = outOfStock + " Items";
  },

  populateDropdowns: function (boys, products) {
    ["assign-boy-select", "return-boy-select", "boy-stock-filter"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = '<option value="">-- Select Boy --</option>';
          if (id === "boy-stock-filter")
            el.innerHTML = '<option value="all">All Boys Stock</option>';
          boys.forEach(
            (b) => (el.innerHTML += `<option value="${b}">${b}</option>`),
          );
        }
      },
    );
    // NOTE: "return-product-select" is NOT populated here because it depends on the selected boy
    ["assign-product-select", "damage-product-select"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '<option value="">-- Select Product --</option>';
        products.forEach(
          (p) => (el.innerHTML += `<option value="${p}">${p}</option>`),
        );
      }
    });
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
};
