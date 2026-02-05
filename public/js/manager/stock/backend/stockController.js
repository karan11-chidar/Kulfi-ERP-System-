window.StockController = {
  products: [],
  currentViewData: [],
  boysStockTotal: 0,
  damageStats: { totalPkt: 0, totalPcs: 0 },
  isLoading: false,
  filter: { search: "", category: "all", boy: "all" },

  init: async function () {
    console.log("📦 StockController: Initializing...");
    if (window.StockUI) window.StockUI.showMainLoader();
    try {
      await this.loadStock();
      await this.loadDropdowns();
      this.boysStockTotal = await StockService.getAllBoysStock();
      this.damageStats = await StockService.getDamageStats();
      this.updateStats();
    } catch (e) {
      console.error(e);
    } finally {
      if (window.StockUI) window.StockUI.hideMainLoader();
    }
    this.setupEventListeners();
  },

  loadStock: async function () {
    this.isLoading = true;
    if (window.StockUI) window.StockUI.renderLoading();
    try {
      this.products = await StockService.getGodownStock();
      this.boysStockTotal = await StockService.getAllBoysStock();
      this.damageStats = await StockService.getDamageStats();

      if (this.filter.boy === "all") {
        this.currentViewData = this.products;
      } else {
        this.currentViewData = await StockService.getBoyStock(this.filter.boy);
      }
      this.applyFilters();
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  },

  // 🔥 DAMAGE HANDLER (Pure Manual Entry)
  handleDamage: async function (e) {
    e.preventDefault();
    const category = document.getElementById("damage-category").value;
    const nameInput = document
      .getElementById("damage-product-name")
      .value.trim();
    const packets = document.getElementById("damage-packets").value;
    const pieces = document.getElementById("damage-pieces").value;
    const reason = document.getElementById("damage-reason").value;

    if (!category || !nameInput) {
      alert("Category aur Name zaroori hai!");
      return;
    }

    // Validation: Kam se kam ek cheez toh ho
    if ((Number(packets) || 0) <= 0 && (Number(pieces) || 0) <= 0) {
      alert("Enter Packet or Piece Quantity");
      return;
    }

    try {
      await StockService.reportDamage({
        productName: nameInput,
        category,
        packets: Number(packets) || 0,
        pieces: Number(pieces) || 0,
        reason,
      });
      alert("✅ Damage Entry Recorded!");
      document.getElementById("damage-modal").classList.remove("active");
      document.getElementById("damage-form").reset();
      this.loadStock(); // Refresh Stats
    } catch (e) {
      alert(e.message);
    }
  },

  // 🔥 EDIT HANDLER (Fixing Update)
  handleEditSave: async function (e) {
    e.preventDefault();
    const id = document.getElementById("edit-id").value;
    const data = {
      name: document.getElementById("edit-name").value,
      category: document.getElementById("edit-category").value,
      qty: Number(document.getElementById("edit-qty").value),
      price: Number(document.getElementById("edit-price").value),
      packetSize: Number(document.getElementById("edit-packet-size").value),
    };
    try {
      if (window.StockUI) window.StockUI.showMainLoader();
      await StockService.updateProduct(id, data);
      alert("✅ Product Updated!");
      document.getElementById("edit-stock-modal").classList.remove("active");
      this.loadStock();
    } catch (e) {
      alert(e.message);
    } finally {
      if (window.StockUI) window.StockUI.hideMainLoader();
    }
  },

  // Other Handlers...
  handleResetDamage: async function () {
    if (!confirm("Reset Damage Counter? History will be deleted.")) return;
    try {
      if (window.StockUI) window.StockUI.showMainLoader();
      await StockService.clearDamageLogs();
      this.loadStock();
    } catch (e) {
      alert(e.message);
    } finally {
      if (window.StockUI) window.StockUI.hideMainLoader();
    }
  },
  openDamageHistory: async function () {
    const list = await StockService.getDamageLogs();
    if (window.StockUI) window.StockUI.renderDamageList(list);
    document.getElementById("damage-history-modal").classList.add("active");
  },
  deleteDamageEntry: async function (id) {
    if (!confirm("Delete entry?")) return;
    await StockService.deleteDamageLog(id);
    this.openDamageHistory();
    this.loadStock();
  },

  // Standard Assign/Return Logic
  calculateTotal: function (productName, packets, pieces) {
    const product = this.products.find((p) => p.name === productName);
    const packetSize = product ? Number(product.packetSize) || 1 : 1;
    return (Number(packets) || 0) * packetSize + (Number(pieces) || 0);
  },
  handleAssign: async function (e) {
    e.preventDefault();
    const boy = document.getElementById("assign-boy-select").value;
    const product = document.getElementById("assign-product-select").value;
    const packets = document.getElementById("assign-packets").value;
    const pieces = document.getElementById("assign-pieces").value;
    const totalQty = this.calculateTotal(product, packets, pieces);
    const prodObj = this.products.find((p) => p.name === product);
    const pktSize = prodObj ? prodObj.packetSize : 1;
    if (!boy || !product || totalQty <= 0) {
      alert("Check quantity");
      return;
    }
    try {
      await StockService.assignStock(boy, product, totalQty, pktSize);
      alert(`✅ Assigned!`);
      document.getElementById("assign-modal").classList.remove("active");
      document.getElementById("assign-form").reset();
      this.loadStock();
    } catch (e) {
      alert(e.message);
    }
  },
  handleReturn: async function (e) {
    e.preventDefault();
    const boy = document.getElementById("return-boy-select").value;
    const product = document.getElementById("return-product-select").value;
    const packets = document.getElementById("return-packets").value;
    const pieces = document.getElementById("return-pieces").value;
    const totalQty = this.calculateTotal(product, packets, pieces);
    if (!boy || !product || totalQty <= 0) {
      alert("Check quantity");
      return;
    }
    try {
      await StockService.returnStock(boy, product, totalQty);
      alert(`✅ Returned!`);
      document.getElementById("return-modal").classList.remove("active");
      document.getElementById("return-form").reset();
      this.loadStock();
    } catch (e) {
      alert(e.message);
    }
  },

  // ... (View, Filter, Dropdown Handlers same) ...
  applyFilters: function () {
    let filtered = this.currentViewData;
    const term = this.filter.search.toLowerCase();
    if (term)
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
    if (this.filter.category !== "all" && this.filter.boy === "all") {
      filtered = filtered.filter((p) => p.category === this.filter.category);
    }
    if (window.StockUI) window.StockUI.renderTable(filtered, this.filter.boy);
    this.updateStats(this.products);
  },
  handleViewChange: async function (boyName) {
    this.filter.boy = boyName;
    if (window.StockUI) window.StockUI.renderLoading();
    if (boyName === "all") {
      this.currentViewData = this.products;
    } else {
      try {
        this.currentViewData = await StockService.getBoyStock(boyName);
      } catch (e) {
        console.error(e);
        this.currentViewData = [];
      }
    }
    this.applyFilters();
  },
  loadDropdowns: async function () {
    const boys = await StockService.getDeliveryBoys();
    if (window.StockUI) window.StockUI.populateDropdowns(boys, this.products);
  },
  handleReturnBoyChange: async function () {
    const boyName = document.getElementById("return-boy-select").value;
    const productSelect = document.getElementById("return-product-select");
    productSelect.innerHTML = '<option value="">Loading...</option>';
    if (!boyName) {
      productSelect.innerHTML =
        '<option value="">-- Select Boy First --</option>';
      return;
    }
    const items = await StockService.getBoyStock(boyName);
    productSelect.innerHTML = '<option value="">-- Select Product --</option>';
    if (items.length === 0)
      productSelect.innerHTML += "<option disabled>No stock found</option>";
    else
      items.forEach(
        (item) =>
          (productSelect.innerHTML += `<option value="${item.name}">${item.name} (Has: ${item.qty})</option>`),
      );
  },
  handleDelete: async function (id) {
    if (!confirm("Delete?")) return;
    await StockService.deleteProduct(id);
    this.loadStock();
  },
  openEditStock: function (id, name, qty, price, category, packetSize) {
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-qty").value = qty;
    document.getElementById("edit-price").value = price;
    document.getElementById("edit-category").value = category;
    document.getElementById("edit-packet-size").value = packetSize || 1;
    document.getElementById("edit-stock-modal").classList.add("active");
  },
  updateStats: function (godownData) {
    let godownUnits = 0;
    let godownPackets = 0;
    let outOfStock = 0;
    godownData.forEach((p) => {
      const qty = Number(p.qty) || 0;
      const size = Number(p.packetSize) || 1;
      godownUnits += qty;
      godownPackets += Math.floor(qty / size);
      if (qty <= 0) outOfStock++;
    });
    if (window.StockUI)
      window.StockUI.renderStats(
        godownUnits,
        godownPackets,
        this.boysStockTotal,
        outOfStock,
        this.damageStats,
      );
  },

  setupEventListeners: function () {
    document.getElementById("stock-search").oninput = (e) => {
      this.filter.search = e.target.value;
      this.applyFilters();
    };
    document.getElementById("stock-category-filter").onchange = (e) => {
      this.filter.category = e.target.value;
      this.applyFilters();
    };
    document.getElementById("boy-stock-filter").onchange = (e) => {
      this.handleViewChange(e.target.value);
    };
    document.getElementById("return-boy-select").onchange = () =>
      this.handleReturnBoyChange();
    document.getElementById("assign-stock-btn").onclick = () =>
      document.getElementById("assign-modal").classList.add("active");
    document.getElementById("return-stock-btn").onclick = () =>
      document.getElementById("return-modal").classList.add("active");
    document.getElementById("damage-stock-btn").onclick = () =>
      document.getElementById("damage-modal").classList.add("active");
    document
      .querySelectorAll(".close-modal")
      .forEach(
        (b) =>
          (b.onclick = () =>
            document
              .querySelectorAll(".modal-overlay")
              .forEach((m) => m.classList.remove("active"))),
      );
    document.getElementById("assign-form").onsubmit = (e) =>
      this.handleAssign(e);
    document.getElementById("return-form").onsubmit = (e) =>
      this.handleReturn(e);
    document.getElementById("damage-form").onsubmit = (e) =>
      this.handleDamage(e);
    document.getElementById("edit-stock-form").onsubmit = (e) =>
      this.handleEditSave(e);
    document.getElementById("reset-damage-btn").onclick = (e) => {
      e.stopPropagation();
      this.handleResetDamage();
    };
    document.getElementById("damage-card-click").onclick = () =>
      this.openDamageHistory();
  },
};
