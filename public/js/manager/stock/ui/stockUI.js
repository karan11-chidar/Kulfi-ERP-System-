window.StockUI = {
  tableBody: document.getElementById("stock-table-body"),
  mainLoader: document.getElementById("auth-loader"),

  renderLoading: function () {
    this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Loading Stock...</td></tr>`;
  },

  renderTable: function (data) {
    this.tableBody.innerHTML = "";
    if (data.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No products found</td></tr>`;
      return;
    }

    data.forEach((item) => {
      let qty = Number(item.qty) || 0;
      let statusClass = qty > 10 ? "in-stock" : (qty > 0 ? "low" : "out");
      let statusText = qty > 10 ? "In Stock" : (qty > 0 ? "Low Stock" : "Out of Stock");

      const row = `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>₹${item.price}</td>
                <td style="font-weight: 600;">${qty}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td><i data-lucide="trash-2" class="delete" onclick="window.StockController.handleDelete('${item.id}')" style="cursor:pointer; color:red;"></i></td>
            </tr>`;
      this.tableBody.innerHTML += row;
    });

    if (window.lucide) window.lucide.createIcons();
  },

  // 🔥 UPDATED: Ab ye Main Filter aur Modals dono ko bharega
  populateDropdowns: function(boys, products) {
      // 1. Boys Dropdowns (Main Filter + Modals)
      // 'boy-stock-filter' wo dropdown hai jo search bar ke paas hai
      const boySelects = ["assign-boy-select", "return-boy-select", "boy-stock-filter"];

      boySelects.forEach(id => {
          const el = document.getElementById(id);
          if(el) {
              // Filter ke liye 'All' aur Modal ke liye '-- Select --'
              const defaultText = id === "boy-stock-filter" ? "All Boys Stock" : "-- Select Boy --";
              const defaultValue = id === "boy-stock-filter" ? "all" : "";
              
              el.innerHTML = `<option value="${defaultValue}">${defaultText}</option>`;
              
              boys.forEach(b => {
                  el.innerHTML += `<option value="${b}">${b}</option>`;
              });
          }
      });

      // 2. Products Dropdowns (Modals Only)
      const prodSelects = ["assign-product-select", "return-product-select", "damage-product-select"];
      prodSelects.forEach(id => {
          const el = document.getElementById(id);
          if(el) {
              el.innerHTML = '<option value="">-- Select Product --</option>';
              products.forEach(p => {
                  el.innerHTML += `<option value="${p}">${p}</option>`;
              });
          }
      });
  },

  showMainLoader: function () { if (this.mainLoader) this.mainLoader.style.display = "flex"; },
  hideMainLoader: function () { if (this.mainLoader) this.mainLoader.style.display = "none"; }
};