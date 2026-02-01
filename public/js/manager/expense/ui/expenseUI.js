window.ExpenseUI = {
  tableBody: document.getElementById("expense-table-body"),
  mainLoader: document.getElementById("auth-loader"),
  scrollLoader: null,

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
    this.ensureScrollLoader();
  },

  updateCards: function (t, m, w, td) {
    const ids = [
      "total-expense",
      "month-expense",
      "weekly-expense",
      "today-expense",
    ];
    const vals = [t, m, w, td];
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.innerText = "₹" + vals[i].toLocaleString();
    });
  },

  clearTable: function () {
    this.tableBody.innerHTML = "";
  },

  showMainLoader: function () {
    if (this.mainLoader) this.mainLoader.style.display = "flex";
  },
  hideMainLoader: function () {
    if (this.mainLoader) this.mainLoader.style.display = "none";
  },

  ensureScrollLoader: function () {
    if (!document.getElementById("scroll-loader-row")) {
      const tr = document.createElement("tr");
      tr.id = "scroll-loader-row";
      tr.style.display = "none";
      tr.innerHTML = `
            <td colspan="6" style="text-align:center; padding:15px;">
                <span style="display:inline-block; width:20px; height:20px; border:2px solid #ddd; border-top:2px solid #ff5722; border-radius:50%; animation:spin 1s infinite;"></span>
                <span style="margin-left:10px; color:#666; font-size:14px;">Loading more...</span>
            </td>
          `;
      this.tableBody.appendChild(tr);
      this.scrollLoader = tr;
    }
  },

  showScrollLoader: function (show) {
    const loader = document.getElementById("scroll-loader-row");
    if (loader) loader.style.display = show ? "table-row" : "none";
  },
};
