window.StockController = {
  products: [],
  boysStockTotal: 0,
  isLoading: false,
  filter: { search: "", category: "all" },

  init: async function () {
    console.log("📦 StockController: Initializing...");
    if (window.StockUI) window.StockUI.showMainLoader();
    try {
      await this.loadStock();
      await this.loadDropdowns();
      this.boysStockTotal = await StockService.getAllBoysStock();
      this.updateStats(); // Refresh stats with boy stock
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
      this.boysStockTotal = await StockService.getAllBoysStock(); // Refresh Boy Stock Count
      this.applyFilters();
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  },

  applyFilters: function () {
    let filtered = this.products;
    const term = this.filter.search.toLowerCase();
    if (term)
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
    if (this.filter.category !== "all")
      filtered = filtered.filter((p) => p.category === this.filter.category);
    if (window.StockUI) window.StockUI.renderTable(filtered);
    this.updateStats(filtered);
  },

  updateStats: function (filteredData = this.products) {
    let godownUnits = 0;
    let godownPackets = 0;
    let outOfStock = 0;

    // Godown Stock Calculation
    filteredData.forEach((p) => {
      const qty = Number(p.qty) || 0;
      const size = Number(p.packetSize) || 1;
      godownUnits += qty;
      godownPackets += Math.floor(qty / size);
      if (qty <= 0) outOfStock++;
    });

    // Render Stats (Godown + Boys)
    if (window.StockUI)
      window.StockUI.renderStats(
        godownUnits,
        godownPackets,
        this.boysStockTotal,
        outOfStock,
      );
  },

  // 🔥 CALCULATOR: Packets + Pieces -> Total Units
  calculateTotal: function (productName, packets, pieces) {
    const product = this.products.find((p) => p.name === productName);
    const packetSize = product ? Number(product.packetSize) || 1 : 1;
    return (Number(packets) || 0) * packetSize + (Number(pieces) || 0);
  },

  // 🔥 EVENT: When Return Boy is Changed
  handleReturnBoyChange: async function () {
    const boyName = document.getElementById("return-boy-select").value;
    const productSelect = document.getElementById("return-product-select");

    productSelect.innerHTML = '<option value="">Loading items...</option>';

    if (!boyName) {
      productSelect.innerHTML =
        '<option value="">-- Select Boy First --</option>';
      return;
    }

    // Fetch Items this boy has
    const items = await StockService.getBoyStock(boyName);

    productSelect.innerHTML = '<option value="">-- Select Product --</option>';
    if (items.length === 0) {
      productSelect.innerHTML +=
        "<option disabled>No stock found for this boy</option>";
    } else {
      items.forEach((item) => {
        productSelect.innerHTML += `<option value="${item.productName}">${item.productName} (Has: ${item.qty})</option>`;
      });
    }
  },

  // --- Handlers ---
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
      alert("Please enter quantity");
      return;
    }

    try {
      await StockService.assignStock(boy, product, totalQty, pktSize);
      alert(`✅ Assigned ${totalQty} units to ${boy}`);
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

    // Note: Return me packet size Godown ke hisab se hi calculate karenge standard
    const totalQty = this.calculateTotal(product, packets, pieces);

    if (!boy || !product || totalQty <= 0) {
      alert("Please enter quantity");
      return;
    }

    try {
      await StockService.returnStock(boy, product, totalQty);
      alert(`✅ Returned ${totalQty} units from ${boy}`);
      document.getElementById("return-modal").classList.remove("active");
      document.getElementById("return-form").reset();
      this.loadStock();
    } catch (e) {
      alert(e.message);
    }
  },

  // Damage, Delete, Edit, LoadDropdowns same as before...
  handleDamage: async function (e) {
    e.preventDefault();
    const product = document.getElementById("damage-product-select").value;
    const packets = document.getElementById("damage-packets").value;
    const pieces = document.getElementById("damage-pieces").value;
    const reason = document.getElementById("damage-reason").value;
    const totalQty = this.calculateTotal(product, packets, pieces);
    if (!product || totalQty <= 0) {
      alert("Check Qty");
      return;
    }
    try {
      await StockService.reportDamage(product, totalQty, reason);
      alert("Reported!");
      document.getElementById("damage-modal").classList.remove("active");
      document.getElementById("damage-form").reset();
      this.loadStock();
    } catch (e) {
      alert(e.message);
    }
  },
  handleDelete: async function (id) {
    if (!confirm("Delete?")) return;
    await StockService.deleteProduct(id);
    this.loadStock();
  },
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
      alert("Updated!");
      document.getElementById("edit-stock-modal").classList.remove("active");
      this.loadStock();
    } catch (e) {
      alert(e.message);
    } finally {
      if (window.StockUI) window.StockUI.hideMainLoader();
    }
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
  loadDropdowns: async function () {
    const boys = await StockService.getDeliveryBoys();
    const productNames = this.products.map((p) => p.name);
    if (window.StockUI) window.StockUI.populateDropdowns(boys, productNames);
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

    // 🔥 Return Boy Dropdown Listener
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
  },
};
