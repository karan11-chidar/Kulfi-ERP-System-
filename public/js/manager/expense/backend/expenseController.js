// Path: public/js/manager/expense/backend/expenseController.js

window.ExpenseController = {
  currentDate: new Date().toISOString().split("T")[0],
  currentList: [],
  lastCursorTime: null,
  PAGE_SIZE: 20,

  init: function () {
    console.log("💰 ExpenseController: Independent Stats Mode 🚀");

    // 1. Date Filter Set karo
    const dateInput = document.getElementById("exp-date-filter");
    if (dateInput) {
      dateInput.value = this.currentDate;
      dateInput.onchange = (e) => this.loadExpensesForDate(e.target.value);
    }

    // 2. Table Load karo (Aaj ki date ka)
    this.loadExpensesForDate(this.currentDate);

    // 3. 🔥 Stats Load karo (Ye Table se independent hai)
    this.loadStats();

    this.setupEventListeners();
  },

  // --- STATS LOGIC (Cards ke liye) ---
  loadStats: async function () {
    try {
      console.log("📊 Loading Stats...");
      // Mahine ka data lao
      const snapshot = await ExpenseService.getMonthDataForStats();

      let monthTotal = 0;
      let weekTotal = 0;
      let todayTotal = 0;

      const todayStr = new Date().toISOString().split("T")[0];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekStr = sevenDaysAgo.toISOString().split("T")[0];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const amount = Number(data.amount) || 0;
        const date = data.date;

        // 1. Monthly (Sab jod lo kyunki query hi monthly hai)
        monthTotal += amount;

        // 2. Today
        if (date === todayStr) {
          todayTotal += amount;
        }

        // 3. Weekly (Agar date pichle 7 din me hai)
        if (date >= weekStr) {
          weekTotal += amount;
        }
      });

      // 4. Total All Time (Optional - Abhi Monthly + Previous rakh sakte hain)
      // Reads bachane ke liye main Total me bhi Monthly dikha raha hu
      // Agar tumhe Pura chahiye to bata dena, usme reads lagenge.
      const totalAllTime = monthTotal; // Filhal same rakha hai safe side

      // UI Update karo
      if (window.ExpenseUI) {
        window.ExpenseUI.updateCards(
          totalAllTime,
          monthTotal,
          weekTotal,
          todayTotal,
        );
      }
    } catch (error) {
      console.error("Stats Error:", error);
    }
  },

  // --- TABLE LOGIC (List ke liye) ---
  loadExpensesForDate: async function (date, isLoadMore = false) {
    if (!isLoadMore) {
      this.currentDate = date;
      this.currentList = [];
      this.lastCursorTime = null;
      if (window.ExpenseUI) window.ExpenseUI.clearTable();
      if (window.ExpenseUI) window.ExpenseUI.showLoading();
    }

    const STORAGE_KEY = `kulfi_exp_${date}`;
    const localData = localStorage.getItem(STORAGE_KEY);

    if (localData && !isLoadMore) {
      console.log(`⚡ Found Cache for ${date}`);
      this.currentList = JSON.parse(localData);
      if (this.currentList.length > 0) {
        const lastItem = this.currentList[this.currentList.length - 1];
        this.lastCursorTime = lastItem._timestamp || null;
      }
      this.applyFilters();
    } else {
      await this.fetchFromFirebase(date, isLoadMore);
    }
  },

  fetchFromFirebase: async function (date, isLoadMore) {
    if (isLoadMore && window.ExpenseUI)
      window.ExpenseUI.showButtonLoading(true);

    try {
      const snapshot = await ExpenseService.getExpenses(
        date,
        this.lastCursorTime,
        this.PAGE_SIZE,
      );

      if (snapshot.empty) {
        if (window.ExpenseUI) window.ExpenseUI.hideLoadMore();
        if (window.ExpenseUI) window.ExpenseUI.showButtonLoading(false);
        if (!isLoadMore) this.applyFilters();
        return;
      }

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      this.lastCursorTime = lastDoc.data().timestamp;

      const newItems = [];
      snapshot.forEach((doc) => {
        if (!this.currentList.find((i) => i.id === doc.id)) {
          newItems.push({
            id: doc.id,
            ...doc.data(),
            _timestamp: doc.data().timestamp,
          });
        }
      });

      this.currentList = [...this.currentList, ...newItems];
      localStorage.setItem(
        `kulfi_exp_${date}`,
        JSON.stringify(this.currentList),
      );
      this.applyFilters();
    } catch (error) {
      console.error(error);
      if (window.ExpenseUI) window.ExpenseUI.hideLoading();
    } finally {
      if (window.ExpenseUI) window.ExpenseUI.showButtonLoading(false);
    }
  },

  applyFilters: function () {
    const searchInput = document.getElementById("expense-search");
    const categorySelect = document.getElementById("filter-category");
    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedCategory = categorySelect ? categorySelect.value : "all";

    const filteredList = this.currentList.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    this.refreshUI(filteredList);
  },

  refreshUI: function (listToRender) {
    if (window.ExpenseUI) {
      window.ExpenseUI.hideLoading();
      const data = listToRender || this.currentList;
      window.ExpenseUI.renderTable(data);
      // NOTE: Ab hum yahan se Stats update NAHI karenge. Stats alag hain.

      if (
        this.currentList.length > 0 &&
        this.currentList.length % this.PAGE_SIZE === 0
      ) {
        window.ExpenseUI.showLoadMore();
      } else {
        window.ExpenseUI.hideLoadMore();
      }
    }
  },

  handleAddExpense: async function (e) {
    e.preventDefault();
    const btn = document.querySelector("#expense-form .save-btn");
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
      const expenseData = {
        category: document.getElementById("exp-category").value,
        amount: Number(document.getElementById("exp-amount").value),
        description: document.getElementById("exp-note").value,
        date: document.getElementById("exp-date").value,
        paymentMode: document.getElementById("exp-mode").value,
      };

      const docRef = await ExpenseService.addExpense(expenseData);

      // List Update
      if (expenseData.date === this.currentDate) {
        const newItem = {
          id: docRef.id,
          ...expenseData,
          _timestamp: { seconds: Date.now() / 1000 },
        };
        this.currentList.unshift(newItem);
        localStorage.setItem(
          `kulfi_exp_${this.currentDate}`,
          JSON.stringify(this.currentList),
        );
        this.applyFilters();
      }

      // 🔥 Stats Update (Reload stats to be accurate)
      this.loadStats();

      alert("✅ Added!");
      document.getElementById("expense-modal").classList.remove("active");
      document.getElementById("expense-form").reset();
      document.getElementById("exp-date").value = new Date()
        .toISOString()
        .split("T")[0];
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      btn.innerText = "Save Expense";
      btn.disabled = false;
    }
  },

  deleteExpense: async function (id) {
    if (!confirm("Delete?")) return;
    try {
      await ExpenseService.deleteExpense(id);
      this.currentList = this.currentList.filter((i) => i.id !== id);
      localStorage.setItem(
        `kulfi_exp_${this.currentDate}`,
        JSON.stringify(this.currentList),
      );
      this.applyFilters();

      // 🔥 Stats Update
      this.loadStats();
    } catch (error) {
      alert("Error: " + error.message);
    }
  },

  setupEventListeners: function () {
    const form = document.getElementById("expense-form");
    if (form) form.onsubmit = (e) => this.handleAddExpense(e);

    document.getElementById("btn-add-expense").onclick = () => {
      document.getElementById("expense-modal").classList.add("active");
      document.getElementById("exp-date").value = new Date()
        .toISOString()
        .split("T")[0];
    };
    document.getElementById("close-expense-modal").onclick = () =>
      document.getElementById("expense-modal").classList.remove("active");

    const loadMoreBtn = document.getElementById("btn-load-more");
    if (loadMoreBtn) {
      loadMoreBtn.onclick = () =>
        this.fetchFromFirebase(this.currentDate, true);
    }

    const searchInput = document.getElementById("expense-search");
    if (searchInput) searchInput.oninput = () => this.applyFilters();

    const filterCat = document.getElementById("filter-category");
    if (filterCat) filterCat.onchange = () => this.applyFilters();
    // 👇 REFRESH BUTTON LOGIC
    const refreshBtn = document.getElementById("btn-refresh-data");
    if (refreshBtn) {
        refreshBtn.onclick = () => {
            // 1. Button ghumao (Visual feedback)
            const icon = refreshBtn.querySelector("i");
            if(icon) icon.style.animation = "spin 1s linear infinite";

            // 2. Jeb (Cache) ko aag laga do 🔥 (Delete current date cache)
            localStorage.removeItem(`kulfi_exp_${this.currentDate}`);

            // 3. Wapas Load karo (Ab ye majboori mein Firebase jayega)
            this.loadExpensesForDate(this.currentDate).then(() => {
                if(icon) icon.style.animation = "none"; // Animation roko
                
                // 4. Stats bhi refresh kar lo (Safe side)
                this.loadStats();
                alert("✅ Data Refreshed!");
            });
        };
    }
},
};
