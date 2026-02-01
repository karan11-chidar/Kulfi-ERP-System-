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

  renderPurchaseTable: function (list) {
    this.purchaseBody.innerHTML = "";
    if (list.length === 0) {
      this.purchaseBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#777;">No Purchase Records Found</td></tr>`;
      return;
    }
    list.forEach((item) => {
      const cost = Number(item.cost) || 0;
      const statusColor =
        item.status === "Paid"
          ? "color: var(--success);"
          : "color: var(--danger);";
      const row = `
            <tr>
                <td><strong>${item.itemName}</strong><br><small style="color:#888">${item.category}</small></td>
                <td>${item.supplier || "-"}</td>
                <td>${item.quantity || 0}</td>
                <td>₹${cost.toLocaleString()}</td>
                <td>${item.date}</td>
                <td style="${statusColor} font-weight:600;">${item.status}</td>
            </tr>`;
      this.purchaseBody.innerHTML += row;
    });
    if (window.lucide) window.lucide.createIcons();
  },
  injectStockCheckbox: function () {
    const form = document.getElementById("add-purchase-form");
    if (!form) return;

    // Check karo agar pehle se checkbox hai toh dobara mat lagao
    if (document.getElementById("chk-add-stock-wrapper")) return;

    const btnContainer = form.querySelector(".save-btn");

    // HTML Create karo
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

    // Button se theek pehle insert karo
    form.insertBefore(wrapper, btnContainer);
  },

  // 🔥 UPDATE STATS (Weekly ki jagah Total Sales dikhana)
  updateStats: function (stats) {
    // 1. TODAY'S SALES
    document.querySelector("#sales-stats .success h4").innerText =
      "₹" + (stats.salesTotal || 0).toLocaleString();

    // 2. ONLINE & CASH
    document.querySelector("#sales-stats .info h4").innerText =
      "₹" + (stats.onlineTotal || 0).toLocaleString();
    document.querySelector("#sales-stats .warning h4").innerText =
      "₹" + (stats.cashTotal || 0).toLocaleString();

    // 3. 🔥 TOTAL LIFETIME SALES (Changed from Weekly)
    const totalSaleEl = document.querySelector("#sales-stats .primary h4");
    if (totalSaleEl) {
      // Hame yahan label bhi change karna chahiye agar HTML me 'Weekly' likha hai
      // Lekin filhal hum value replace kar rahe hain
      totalSaleEl.innerText = "₹" + (stats.lifeTimeSales || 0).toLocaleString();

      // Optional: Label change karne ka code
      const labelEl = totalSaleEl.parentElement.querySelector("p");
      if (labelEl) labelEl.innerText = "Total Sales";
    }

    // PURCHASE CARDS
    document.querySelector("#purchase-stats .info h4").innerText =
      (stats.stockInCount || 0) + " Units";
    document.querySelector("#purchase-stats .danger h4").innerText =
      "₹" + (stats.purchaseTotal || 0).toLocaleString();
    const weekPurchEl = document.querySelector("#purchase-stats .warning h4");
    if (weekPurchEl)
      weekPurchEl.innerText =
        "₹" + (stats.weeklyPurchase || 0).toLocaleString();
    const pendingEl = document.querySelector("#purchase-stats .success h4");
    if (pendingEl)
      pendingEl.innerText = "₹" + (stats.pendingBills || 0).toLocaleString();

    if (window.lucide) window.lucide.createIcons();
  },

  populateStaffFilter: function (staffList) {
    const select = document.getElementById("filter-boy");
    if (!select) return;
    select.innerHTML = '<option value="all">All Staff</option>';
    staffList.forEach((boy) => {
      const option = document.createElement("option");
      option.value = boy.name;
      option.innerText = boy.name;
      select.appendChild(option);
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
