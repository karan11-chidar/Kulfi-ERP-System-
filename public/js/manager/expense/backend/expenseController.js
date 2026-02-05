window.ExpenseController = {
  currentDate: new Date().toISOString().split("T")[0],
  currentList: [],
  lifeTimeTotal: 0,
  PAGE_SIZE: 10,
  isLoading: false,
  hasMoreData: true,
  lastCursorTime: null,

  init: async function () {
    console.log("💰 ExpenseController: Init");
    const dateInput = document.getElementById("exp-date-filter");
    if (dateInput) {
      dateInput.value = this.currentDate;
      dateInput.onchange = (e) => this.loadExpensesForDate(e.target.value);
    }
    if (window.ExpenseUI) window.ExpenseUI.showMainLoader();
    this.lifeTimeTotal = await ExpenseService.getLifeTimeTotal();
    this.loadExpensesForDate(this.currentDate);
    this.setupEventListeners();
  },

  loadExpensesForDate: async function (date) {
    this.currentDate = date;
    this.hasMoreData = true;
    this.isLoading = false;
    this.loadStats();
    const STORAGE_KEY = `kulfi_exp_${date}`;
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      this.currentList = JSON.parse(localData);
      if (this.currentList.length > 0) {
        const lastItem = this.currentList[this.currentList.length - 1];
        this.lastCursorTime = lastItem._timestamp || null;
      }
      this.applyFilters();
      if (window.ExpenseUI) window.ExpenseUI.hideMainLoader();
      this.checkForNewData(date);
    } else {
      this.currentList = [];
      this.lastCursorTime = null;
      if (window.ExpenseUI) window.ExpenseUI.clearTable();
      await this.fetchNextBatch();
    }
  },
  checkForNewData: async function (date) {
    if (this.currentList.length === 0) return;
    const latestItem = this.currentList[0];
    let latestTime = latestItem._timestamp;
    if (!latestTime) return;
    let queryTime;
    if (typeof latestTime.toDate === "function") queryTime = latestTime;
    else if (latestTime.seconds)
      queryTime = new Date(latestTime.seconds * 1000);
    else return;
    try {
      const snapshot = await ExpenseService.getNewerExpenses(date, queryTime);
      if (!snapshot.empty) {
        const newItems = [];
        let addedAmount = 0;
        snapshot.forEach((doc) => {
          if (!this.currentList.find((i) => i.id === doc.id)) {
            const data = doc.data();
            newItems.push({ id: doc.id, ...data, _timestamp: data.timestamp });
            addedAmount += Number(data.amount) || 0;
          }
        });
        if (newItems.length > 0) {
          this.currentList = [...newItems, ...this.currentList];
          localStorage.setItem(
            `kulfi_exp_${date}`,
            JSON.stringify(this.currentList),
          );
          this.applyFilters();
          this.lifeTimeTotal += addedAmount;
          this.loadStats();
        }
      }
    } catch (e) {
      console.error("Sync failed", e);
    }
  },
  fetchNextBatch: async function () {
    if (this.isLoading || !this.hasMoreData) return;
    this.isLoading = true;
    if (window.ExpenseUI) window.ExpenseUI.showScrollLoader(true);
    try {
      const snapshot = await ExpenseService.getExpenses(
        this.currentDate,
        this.lastCursorTime,
        this.PAGE_SIZE,
      );
      if (snapshot.empty) {
        this.hasMoreData = false;
        if (window.ExpenseUI) window.ExpenseUI.showScrollLoader(false);
        if (this.currentList.length === 0) this.applyFilters();
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
        `kulfi_exp_${this.currentDate}`,
        JSON.stringify(this.currentList),
      );
      this.applyFilters();
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
      if (window.ExpenseUI) {
        window.ExpenseUI.hideMainLoader();
        window.ExpenseUI.showScrollLoader(false);
      }
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
    if (window.ExpenseUI) window.ExpenseUI.renderTable(filteredList);
  },
  loadStats: async function () {
    const stats = await ExpenseService.getStats(this.currentDate);
    if (window.ExpenseUI) {
      window.ExpenseUI.updateCards(
        this.lifeTimeTotal,
        stats.monthTotal,
        stats.weekTotal,
        stats.todayTotal,
      );
    }
  },

  // 🔥 UPDATED: Capture Name OR Email
  handleAddExpense: async function (e) {
    e.preventDefault();
    const btn = document.querySelector("#expense-form .save-btn");
    const amount = Number(document.getElementById("exp-amount").value);

    if (amount <= 0) {
      alert("⚠️ Invalid Amount!");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Saving...";

    // 1. Get User Info (Robust Check)
    const user = firebase.auth().currentUser;
    let identifier = "Manager"; // Default

    if (user) {
      // Agar Naam hai toh Naam, nahi toh Email ka pehla hissa, nahi toh 'Manager'
      if (user.displayName) {
        identifier = user.displayName;
      } else if (user.email) {
        identifier = user.email.split("@")[0]; // e.g. "karan" from "karan@gmail.com"
      }
    }

    try {
      const data = {
        category: document.getElementById("exp-category").value,
        amount: amount,
        description: document.getElementById("exp-note").value,
        date: document.getElementById("exp-date").value,
        paymentMode: document.getElementById("exp-mode").value,

        // 🔥 Save Precise Identity
        addedBy: identifier,
        role: "Manager",
      };

      const docRef = await ExpenseService.addExpense(data);

      if (data.date === this.currentDate) {
        const newItem = {
          id: docRef.id,
          ...data,
          _timestamp: { seconds: Date.now() / 1000 },
        };
        this.currentList.unshift(newItem);
        localStorage.setItem(
          `kulfi_exp_${this.currentDate}`,
          JSON.stringify(this.currentList),
        );
        this.applyFilters();
      }

      this.lifeTimeTotal += amount;
      this.loadStats();

      document.getElementById("expense-modal").classList.remove("active");
      document.getElementById("expense-form").reset();
      document.getElementById("exp-date").value = new Date()
        .toISOString()
        .split("T")[0];
      alert("✅ Saved!");
    } catch (e) {
      alert(e.message);
    } finally {
      btn.disabled = false;
      btn.innerText = "Save Expense";
    }
  },

  deleteExpense: async function (id) {
    if (!confirm("Delete this expense?")) return;
    const item = this.currentList.find((i) => i.id === id);
    const amount = item ? Number(item.amount) || 0 : 0;
    await ExpenseService.deleteExpense(id);
    this.currentList = this.currentList.filter((i) => i.id !== id);
    localStorage.setItem(
      `kulfi_exp_${this.currentDate}`,
      JSON.stringify(this.currentList),
    );
    if (amount > 0) {
      this.lifeTimeTotal -= amount;
      this.loadStats();
    }
    this.applyFilters();
  },

  setupEventListeners: function () {
    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      )
        this.fetchNextBatch();
    });
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
    document.getElementById("expense-search").oninput = () =>
      this.applyFilters();
    document.getElementById("filter-category").onchange = () =>
      this.applyFilters();
    document.getElementById("btn-refresh-data").onclick = () => {
      localStorage.removeItem(`kulfi_exp_${this.currentDate}`);
      this.loadExpensesForDate(this.currentDate);
    };
  },
};
