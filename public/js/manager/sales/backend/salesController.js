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

  // 🔥 Optimization State
  lifeTimeSales: 0,

  searchTimer: null,

  init: async function () {
    console.log("📊 SalesController: Optimized Total 🚀");
    if (window.SalesUI) window.SalesUI.showMainLoader();

    const dateInput = document.querySelector(".filter-date");
    if (dateInput) dateInput.value = this.filters.date;

    // 🔥 1. Fetch Life-Time Total (SIRF EK BAAR)
    this.lifeTimeSales = await SalesService.getLifeTimeTotalSales();

    // 2. Load Normal Data
    this.loadData(true);
    this.loadStats();
    this.loadStaff();
      this.setupEventListeners();
      // 🔥 Ye line add karo:
    if(window.SalesUI) window.SalesUI.injectStockCheckbox(); 
    
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

  // 🔥 STATS UPDATE: Use Local Total + DB Date Stats
  loadStats: async function () {
    const stats = await SalesService.getStats(this.filters.date);
    // Combine kar rahe hain
    const finalStats = {
      ...stats,
      lifeTimeSales: this.lifeTimeSales, // Local variable
    };
    if (window.SalesUI) window.SalesUI.updateStats(finalStats);
  },

  loadStaff: async function () {
    const staffList = await SalesService.getDeliveryStaff();
    if (window.SalesUI) window.SalesUI.populateStaffFilter(staffList);
  },

  handleSearch: function (val) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.filters.search = val;
      this.resetAndReload();
    }, 600);
  },

 // Is function ko replace karo:
  handleAddPurchase: async function (e) {
    e.preventDefault();
    const btn = document.querySelector("#add-purchase-form .save-btn");
    
    // 1. Data Collect karo
    const name = document.getElementById("p-name").value;
    const category = document.getElementById("p-category").value;
    const cost = Number(document.getElementById("p-cost").value);
    const qty = Number(document.getElementById("p-qty").value);
    const status = document.getElementById("p-status").value;

    // Checkbox Value (Naya Feature) 
    const addToStock = document.getElementById("chk-add-stock")?.checked;

    if (cost < 0 || qty < 0) { alert("⚠️ Negative values not allowed!"); return; }

    btn.disabled = true; btn.innerText = "Saving...";

    const purchaseData = {
      itemName: name,
      supplier: document.getElementById("p-supplier").value,
      category: category,
      cost: cost,
      quantity: qty,
      status: status,
    };

    try {
      // Step A: Purchase Entry Add karo (Sales Module)
      await SalesService.addPurchase(purchaseData);
      
      // Step B: Stock Update karo (Agar Checkbox Tick hai) 📦
      if (addToStock) {
          // StockService global available hona chahiye
          if(window.StockService) {
              await StockService.addOrUpdateStock({
                  name: name,
                  category: category,
                  qty: qty,
                  price: cost // Cost ko hi price maan rahe hain filhal
              });
              console.log("✅ Stock Updated Successfully!");
          } else {
              console.warn("StockService not found! Stock not updated.");
          }
      }

      alert("✅ Purchase Added" + (addToStock ? " & Stock Updated!" : "!"));
      
      document.getElementById("purchase-modal").classList.remove("active");
      document.getElementById("add-purchase-form").reset();
      
      this.currentTab = "purchase";
      this.resetAndReload();
      this.loadStats();

    } catch (e) { alert(e.message); } 
    finally { btn.disabled = false; btn.innerText = "Save Entry"; }
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

    // 🔥 Date Change: Reload List & Stats (But Total remains cached)
    document.querySelector(".filter-date").onchange = (e) => {
      this.filters.date = e.target.value;
      this.resetAndReload();
      this.loadStats();
    };

    document.getElementById("sales-search").oninput = (e) =>
      this.handleSearch(e.target.value);
    document.getElementById("filter-boy").onchange = (e) => {
      this.filters.boy = e.target.value;
      this.resetAndReload();
    };
    document.getElementById("filter-payment").onchange = (e) => {
      this.filters.payment = e.target.value;
      this.resetAndReload();
    };

    document.getElementById("btn-add-purchase").onclick = () =>
      document.getElementById("purchase-modal").classList.add("active");
    document.getElementById("close-purchase-modal").onclick = () =>
      document.getElementById("purchase-modal").classList.remove("active");
    document.getElementById("add-purchase-form").onsubmit = (e) =>
      this.handleAddPurchase(e);
  },
};
