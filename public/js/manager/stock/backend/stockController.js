window.StockController = {
  products: [],
  currentViewData: [],
  boysStockStats: { totalUnits: 0, totalPackets: 0 },
  damageStats: { totalPkt: 0, totalPcs: 0 },
  isLoading: false,
  filter: { search: "", category: "all", boy: "all" },

  init: async function () {
    if (window.StockUI) window.StockUI.showMainLoader();
    try {
      await this.loadStock();
      await this.loadDropdowns();
      this.boysStockStats = await StockService.getAllBoysStock();
      this.damageStats = await StockService.getDamageStats();
      this.updateStats();
    } catch (e) {
      console.error(e);
    } finally {
      if (window.StockUI) window.StockUI.hideMainLoader();
    }
    this.setupEventListeners();
  },

  // 🔥 NEW HELPER: Boy Stock me Price/Category bharna
  enrichBoyData: function (boyItems) {
    return boyItems.map((item) => {
      // Main Product List se match karo
      const mainProd = this.products.find((p) => p.name === item.name);
      return {
        ...item,
        // Agar match mila toh wahi Category/Price lo, nahi toh purana rakho
        category: mainProd ? mainProd.category : item.category,
        price: mainProd ? mainProd.price : 0,
      };
    });
  },

  loadStock: async function () {
    this.isLoading = true;
    if (window.StockUI) window.StockUI.renderLoading();
    try {
      // 1. Pehle Godown ka data lao (Master Data)
      this.products = await StockService.getGodownStock();
      this.boysStockStats = await StockService.getAllBoysStock();
      this.damageStats = await StockService.getDamageStats();

      // 2. Ab View decide karo
      if (this.filter.boy === "all") {
        this.currentViewData = this.products;
      } else {
        const rawBoyStock = await StockService.getBoyStock(this.filter.boy);
        // 🔥 MERGE LOGIC APPLIED HERE
        this.currentViewData = this.enrichBoyData(rawBoyStock);
      }
      this.applyFilters();
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  },

  handleViewChange: async function (boyName) {
    this.filter.boy = boyName;
    if (window.StockUI) window.StockUI.renderLoading();

    if (boyName === "all") {
      this.currentViewData = this.products;
    } else {
      try {
        const rawBoyStock = await StockService.getBoyStock(boyName);
        // 🔥 MERGE LOGIC APPLIED HERE TOO
        this.currentViewData = this.enrichBoyData(rawBoyStock);
      } catch (e) {
        console.error(e);
        this.currentViewData = [];
      }
    }
    this.applyFilters();
  },

  // ... (Baaki saare functions SAME rahenge - No Change needed below) ...

  updateStats: function (godownData = this.products) {
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
        this.boysStockStats,
        outOfStock,
        this.damageStats,
      );
  },

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

  loadDropdowns: async function () {
    const boys = await StockService.getDeliveryBoys();
    if (window.StockUI) window.StockUI.populateDropdowns(boys, this.products);
  },

  calculateTotal: function (productName, packets, pieces) {
    const product = this.products.find((p) => p.name === productName);
    const packetSize = product ? Number(product.packetSize) || 1 : 1;
    return (Number(packets) || 0) * packetSize + (Number(pieces) || 0);
  },

  handleReturnBoyChange: async function () {
    const boyName = document.getElementById("return-boy-select").value;
    const productSelect = document.getElementById("return-product-select");
    const priceInput = document.getElementById("return-price");

    productSelect.innerHTML = '<option value="">Loading...</option>';
    priceInput.value = "";

    if (!boyName) {
      productSelect.innerHTML =
        '<option value="">-- Select Boy First --</option>';
      return;
    }

    const items = await StockService.getBoyStock(boyName);

    productSelect.innerHTML = '<option value="">-- Select Product --</option>';

    if (items.length === 0) {
      productSelect.innerHTML += "<option disabled>No stock found</option>";
    } else {
      items.forEach((item) => {
        let price = item.price;
        if (!price) {
          const mainProd = this.products.find((p) => p.name === item.name);
          price = mainProd ? mainProd.price : 0;
        }

        productSelect.innerHTML += `<option value="${item.name}" data-price="${price}">
            ${item.name} (Has: ${item.qty} units)
          </option>`;
      });
    }

    productSelect.onchange = function () {
      const selectedOption = this.options[this.selectedIndex];
      const price = selectedOption.getAttribute("data-price");
      document.getElementById("return-price").value = price
        ? "₹" + price
        : "₹0";
    };
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
      alert("⚠️ Quantity sahi se bharein (Packets ya Pieces)");
      return;
    }

    try {
      await StockService.assignStock(boy, product, totalQty, pktSize);
      alert(`✅ ${totalQty} Units Assigned to ${boy}!`);
      document.getElementById("assign-modal").classList.remove("active");
      document.getElementById("assign-form").reset();
      this.loadStock();
    } catch (e) {
      alert("❌ Error: " + e.message);
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
      alert("⚠️ Quantity sahi se bharein");
      return;
    }

    try {
      await StockService.returnStock(boy, product, totalQty);
      alert(`✅ ${totalQty} Units Returned to Godown!`);
      document.getElementById("return-modal").classList.remove("active");
      document.getElementById("return-form").reset();
      this.loadStock();
    } catch (e) {
      alert("❌ Error: " + e.message);
    }
  },

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
    if ((Number(packets) || 0) <= 0 && (Number(pieces) || 0) <= 0) {
      alert("⚠️ Quantity daalein");
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
      alert("✅ Damage Report Saved!");
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

  handleResetDamage: async function () {
    if (!confirm("Reset Damage Counter?")) return;
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
    document.getElementById("assign-product-select").onchange = (e) => {
      const prodName = e.target.value;
      const product = this.products.find((p) => p.name === prodName);
      if (product) {
        document.getElementById("assign-price").value = "₹" + product.price;
      } else {
        document.getElementById("assign-price").value = "";
      }
    };
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
