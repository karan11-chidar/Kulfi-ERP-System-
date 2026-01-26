window.ExpenseController = {
  currentExpenses: [],

  init: function () {
    console.log("💰 ExpenseController: Calculating...");
    this.setupDataStream();
    this.setupEventListeners();
    document.getElementById("exp-date").valueAsDate = new Date();
  },

  setupDataStream: function () {
    ExpenseService.subscribeToExpenses(
      (data) => {
        this.currentExpenses = data;
        this.applyFilters();
        if (window.ExpenseUI) window.ExpenseUI.hideLoader();
      },
      (error) => console.error("Error:", error),
    );
  },

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

      await ExpenseService.addExpense(expenseData);
      alert("✅ Expense Added!");
      document.getElementById("expense-modal").classList.remove("active");
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      btn.innerText = "Save Expense";
      btn.disabled = false;
    }
  },

  deleteExpense: async function (id) {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await ExpenseService.deleteExpense(id);
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  },
};
