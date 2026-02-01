window.ShopsController = {
  currentList: [],
  lastDoc: null,
  PAGE_SIZE: 10,
  isLoading: false,
  hasMoreData: true,

  // State Trackers
  currentSearch: "",
  currentStatus: "all",
  searchTimer: null,

  init: function () {
    console.log("🏪 ShopsController: Ready & Robust 🚀");

    // Page load hote hi full screen loader dikhao
    if (window.ShopsUI) window.ShopsUI.showMainLoader();

    // Initial Load (True = Full Loader)
    this.resetAndLoad(true);
    this.loadStats();
    this.setupEventListeners();
  },

  // --- 1. DATA LOADING LOGIC ---

  // Reset list and fetch fresh data
  resetAndLoad: async function (isInitial = false) {
    this.currentList = [];
    this.lastDoc = null;
    this.hasMoreData = true;
    this.isLoading = false;

    if (window.ShopsUI) {
      if (isInitial) {
        // Pehli baar: Full screen loader
        window.ShopsUI.showMainLoader();
      } else {
        // Filter/Search ke waqt: Sirf Table wala loader (Reload feel nahi aayegi)
        window.ShopsUI.showTableLoader();
      }
    }

    await this.fetchNextBatch();

    // Sab hone ke baad Main Loader hata do (Safety)
    if (window.ShopsUI) window.ShopsUI.hideMainLoader();
  },

  // Fetch 10 items from Server
  fetchNextBatch: async function () {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;
    // Scroll loader tabhi dikhao jab hum infinite scroll kar rahe hon
    if (window.ShopsUI && this.currentList.length > 0) {
      window.ShopsUI.showScrollLoader(true);
    }

    try {
      const filters = {
        search: this.currentSearch,
        status: this.currentStatus,
      };

      // Service call
      const snapshot = await ShopsService.getShops(
        this.lastDoc,
        this.PAGE_SIZE,
        filters,
      );

      // Agar data khatam ho gaya
      if (snapshot.empty) {
        this.hasMoreData = false;
        if (window.ShopsUI) window.ShopsUI.showScrollLoader(false);

        // Agar result bilkul khali hai (No Search Results)
        if (this.currentList.length === 0 && window.ShopsUI) {
          window.ShopsUI.renderTable([]);
        }
        return;
      }

      // Cursor update karo agle batch ke liye
      this.lastDoc = snapshot.docs[snapshot.docs.length - 1];

      const newItems = [];
      snapshot.forEach((doc) => {
        // Client side duplicate check
        if (!this.currentList.find((i) => i.id === doc.id)) {
          newItems.push({ id: doc.id, ...doc.data() });
        }
      });

      // Purane list me naya jod do
      this.currentList = [...this.currentList, ...newItems];

      // UI Update (Loader apne aap hat jayega jab table render hogi)
      if (window.ShopsUI) window.ShopsUI.renderTable(this.currentList);
    } catch (error) {
      console.error("🔥 Error Fetching Data:", error);

      // ✅ SAFETY FIX: Agar error aaye (jaise Index missing), toh user ko batao
      if (window.ShopsUI && this.currentList.length === 0) {
        window.ShopsUI.tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:20px; color:#c62828;">
                    <strong>Something went wrong!</strong><br>
                    <small>Check Console (F12) for 'Missing Index' link.</small>
                </td>
            </tr>`;
      }
    } finally {
      // ✅ LOADER FIX: Chahe Error aaye ya Success, Loading band honi chahiye
      this.isLoading = false;
      if (window.ShopsUI) {
        window.ShopsUI.hideMainLoader();
        window.ShopsUI.showScrollLoader(false);
      }
    }
  },

  loadStats: async function () {
    const stats = await ShopsService.getStats();
    if (window.ShopsUI) window.ShopsUI.updateStats(stats);
  },

  // --- 2. SEARCH & FILTER HANDLERS ---

  handleSearch: function (val) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.currentSearch = val;
      // false = Full screen loader mat dikhao
      this.resetAndLoad(false);
    }, 600);
  },

  handleFilter: function (val) {
    this.currentStatus = val;
    // false = Full screen loader mat dikhao
    this.resetAndLoad(false);
  },

  // --- 3. CRUD ACTIONS (Save, Delete, Edit) ---

  handleSaveShop: async function (e) {
    e.preventDefault();
    const btn = document.querySelector("#shop-form .save-btn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    const id = document.getElementById("shop-id").value;
    const data = {
      shopName: document.getElementById("shop-name").value,
      ownerName: document.getElementById("owner-name").value,
      mobile: document.getElementById("shop-mobile").value,
      status: document.getElementById("shop-status").value,
      address: document.getElementById("shop-address").value,
    };

    try {
      if (id) {
        await ShopsService.updateShop(id, data);
        alert("✅ Shop Updated!");
      } else {
        await ShopsService.addShop(data);
        alert("✅ Shop Added!");
      }

      // List refresh karo (Bina full reload ke)
      this.resetAndLoad(false);
      this.loadStats();

      document.getElementById("shop-modal").classList.remove("active");
      document.getElementById("shop-form").reset();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      btn.disabled = false;
      btn.innerText = "Save Shop Details";
    }
  },

  deleteShop: async function (id) {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await ShopsService.deleteShop(id);

      // UI se turant hata do (Fast experience)
      this.currentList = this.currentList.filter((i) => i.id !== id);
      if (window.ShopsUI) window.ShopsUI.renderTable(this.currentList);

      this.loadStats();
    } catch (e) {
      alert(e.message);
    }
  },

  openEditModal: function (id) {
    const item = this.currentList.find((i) => i.id === id);
    if (!item) return;

    document.getElementById("shop-id").value = item.id;
    document.getElementById("shop-name").value = item.shopName;
    document.getElementById("owner-name").value = item.ownerName;
    document.getElementById("shop-mobile").value = item.mobile;
    document.getElementById("shop-status").value = item.status;
    document.getElementById("shop-address").value = item.address;

    document.getElementById("modal-title").innerText = "Edit Shop Details";
    document.getElementById("shop-modal").classList.add("active");
  },

  // --- 4. EVENT LISTENERS ---

  setupEventListeners: function () {
    // Infinite Scroll
    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        this.fetchNextBatch();
      }
    });

    // Form Submit
    const form = document.getElementById("shop-form");
    if (form) form.onsubmit = (e) => this.handleSaveShop(e);

    // Modal Buttons
    document.getElementById("btn-add-shop").onclick = () => {
      document.getElementById("shop-form").reset();
      document.getElementById("shop-id").value = "";
      document.getElementById("modal-title").innerText = "Add New Shop";
      document.getElementById("shop-modal").classList.add("active");
    };
    document.getElementById("close-shop-modal").onclick = () =>
      document.getElementById("shop-modal").classList.remove("active");

    // Search Input
    const searchInput = document.getElementById("shop-search");
    if (searchInput)
      searchInput.oninput = (e) => this.handleSearch(e.target.value);

    // Filter Dropdown
    const filterStatus = document.getElementById("filter-status");
    if (filterStatus)
      filterStatus.onchange = (e) => this.handleFilter(e.target.value);
  },
};
