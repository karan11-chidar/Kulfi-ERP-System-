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
    date: new Date().toISOString().split("T")[0],
    search: "",
    boy: "all",
    payment: "all",
  },
  lifeTimeSales: 0,
  searchTimer: null,

  init: async function () {
    console.log("📊 SalesController: Ready 🚀");
    if (window.SalesUI) window.SalesUI.showMainLoader();

    const dateInput = document.querySelector(".filter-date");
    if (dateInput) dateInput.value = this.filters.date;

    this.loadData(true);
    this.loadStats();
    this.loadStaff();

    if (window.SalesUI) window.SalesUI.injectStockCheckbox();
    this.setupEventListeners();
  },

  // ... (SwitchTab, LoadData, ResetReload, LoadStats, LoadStaff - NO CHANGE) ...
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
      if (this.currentTab === "sales") {
        snapshot = await SalesService.getSales(
          this.salesLastDoc,
          10,
          this.filters,
        );
        if (snapshot.empty) {
          this.salesHasMore = false;
          if (this.salesList.length === 0 && window.SalesUI)
            window.SalesUI.renderSalesTable([]);
        } else {
          this.salesLastDoc = snapshot.docs[snapshot.docs.length - 1];
          const newItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          this.salesList = [...this.salesList, ...newItems];
          if (window.SalesUI) window.SalesUI.renderSalesTable(this.salesList);
        }
      } else {
        snapshot = await SalesService.getPurchases(
          this.purchaseLastDoc,
          10,
          this.filters,
        );
        if (snapshot.empty) {
          this.purchaseHasMore = false;
          if (this.purchaseList.length === 0 && window.SalesUI)
            window.SalesUI.renderPurchaseTable([]);
        } else {
          this.purchaseLastDoc = snapshot.docs[snapshot.docs.length - 1];
          const newItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          this.purchaseList = [...this.purchaseList, ...newItems];
          if (window.SalesUI)
            window.SalesUI.renderPurchaseTable(this.purchaseList);
        }
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
    // 1. Backend se Basic Stats Lao
    const stats = await SalesService.getStats(this.filters.date);

    // 2. 🔥 NEW LOGIC: Calculate Stock In Packets Manually from current list
    // (Yeh accurate tabhi hoga jab saara data load ho, lekin abhi ke liye working fix hai)
    let stockInPackets = 0;
    let stockInUnits = 0;

    // Agar purchase list khali hai toh fetch karo (Optional safety)
    if (this.purchaseList.length === 0) {
      // Sirf stats calculation ke liye quick fetch (Optimized)
      const snap = await SalesService.getPurchases(null, 50, this.filters);
      snap.forEach((doc) => {
        const p = doc.data();
        const qty = Number(p.totalUnits || p.quantity) || 0;
        const size = Number(p.packetSize) || 1;
        stockInUnits += qty;
        stockInPackets += Math.floor(qty / size);
      });
    } else {
      // Existing list se calculate karo
      this.purchaseList.forEach((p) => {
        const qty = Number(p.totalUnits || p.quantity) || 0;
        const size = Number(p.packetSize) || 1;
        stockInUnits += qty;
        stockInPackets += Math.floor(qty / size);
      });
    }

    // 3. UI Update (Pass Packets)
    if (window.SalesUI)
      window.SalesUI.updateStats({
        ...stats,
        stockInCount: stockInUnits, // Purana wala override
        stockInPackets: stockInPackets, // 🔥 Naya Data
        lifeTimeSales: this.lifeTimeSales,
      });
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

  // 🔥 UPDATED: Saving Logic with Packet Size
  handleSavePurchase: async function (e) {
    e.preventDefault();
    const btn = document.querySelector("#add-purchase-form .save-btn");
    const id = document.getElementById("p-id").value;

    const cost = Number(document.getElementById("p-cost").value);
    const purchaseQty = Number(document.getElementById("p-qty").value);
    const unitType = document.getElementById("p-unit-type").value;
    const packetSize =
      Number(document.getElementById("p-packet-size").value) || 1;

    // Total Units Calculation
    const finalStockQty = this.getFinalStockQty();
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
        // UPDATE PURCHASE
        await SalesService.updatePurchase(id, purchaseData);
        alert("✅ Purchase Updated!");
      } else {
        // ADD NEW PURCHASE
        await SalesService.addPurchase(purchaseData);

        // 🔥 SYNC STOCK (Corrected: Added packetSize)
        const addToStock = document.getElementById("chk-add-stock")?.checked;
        if (addToStock && window.StockService) {
          await StockService.addOrUpdateStock({
            name: purchaseData.itemName,
            category: purchaseData.category,
            qty: finalStockQty, // Total Units
            price: unitPrice, // Per Unit Price
            packetSize: packetSize, // 🔥 Yeh bhej diya taaki Stock Page par bhi Packet ka hisaab dikhe
          });
        }
        alert("✅ Purchase Added & Stock Updated!");
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

    document.getElementById("btn-show-sales").onclick = () =>
      this.switchTab("sales");
    document.getElementById("btn-show-purchase").onclick = () =>
      this.switchTab("purchase");

    document.querySelector(".filter-date").onchange = (e) => {
      this.filters.date = e.target.value;
      this.resetAndReload();
      this.loadStats();
    };

    document.getElementById("sales-search").oninput = (e) =>
      this.handleSearch(e.target.value);

    document.getElementById("btn-add-purchase").onclick = () => {
      document.getElementById("p-id").value = "";
      document.getElementById("add-purchase-form").reset();
      document.getElementById("purchase-modal").classList.add("active");
      this.togglePacketField();
    };
    document.getElementById("close-purchase-modal").onclick = () =>
      document.getElementById("purchase-modal").classList.remove("active");

    document.getElementById("add-purchase-form").onsubmit = (e) =>
      this.handleSavePurchase(e);
  },
};
