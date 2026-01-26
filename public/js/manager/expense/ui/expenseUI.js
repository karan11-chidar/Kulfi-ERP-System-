window.ExpenseUI = {
  renderTable: function (expenseList) {
    const tbody = document.getElementById("expense-table-body");
    tbody.innerHTML = "";

    if (expenseList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No Expenses Found</td></tr>`;
      return;
    }

    expenseList.forEach((expense) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${expense.date}</td>
                <td><span class="badge badge-${expense.category.toLowerCase().split(" ")[0]}">${expense.category}</span></td>
                <td>${expense.description}</td>
                <td style="font-weight: bold; color: #e74c3c;">₹${Number(expense.amount).toLocaleString()}</td>
                <td>${expense.paymentMode}</td>
                <td>
                    <button class="btn-icon delete-btn" onclick="ExpenseController.deleteExpense('${expense.id}')">
                        <i data-lucide="trash-2" style="color: red;"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
    lucide.createIcons();
  },

  updateStats: function (expenseList) {
    let total = 0;
    let monthly = 0;
    let weekly = 0;
    let today = 0;

    const now = new Date();
    const todayDateStr = now.toISOString().split("T")[0];
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");

    // Last 7 Days Date
    const lastWeekDate = new Date();
    lastWeekDate.setDate(now.getDate() - 7);

    expenseList.forEach((exp) => {
      const amount = Number(exp.amount);
      const expDateObj = new Date(exp.date);

      // 1. Total
      total += amount;

      // 2. Monthly
      if (exp.date.split("-")[1] === currentMonth) {
        monthly += amount;
      }

      // 3. Weekly (Logic: Date >= 7 din pehle AND Date <= Aaj)
      if (expDateObj >= lastWeekDate && expDateObj <= now) {
        weekly += amount;
      }

      // 4. Today
      if (exp.date === todayDateStr) {
        today += amount;
      }
    });

    // UI Update
    this.animateValue("total-expense", total);
    this.animateValue("month-expense", monthly);
    this.animateValue("weekly-expense", weekly);
    this.animateValue("today-expense", today);
  },

  animateValue: function (id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = "₹" + value.toLocaleString();
  },

  hideLoader: function () {
    const loader = document.getElementById("auth-loader");
    if (loader) loader.style.display = "none";
  },
};
