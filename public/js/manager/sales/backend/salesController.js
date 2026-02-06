window.SalesController = {
  currentTab: "sales",
  salesList: [],
  salesLastDoc: null,
  salesHasMore: true,
  purchaseList: [],
  purchaseLastDoc: null,
  purchaseHasMore: true,
  isLoading: false,
  filters: {
    date: "",
    search: "",
    boy: "all",
    payment: "all",
  },

  // 🔥 CHANGED: Lifetime -> Weekly
  weeklySalesTotal: 0,
  searchTimer: null,

  init: async function () {
    console.log("📊 SalesController: Ready 🚀");
    if (window.SalesUI) window.SalesUI.showMainLoader();

    // Set Local Date
    const today = new Date();
    const localDate =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");
    this.filters.date = localDate;

    const dateInput = document.getElementById("sales-date-filter");
    if (dateInput) {
      dateInput.value = localDate;
      dateInput.onchange = (e) => {
        this.filters.date = e.target.value;
        this.resetAndReload();
        this.loadStats();
      };
    }

    // 🔥 LOAD WEEKLY TOTAL (Instead of Lifetime)
    this.weeklySalesTotal = await SalesService.getWeeklyTotalSales();

    this.loadData(true);
    this.loadStats();
    this.loadStaff();

    if (window.SalesUI) window.SalesUI.injectStockCheckbox();
    this.setupEventListeners();
  },

  switchTab: function (tabName) {
    this.currentTab = tabName;
    if (window.SalesUI) window.SalesUI.toggleTab(tabName);
    if (tabName === "sales" && this.salesList.length === 0) this.loadData();
    if (tabName === "purchase" && this.purchaseList.length === 0)
      this.loadData();
  },

  loadData: async function (isInitial = false) {
    if (this.isLoading) return;
    if (this.currentTab === "sales" && !this.salesHasMore) return;
    if (this.currentTab === "purchase" && !this.purchaseHasMore) return;

    this.isLoading = true;
    if (window.SalesUI) {
      if (isInitial) window.SalesUI.showMainLoader();
      else window.SalesUI.showScrollLoader(true);
    }

    try {
      let snapshot;
      let newDocs = [];

      if (this.currentTab === "sales") {
        snapshot = await SalesService.getSales(
          this.salesLastDoc,
          10,
          this.filters,
        );
        if (!snapshot || snapshot.empty) {
          this.salesHasMore = false;
        } else {
          this.salesLastDoc = snapshot.docs[snapshot.docs.length - 1];
          newDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          // 🔥 Client Side Search Filter
          if (this.filters.search) {
            const term = this.filters.search.toLowerCase();
            newDocs = newDocs.filter(
              (item) =>
                item.shopName && item.shopName.toLowerCase().includes(term),
            );
          }

          this.salesList = [...this.salesList, ...newDocs];
        }
        if (window.SalesUI) window.SalesUI.renderSalesTable(this.salesList);
      } else {
        snapshot = await SalesService.getPurchases(
          this.purchaseLastDoc,
          10,
          this.filters,
        );
        if (!snapshot || snapshot.empty) {
          this.purchaseHasMore = false;
        } else {
          this.purchaseLastDoc = snapshot.docs[snapshot.docs.length - 1];
          newDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          // 🔥 Search Filter for Purchase
          if (this.filters.search) {
            const term = this.filters.search.toLowerCase();
            newDocs = newDocs.filter(
              (item) =>
                item.itemName && item.itemName.toLowerCase().includes(term),
            );
          }

          this.purchaseList = [...this.purchaseList, ...newDocs];
        }
        if (window.SalesUI)
          window.SalesUI.renderPurchaseTable(this.purchaseList);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      this.isLoading = false;
      if (window.SalesUI) {
        window.SalesUI.hideMainLoader();
        window.SalesUI.showScrollLoader(false);
      }
    }
  },

  resetAndReload: function () {
    if (this.currentTab === "sales") {
      this.salesList = [];
      this.salesLastDoc = null;
      this.salesHasMore = true;
    } else {
      this.purchaseList = [];
      this.purchaseLastDoc = null;
      this.purchaseHasMore = true;
    }
    this.loadData(false);
  },

  loadStats: async function () {
    const stats = await SalesService.getStats(this.filters.date);
    if (window.SalesUI) {
      window.SalesUI.updateStats({
        ...stats,
        stockInPackets: stats.stockInPackets || 0,
        // 🔥 Pass Weekly Total
        weeklySalesTotal: this.weeklySalesTotal,
      });
    }
  },

  loadStaff: async function () {
    const staffList = await SalesService.getDeliveryStaff();
    if (window.SalesUI) window.SalesUI.populateStaffFilter(staffList);
  },

  // --- Packet Logic ---
  togglePacketField: function () {
    const type = document.getElementById("p-unit-type").value;
    const group = document.getElementById("packet-size-group");
    if (type === "packet") {
      group.style.display = "block";
      document.getElementById("p-packet-size").value = "";
    } else {
      group.style.display = "none";
      document.getElementById("p-packet-size").value = "1";
    }
    this.calculateTotals();
  },

  getFinalStockQty: function () {
    const qty = Number(document.getElementById("p-qty").value) || 0;
    const type = document.getElementById("p-unit-type").value;
    const packetSize =
      type === "packet"
        ? Number(document.getElementById("p-packet-size").value) || 1
        : 1;
    return qty * packetSize;
  },

  calculateTotals: function () {
    const finalQty = this.getFinalStockQty();
    document.getElementById("p-final-stock-display").innerText =
      finalQty + " Units";
    this.calculateFromTotal();
  },

  calculateFromTotal: function () {
    const total = Number(document.getElementById("p-cost").value) || 0;
    const finalQty = this.getFinalStockQty();
    if (finalQty > 0)
      document.getElementById("p-price-unit").value = (
        total / finalQty
      ).toFixed(2);
  },

  calculateFromUnit: function () {
    const unitPrice =
      Number(document.getElementById("p-price-unit").value) || 0;
    const finalQty = this.getFinalStockQty();
    if (finalQty > 0)
      document.getElementById("p-cost").value = (unitPrice * finalQty).toFixed(
        0,
      );
  },

  openEditPurchase: function (
    id,
    name,
    supplier,
    cost,
    qty,
    status,
    category,
    unitDetail,
  ) {
    document.getElementById("purchase-modal").classList.add("active");

    document.getElementById("p-id").value = id;
    document.getElementById("p-name").value = name;
    document.getElementById("p-supplier").value = supplier;
    document.getElementById("p-cost").value = cost;
    document.getElementById("p-qty").value = qty;
    document.getElementById("p-status").value = status;
    document.getElementById("p-category").value = category;

    document.getElementById("p-unit-type").value = "piece";
    this.togglePacketField();
    document.getElementById("p-final-stock-display").innerText = qty + " Units";
  },

  // 🔥 UPDATED: Smart Stock Update on Edit
  handleSavePurchase: async function (e) {
    e.preventDefault();
    const btn = document.querySelector("#add-purchase-form .save-btn");
    const id = document.getElementById("p-id").value;

    const cost = Number(document.getElementById("p-cost").value);
    const purchaseQty = Number(document.getElementById("p-qty").value);
    const unitType = document.getElementById("p-unit-type").value;
    const packetSize =
      Number(document.getElementById("p-packet-size").value) || 1;
    const finalStockQty = this.getFinalStockQty(); // Total Units (New)
    const unitPrice =
      Number(document.getElementById("p-price-unit").value) || 0;

    if (cost < 0 || purchaseQty <= 0) {
      alert("⚠️ Invalid Values!");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Saving...";

    let descQty = `${purchaseQty} ${unitType === "packet" ? "Packets" : "Pieces"}`;
    if (unitType === "packet") descQty += ` (${packetSize}/pkt)`;

    const purchaseData = {
      itemName: document.getElementById("p-name").value,
      supplier: document.getElementById("p-supplier").value,
      category: document.getElementById("p-category").value,
      cost: cost,
      quantity: purchaseQty,
      totalUnits: finalStockQty,
      packetSize: packetSize,
      unitType: unitType,
      unitDetail: descQty,
      status: document.getElementById("p-status").value,
    };

    try {
      if (id) {
        // --- CASE 1: EDIT EXISTING PURCHASE ---

        // 1. Purana Data Dhundo (List se)
        const oldItem = this.purchaseList.find((i) => i.id === id);

        // 2. Pehle Purchase Update Karo
        await SalesService.updatePurchase(id, purchaseData);

        // 3. Stock Adjustment Logic
        if (oldItem && window.StockService) {
          // Purani Quantity nikalo
          const oldQty =
            Number(oldItem.totalUnits) || Number(oldItem.quantity) || 0;
          const newQty = finalStockQty;
          const difference = newQty - oldQty; // e.g. 50 - 40 = +10 (Add) OR 40 - 50 = -10 (Subtract)

          // Agar Quantity change hui hai, toh Stock update karo
          if (difference !== 0) {
            await StockService.addOrUpdateStock({
              name: purchaseData.itemName,
              category: purchaseData.category,
              qty: difference, // 🔥 Firebase automatically handles +ve/-ve
              price: unitPrice,
              packetSize: packetSize,
            });
            console.log(`Stock Adjusted by: ${difference} units`);
          }
        }
        alert("✅ Purchase & Stock Updated!");
      } else {
        // --- CASE 2: NEW PURCHASE (Old Logic) ---
        await SalesService.addPurchase(purchaseData);

        const chk = document.getElementById("chk-add-stock");
        if (chk && chk.checked && window.StockService) {
          await StockService.addOrUpdateStock({
            name: purchaseData.itemName,
            category: purchaseData.category,
            qty: finalStockQty,
            price: unitPrice,
            packetSize: packetSize,
          });
        }
        alert("✅ Purchase Added!");
      }

      document.getElementById("purchase-modal").classList.remove("active");
      document.getElementById("add-purchase-form").reset();
      this.currentTab = "purchase";
      this.resetAndReload();
      this.loadStats();
    } catch (e) {
      alert(e.message);
    } finally {
      btn.disabled = false;
      btn.innerText = "Save Entry";
    }
  },

  handleSearch: function (val) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.filters.search = val;
      this.resetAndReload();
    }, 600);
  },

  setupEventListeners: function () {
    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      )
        this.loadData();
    });

    const bindClick = (id, func) => {
      const el = document.getElementById(id);
      if (el) el.onclick = func;
    };

    bindClick("btn-show-sales", () => this.switchTab("sales"));
    bindClick("btn-show-purchase", () => this.switchTab("purchase"));

    const dateInput = document.getElementById("sales-date-filter");
    if (dateInput) {
      dateInput.onchange = (e) => {
        this.filters.date = e.target.value;
        this.resetAndReload();
        this.loadStats();
      };
    }

    const searchInput = document.getElementById("sales-search");
    if (searchInput)
      searchInput.oninput = (e) => this.handleSearch(e.target.value);

    const boyFilter = document.getElementById("filter-boy");
    if (boyFilter)
      boyFilter.onchange = (e) => {
        this.filters.boy = e.target.value;
        this.resetAndReload();
      };

    const payFilter = document.getElementById("filter-payment");
    if (payFilter)
      payFilter.onchange = (e) => {
        this.filters.payment = e.target.value;
        this.resetAndReload();
      };

    bindClick("btn-add-purchase", () => {
      document.getElementById("p-id").value = "";
      document.getElementById("add-purchase-form").reset();
      document.getElementById("purchase-modal").classList.add("active");
      this.togglePacketField();
    });
    bindClick("close-purchase-modal", () =>
      document.getElementById("purchase-modal").classList.remove("active"),
    );

    const form = document.getElementById("add-purchase-form");
    if (form) form.onsubmit = (e) => this.handleSavePurchase(e);
  },
};
