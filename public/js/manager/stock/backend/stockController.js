window.StockController = {
  products: [],
  isLoading: false,

  init: async function () {
    console.log("📦 StockController: Fully Loaded 🚀");

    if (window.StockUI) window.StockUI.showMainLoader();

    await this.loadStock();
    await this.loadDropdowns(); // 🔥 Boys aur Products dropdown me bharega

    if (window.StockUI) window.StockUI.hideMainLoader();

    this.setupEventListeners(); // 🔥 Buttons Zinda karega
  },

  loadStock: async function () {
    this.isLoading = true;
    if (window.StockUI) window.StockUI.renderLoading();
    try {
      this.products = await StockService.getGodownStock();
      if (window.StockUI) window.StockUI.renderTable(this.products);
      this.updateStats();
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  },

  loadDropdowns: async function () {
    // 1. Delivery Boys
    const boys = await StockService.getDeliveryBoys();
    // 2. Product Names (from current stock)
    const productNames = this.products.map((p) => p.name);

    if (window.StockUI) {
      window.StockUI.populateDropdowns(boys, productNames);
    }
  },

  updateStats: function () {
    let totalItems = 0;
    let outOfStock = 0;
    this.products.forEach((p) => {
      totalItems += Number(p.qty) || 0;
      if (p.qty <= 0) outOfStock++;
    });

    const totalEl = document.querySelector(".mini-card h4");
    if (totalEl) totalEl.innerText = totalItems + " Items";

    const outEl = document.querySelectorAll(".mini-card.danger h4")[0];
    if (outEl) outEl.innerText = outOfStock + " Items";
  },

  // --- HANDLERS ---

  handleAssign: async function (e) {
    e.preventDefault();
    const boy = document.getElementById("assign-boy-select").value;
    const product = document.getElementById("assign-product-select").value; // UI me ID deni padegi
    const qty = Number(document.getElementById("assign-qty").value);

    if (!boy || !product || qty <= 0) {
      alert("Please fill all fields!");
      return;
    }

    try {
      await StockService.assignStock(boy, product, qty);
      alert("✅ Stock Assigned!");
      document.getElementById("assign-modal").classList.remove("active");
      document.getElementById("assign-form").reset();
      this.loadStock(); // Refresh
    } catch (e) {
      alert(e.message);
    }
  },

  handleReturn: async function (e) {
    e.preventDefault();
    const boy = document.getElementById("return-boy-select").value;
    const product = document.getElementById("return-product-select").value;
    const qty = Number(document.getElementById("return-qty").value);

    if (!boy || !product || qty <= 0) {
      alert("Please fill all fields!");
      return;
    }

    try {
      await StockService.returnStock(boy, product, qty);
      alert("✅ Stock Returned!");
      document.getElementById("return-modal").classList.remove("active");
      document.getElementById("return-form").reset();
      this.loadStock();
    } catch (e) {
      alert(e.message);
    }
  },

  handleDamage: async function (e) {
    e.preventDefault();
    const product = document.getElementById("damage-product-select").value;
    const qty = Number(document.getElementById("damage-qty").value);
    const reason = document.getElementById("damage-reason").value;

    if (!product || qty <= 0) {
      alert("Invalid details!");
      return;
    }

    try {
      await StockService.reportDamage(product, qty, reason);
      alert("⚠️ Damage Reported!");
      document.getElementById("damage-modal").classList.remove("active");
      document.getElementById("damage-form").reset();
      this.loadStock();
    } catch (e) {
      alert(e.message);
    }
  },

  handleDelete: async function (id) {
    if (!confirm("Are you sure?")) return;
    await StockService.deleteProduct(id);
    this.loadStock();
  },

  // --- LISTENERS ---
  setupEventListeners: function () {
    const searchInput = document.getElementById("stock-search");
    if (searchInput) {
      searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = this.products.filter((p) =>
          p.name.toLowerCase().includes(term),
        );
        if (window.StockUI) window.StockUI.renderTable(filtered);
      };
    }

    // 🔥 BUTTONS CLICK (Open Modals)
    document.getElementById("assign-stock-btn").onclick = () =>
      document.getElementById("assign-modal").classList.add("active");
    document.getElementById("return-stock-btn").onclick = () =>
      document.getElementById("return-modal").classList.add("active");
    document.getElementById("damage-stock-btn").onclick = () =>
      document.getElementById("damage-modal").classList.add("active");

    // 🔥 CLOSE BUTTONS
    document.querySelectorAll(".close-modal").forEach((btn) => {
      btn.onclick = () => {
        document
          .querySelectorAll(".modal-overlay")
          .forEach((m) => m.classList.remove("active"));
      };
    });

    // 🔥 FORM SUBMITS
    document.getElementById("assign-form").onsubmit = (e) =>
      this.handleAssign(e);
    document.getElementById("return-form").onsubmit = (e) =>
      this.handleReturn(e);
    document.getElementById("damage-form").onsubmit = (e) =>
      this.handleDamage(e);
  },
};
