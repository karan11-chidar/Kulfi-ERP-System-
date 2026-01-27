window.ExpenseController = {
  currentExpenses: [], // Local Data Store

  init: function () {
    console.log("💰 ExpenseController: Low Cost Mode...");
    this.loadExpenses(); // Ab hum "Load" kar rahe hain, "Subscribe" nahi
    this.setupEventListeners();

    // Date input me aaj ki date
    if (document.getElementById("exp-date")) {
      document.getElementById("exp-date").valueAsDate = new Date();
    }
  },

  // 1. Data Lana (Sirf Ek Baar)
  loadExpenses: async function () {
    try {
      const snapshot = await ExpenseService.getAllExpenses();

      this.currentExpenses = [];
      snapshot.forEach((doc) => {
        this.currentExpenses.push({ id: doc.id, ...doc.data() });
      });

      console.log(`🔥 Loaded ${this.currentExpenses.length} expenses`);

      this.applyFilters();
      if (window.ExpenseUI) window.ExpenseUI.hideLoader();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load expenses.");
    }
  },

  // 2. Filters (Same as before)
  applyFilters: function () {
    const searchInput = document.getElementById("expense-search");
    const categoryFilter = document.getElementById("filter-category");

    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedCat = categoryFilter ? categoryFilter.value : "all";

    const filtered = this.currentExpenses.filter((exp) => {
      const matchesSearch =
        exp.description.toLowerCase().includes(query) ||
        exp.amount.toString().includes(query);

      const matchesCategory =
        selectedCat === "all" || exp.category === selectedCat;

      return matchesSearch && matchesCategory;
    });

    if (window.ExpenseUI) {
      window.ExpenseUI.renderTable(filtered);
      window.ExpenseUI.updateStats(filtered);
    }
  },

  // 3. Listeners (Same as before)
  setupEventListeners: function () {
    document
      .getElementById("expense-search")
      ?.addEventListener("input", () => this.applyFilters());
    document
      .getElementById("filter-category")
      ?.addEventListener("change", () => this.applyFilters());

    document
      .getElementById("btn-add-expense")
      ?.addEventListener("click", () => {
        document.getElementById("expense-form").reset();
        document.getElementById("exp-date").valueAsDate = new Date();
        document.getElementById("expense-modal").classList.add("active");
      });

    document
      .getElementById("close-expense-modal")
      ?.addEventListener("click", () => {
        document.getElementById("expense-modal").classList.remove("active");
      });

    document
      .getElementById("expense-form")
      ?.addEventListener("submit", (e) => this.handleSave(e));
  },

  // 4. Save Logic (Local Update Magic ✨)
  handleSave: async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector("button[type='submit']");
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
      const expenseData = {
        category: document.getElementById("exp-category").value,
        amount: Number(document.getElementById("exp-amount").value),
        description: document.getElementById("exp-note").value,
        date: document.getElementById("exp-date").value,
        paymentMode: document.getElementById("exp-mode").value,
        addedBy: "Manager",
      };

      // Server par bhejo
      const docRef = await ExpenseService.addExpense(expenseData);

      // ⚡ LOCAL UPDATE (Array me manually add karo)
      // 'unshift' naye item ko list me sabse upar dalega
      this.currentExpenses.unshift({ id: docRef.id, ...expenseData });

      alert("✅ Expense Added!");
      this.applyFilters(); // Table Refresh
      document.getElementById("expense-modal").classList.remove("active");
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      btn.innerText = "Save Expense";
      btn.disabled = false;
    }
  },

  // 5. Delete Logic (Local Update Magic ✨)
  deleteExpense: async function (id) {
    if (confirm("Delete this expense?")) {
      try {
        // Server se hatao
        await ExpenseService.deleteExpense(id);

        // ⚡ LOCAL UPDATE (Array se filter kar do)
        this.currentExpenses = this.currentExpenses.filter(
          (item) => item.id !== id,
        );

        this.applyFilters(); // Table Refresh
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  },
};
