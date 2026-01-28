// Path: public/js/manager/expense/ui/expenseUI.js

window.ExpenseUI = {
  tableBody: document.getElementById("expense-table-body"),
  loadMoreContainer: document.getElementById("pagination-controls"),
  loadMoreBtn: document.getElementById("btn-load-more"),
  loader: document.getElementById("auth-loader"),

  renderTable: function (list) {
    this.tableBody.innerHTML = "";
    if (!list || list.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#777;">No expenses found</td></tr>`;
      return;
    }

    list.forEach((item) => {
      let catColor = "#777";
      if (item.category === "Raw Material") catColor = "#e67e22";
      if (item.category === "Fuel") catColor = "#e74c3c";
      if (item.category === "Salary") catColor = "#2ecc71";
      if (item.category === "Maintenance") catColor = "#9b59b6";

      const row = `
        <tr>
          <td>${item.date}</td>
          <td><span style="color:${catColor}; font-weight:600;">${item.category}</span></td>
          <td>${item.description}</td>
          <td style="font-weight:bold;">₹${(Number(item.amount) || 0).toLocaleString()}</td>
          <td>${item.paymentMode}</td>
          <td>
             <i data-lucide="trash-2" style="color:red; cursor:pointer;" 
                onclick="window.ExpenseController.deleteExpense('${item.id}')"></i>
          </td>
        </tr>
      `;
      this.tableBody.innerHTML += row;
    });
    if (window.lucide) window.lucide.createIcons();
  },

  // 🔥 NEW: Ye Cards ko update karega (Table se koi lena dena nahi)
  updateCards: function (total, month, week, today) {
    const totalEl = document.getElementById("total-expense");
    const monthEl = document.getElementById("month-expense");
    const weeklyEl = document.getElementById("weekly-expense");
    const todayEl = document.getElementById("today-expense");

    if (totalEl) totalEl.innerText = "₹" + total.toLocaleString();
    if (monthEl) monthEl.innerText = "₹" + month.toLocaleString();
    if (weeklyEl) weeklyEl.innerText = "₹" + week.toLocaleString();
    if (todayEl) todayEl.innerText = "₹" + today.toLocaleString();
  },

  // Helpers
  clearTable: function () {
    this.tableBody.innerHTML = "";
  },

  showLoading: function () {
    if (this.loader) this.loader.style.display = "flex";
  },
  hideLoading: function () {
    if (this.loader) this.loader.style.display = "none";
  },

  showLoadMore: function () {
    if (this.loadMoreContainer) this.loadMoreContainer.style.display = "block";
  },
  hideLoadMore: function () {
    if (this.loadMoreContainer) this.loadMoreContainer.style.display = "none";
  },

  showButtonLoading: function (isLoading) {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.innerText = isLoading
        ? "Loading..."
        : "⬇️ Load More Expenses";
      this.loadMoreBtn.disabled = isLoading;
    }
  },
};
