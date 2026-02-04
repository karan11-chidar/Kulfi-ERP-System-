window.SalesUI = {
  salesBody: document.getElementById("sales-table-body"),
  purchaseBody: document.getElementById("purchase-table-body"),
  mainLoader: document.getElementById("auth-loader"),

  toggleTab: function (tab) {
    const btnSales = document.getElementById("btn-show-sales");
    const btnPurch = document.getElementById("btn-show-purchase");
    const secSales = document.getElementById("sales-section");
    const secPurch = document.getElementById("purchase-section");
    const statSales = document.getElementById("sales-stats");
    const statPurch = document.getElementById("purchase-stats");
    const addBtn = document.getElementById("btn-add-purchase");
    const boyFilter = document.getElementById("filter-boy");
    const payFilter = document.getElementById("filter-payment");

    if (tab === "sales") {
      btnSales.classList.add("active");
      btnPurch.classList.remove("active");
      secSales.classList.remove("hidden");
      secPurch.classList.add("hidden");
      statSales.classList.remove("hidden");
      statPurch.classList.add("hidden");
      addBtn.classList.add("hidden");
      boyFilter.classList.remove("hidden");
      payFilter.classList.remove("hidden");
    } else {
      btnPurch.classList.add("active");
      btnSales.classList.remove("active");
      secPurch.classList.remove("hidden");
      secSales.classList.add("hidden");
      statPurch.classList.remove("hidden");
      statSales.classList.add("hidden");
      addBtn.classList.remove("hidden");
      boyFilter.classList.add("hidden");
      payFilter.classList.add("hidden");
    }
    if (window.lucide) window.lucide.createIcons();
  },

  renderSalesTable: function (list) {
    this.salesBody.innerHTML = "";
    if (list.length === 0) {
      this.salesBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#777;">No Sales Records Found</td></tr>`;
      return;
    }
    list.forEach((item) => {
      const amount = Number(item.amount) || 0;
      const row = `
            <tr>
                <td><strong>${item.shopName}</strong></td>
                <td>₹${amount.toLocaleString()}</td>
                <td><span class="badge ${item.paymentType || "cash"}">${item.paymentType || "cash"}</span></td>
                <td>${item.deliveryBoy || "-"}</td>
                <td>${item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
            </tr>`;
      this.salesBody.innerHTML += row;
    });
    if (window.lucide) window.lucide.createIcons();
  },

  // 🔥 UPDATED: Added Edit Button
  renderPurchaseTable: function (list) {
    this.purchaseBody.innerHTML = "";
    if (list.length === 0) {
      this.purchaseBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:#777;">No Purchase Records Found</td></tr>`;
      return;
    }
    list.forEach((item) => {
      const cost = Number(item.cost) || 0;
      const statusColor =
        item.status === "Paid"
          ? "color: var(--success);"
          : "color: var(--danger);";

      // Data Extraction
      const packets = item.quantity || 0;
      // Agar purana data hai jisme totalUnits nahi tha, toh quantity hi use karo fallback ke liye
      const totalUnits = item.totalUnits
        ? item.totalUnits
        : item.unitDetail || packets;

      // Unit Type Badge (Optional styling)
      const typeBadge = item.unitType === "packet" ? "(Pkt)" : "(Pc)";

      const row = `
            <tr>
                <td><strong>${item.itemName}</strong><br><small style="color:#888">${item.category}</small></td>
                <td>${item.supplier || "-"}</td>
                
                <td style="font-weight:600; color:#333;">${packets} <span style="font-size:10px; color:#777;">${typeBadge}</span></td>
                
                <td style="font-weight:bold; color:#0D8ABC;">${totalUnits}</td>
                
                <td>₹${cost.toLocaleString()}</td>
                <td>${item.date}</td>
                <td style="${statusColor} font-weight:600;">${item.status}</td>
                <td>
                    <button onclick="window.SalesController.openEditPurchase('${item.id}', '${item.itemName}', '${item.supplier}', ${cost}, ${packets}, '${item.status}', '${item.category}', '${item.unitDetail}')"
                    style="border:none; background:none; cursor:pointer;" title="Edit">
                        <i data-lucide="edit-2" style="width:16px; color:#0D8ABC;"></i>
                    </button>
                </td>
            </tr>`;
      this.purchaseBody.innerHTML += row;
    });
    if (window.lucide) window.lucide.createIcons();
  },

  injectStockCheckbox: function () {
    const form = document.getElementById("add-purchase-form");
    if (!form || document.getElementById("chk-add-stock-wrapper")) return;

    const btnContainer = form.querySelector(".save-btn");
    const wrapper = document.createElement("div");
    wrapper.id = "chk-add-stock-wrapper";
    wrapper.style.marginBottom = "15px";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "10px";
    wrapper.innerHTML = `
        <input type="checkbox" id="chk-add-stock" checked style="width:18px; height:18px; cursor:pointer;">
        <label for="chk-add-stock" style="font-size:14px; color:#333; cursor:pointer; font-weight:500;">
            Add this to Stock Page? 📦
        </label>
      `;
    form.insertBefore(wrapper, btnContainer);
  },

  updateStats: function (stats) {
    document.querySelector("#sales-stats .success h4").innerText =
      "₹" + (stats.salesTotal || 0).toLocaleString();
    document.querySelector("#sales-stats .info h4").innerText =
      "₹" + (stats.onlineTotal || 0).toLocaleString();
    document.querySelector("#sales-stats .warning h4").innerText =
      "₹" + (stats.cashTotal || 0).toLocaleString();
    document.querySelector("#sales-stats .primary h4").innerText =
      "₹" + (stats.lifeTimeSales || 0).toLocaleString();

    document.querySelector("#purchase-stats .info h4").innerText =
      (stats.stockInCount || 0) + " Units";
    document.querySelector("#purchase-stats .danger h4").innerText =
      "₹" + (stats.purchaseTotal || 0).toLocaleString();
    document.querySelector("#purchase-stats .warning h4").innerText =
      "₹" + (stats.weeklyPurchase || 0).toLocaleString();
    document.querySelector("#purchase-stats .success h4").innerText =
      "₹" + (stats.pendingBills || 0).toLocaleString();

    if (window.lucide) window.lucide.createIcons();
  },

  populateStaffFilter: function (staffList) {
    const select = document.getElementById("filter-boy");
    if (!select) return;
    select.innerHTML = '<option value="all">All Staff</option>';
    staffList.forEach((boy) => {
      select.innerHTML += `<option value="${boy.name}">${boy.name}</option>`;
    });
  },

  showMainLoader: function () {
    if (this.mainLoader) this.mainLoader.style.display = "flex";
  },
  hideMainLoader: function () {
    if (this.mainLoader) this.mainLoader.style.display = "none";
  },
  showScrollLoader: function () {},
};
