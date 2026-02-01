window.CreditController = {
  currentList: [],
  lastDoc: null,
  PAGE_SIZE: 10,
  isLoading: false,
  hasMoreData: true,

  // State
  currentView: "date",
  currentDate: "",
  currentSearch: "",
  currentSort: "high",

  // 🔥 Local Variable for Optimization
  totalMarket: 0,

  searchTimer: null,

  init: async function () {
    console.log("💳 CreditController: Optimized One-Time Load 🚀");
    if (window.CreditUI) window.CreditUI.showMainLoader();

    const today = new Date().toISOString().split("T")[0];
    this.currentDate = today;

    const dateInput = document.getElementById("filter-date");
    if (dateInput) dateInput.value = today;

    // 🔥 1. Fetch Total Market Credit (SIRF EK BAAR)
    this.totalMarket = await CreditService.getTotalMarketCredit();

    // 2. Load Baki Data
    this.resetAndLoad("date", true);
    this.loadStats();
    this.setupEventListeners();
  },

  resetAndLoad: async function (viewMode, isInitial = false) {
    this.currentView = viewMode || this.currentView;
    this.currentList = [];
    this.lastDoc = null;
    this.hasMoreData = true;
    this.isLoading = false;

    if (window.CreditUI) {
      if (isInitial) window.CreditUI.showMainLoader();
      else window.CreditUI.showTableLoader();
      window.CreditUI.updateFilterButtons(this.currentView);
    }

    await this.fetchNextBatch();
    if (window.CreditUI) window.CreditUI.hideMainLoader();
  },

  fetchNextBatch: async function () {
    if (this.isLoading || !this.hasMoreData) return;
    this.isLoading = true;
    if (window.CreditUI && this.currentList.length > 0)
      window.CreditUI.showScrollLoader(true);

    try {
      const snapshot = await CreditService.getShops(
        this.currentView,
        this.lastDoc,
        this.PAGE_SIZE,
        this.currentSearch,
        this.currentSort,
        this.currentDate,
      );

      if (snapshot.empty) {
        this.hasMoreData = false;
        if (window.CreditUI) window.CreditUI.showScrollLoader(false);
        if (this.currentList.length === 0 && window.CreditUI)
          window.CreditUI.renderTable([], this.currentView, this.currentDate);
        return;
      }

      this.lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const newItems = [];
      snapshot.forEach((doc) => {
        if (!this.currentList.find((i) => i.id === doc.id))
          newItems.push({ id: doc.id, ...doc.data() });
      });
      this.currentList = [...this.currentList, ...newItems];
      if (window.CreditUI)
        window.CreditUI.renderTable(
          this.currentList,
          this.currentView,
          this.currentDate,
        );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.isLoading = false;
      if (window.CreditUI) {
        window.CreditUI.hideMainLoader();
        window.CreditUI.showScrollLoader(false);
      }
    }
  },

  // 🔥 3. Combine Local Total + New Stats
  loadStats: async function () {
    const stats = await CreditService.getStats(this.currentDate);
    const fullStats = {
      totalMarket: this.totalMarket, // Local variable use karo
      todayNet: stats.todayNet,
      weekNet: stats.weekNet,
    };
    if (window.CreditUI) window.CreditUI.updateStats(fullStats);
  },

  handleDateChange: function (val) {
    this.currentDate = val;
    this.currentSearch = "";
    document.getElementById("credit-search").value = "";
    this.resetAndLoad("date", false);
    this.loadStats(); // Date badalne par sirf Today/Week stats fetch honge, Total nahi
  },

  handleSearch: function (val) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.currentSearch = val;
      this.resetAndLoad(this.currentView, false);
    }, 600);
  },

  handleSort: function (val) {
    this.currentSort = val;
    this.resetAndLoad(this.currentView, false);
  },

  handleUpdate: async function (e) {
    e.preventDefault();
    const btn = document.querySelector("#update-credit-form .save-btn");
    btn.disabled = true;
    btn.innerText = "Processing...";

    const shopId = document.getElementById("credit-modal").dataset.id;
    // 🔥 DATASET SE PURANA CREDIT NIKALO (Calculation ke liye)
    const oldCredit =
      Number(document.getElementById("credit-modal").dataset.current) || 0;

    const amount = Number(document.getElementById("modal-amount").value);
    const note = document.querySelector(
      "#update-credit-form input[placeholder='E.g. Paid via PhonePe']",
    ).value;
    const action = document.querySelector('input[name="action"]:checked').value;
    const type = action === "add" ? "GIVEN" : "RECEIVED";

    try {
      await CreditService.updateCredit(shopId, amount, type, note);

      // 🔥 SMART LOCAL UPDATE LOGIC (Database call bachane ke liye) 🔥
      const change = type === "GIVEN" ? amount : -amount;
      const newCredit = oldCredit + change;

      // Logic: Purana udhaar total se hatao (agar wo positive tha)
      if (oldCredit > 0) this.totalMarket -= oldCredit;
      // Naya udhaar total mein jodo (agar wo positive hai)
      if (newCredit > 0) this.totalMarket += newCredit;

      alert("✅ Transaction Saved!");
      document.getElementById("credit-modal").classList.remove("active");
      document.getElementById("update-credit-form").reset();

      this.resetAndLoad(this.currentView, false);
      this.loadStats(); // UI update karo (Local Total ke saath)
    } catch (e) {
      alert(e.message);
    } finally {
      btn.disabled = false;
      btn.innerText = "Update Balance";
    }
  },

  handleAddNewShop: async function (e) {
    e.preventDefault();
    const btn = document.querySelector("#add-shop-form .save-btn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    const currentCredit = Number(
      document.getElementById("new-shop-credit").value,
    );
    const data = {
      shopName: document.getElementById("new-shop-name").value,
      ownerName: document.getElementById("new-shop-owner").value || "Unknown",
      mobile: document.getElementById("new-shop-mobile").value,
      address: document.getElementById("new-shop-address").value,
      currentCredit: currentCredit,
    };

    try {
      await CreditService.addNewShopWithCredit(data);

      // 🔥 Local Update: Agar naya udhaar hai, toh total me jod do
      if (currentCredit > 0) {
        this.totalMarket += currentCredit;
      }

      alert("✅ Shop Added!");
      document.getElementById("add-shop-modal").classList.remove("active");
      document.getElementById("add-shop-form").reset();

      this.resetAndLoad(this.currentView, false);
      this.loadStats();
    } catch (e) {
      alert(e.message);
    } finally {
      btn.disabled = false;
      btn.innerText = "Add Shop";
    }
  },

  openModal: function (id, name, credit) {
    document.getElementById("credit-modal").dataset.id = id;
    // 🔥 Purana Credit Store Karo (Update logic ke liye zaroori hai)
    document.getElementById("credit-modal").dataset.current = credit;

    document.getElementById("modal-shop-name").value = name;
    document.getElementById("modal-current-credit").value =
      "₹" + (credit || 0).toLocaleString();
    document.getElementById("modal-amount").value = "";
    document.getElementById("credit-modal").classList.add("active");
  },

  setupEventListeners: function () {
    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      )
        this.fetchNextBatch();
    });

    const dateInput = document.getElementById("filter-date");
    if (dateInput)
      dateInput.onchange = (e) => this.handleDateChange(e.target.value);

    document.getElementById("filter-pending").onclick = () => {
      this.currentSearch = "";
      document.getElementById("credit-search").value = "";
      this.resetAndLoad("pending");
    };

    document.getElementById("credit-search").oninput = (e) =>
      this.handleSearch(e.target.value);
    const sortDropdown = document.getElementById("sort-credit");
    if (sortDropdown)
      sortDropdown.onchange = (e) => this.handleSort(e.target.value);

    document.getElementById("update-credit-form").onsubmit = (e) =>
      this.handleUpdate(e);
    document.getElementById("add-shop-form").onsubmit = (e) =>
      this.handleAddNewShop(e);

    document.getElementById("close-credit-modal").onclick = () =>
      document.getElementById("credit-modal").classList.remove("active");
    document.getElementById("close-add-shop-modal").onclick = () =>
      document.getElementById("add-shop-modal").classList.remove("active");
    document.getElementById("btn-add-shop-credit").onclick = () =>
      document.getElementById("add-shop-modal").classList.add("active");
  },
};
