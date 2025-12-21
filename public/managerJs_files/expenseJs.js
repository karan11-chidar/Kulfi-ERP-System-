// Elements
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-sidebar");
const tableBody = document.getElementById("expense-table-body");
const searchInput = document.getElementById("expense-search");
const filterCategory = document.getElementById("filter-category");

// Stats
const totalExpenseEl = document.getElementById("total-expense");
const monthExpenseEl = document.getElementById("month-expense");
const todayExpenseEl = document.getElementById("today-expense");

// Modal
const modal = document.getElementById("expense-modal");
const btnAdd = document.getElementById("btn-add-expense");
const btnClose = document.getElementById("close-expense-modal");
const form = document.getElementById("expense-form");

// Sidebar Logic
function toggleMenu() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// Dummy Data
let expenseData = [
  {
    id: 1,
    date: "2023-10-25",
    category: "Raw Material",
    desc: "Purchased Milk 50L",
    amount: 2500,
    mode: "Cash",
  },
  {
    id: 2,
    date: "2023-10-25",
    category: "Fuel",
    desc: "Petrol for Delivery Bike",
    amount: 500,
    mode: "Online",
  },
  {
    id: 3,
    date: "2023-10-24",
    category: "Maintenance",
    desc: "Freezer Repair",
    amount: 1200,
    mode: "Cash",
  },
  {
    id: 4,
    date: "2023-10-20",
    category: "Salary",
    desc: "Advance to Ramesh",
    amount: 2000,
    mode: "Online",
  },
];

// Calculations
function updateStats() {
  const total = expenseData.reduce((sum, item) => sum + item.amount, 0);
  // Note: Month/Today logic is dummy for now
  if (totalExpenseEl) totalExpenseEl.innerText = "₹" + total.toLocaleString();
  if (monthExpenseEl) monthExpenseEl.innerText = "₹" + total.toLocaleString();
  if (todayExpenseEl) todayExpenseEl.innerText = "₹3,000";
}

// Render Table
function renderTable(data) {
  tableBody.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No expenses found</td></tr>`;
    return;
  }

  data.forEach((item) => {
    const row = `
            <tr>
                <td>${item.date}</td>
                <td><span style="background:#f0f0f0; padding:4px 8px; border-radius:4px; font-size:12px;">${
                  item.category
                }</span></td>
                <td>${item.desc}</td>
                <td class="amount-cell">-₹${item.amount.toLocaleString()}</td>
                <td>${item.mode}</td>
                <td><i data-lucide="trash-2" class="delete-icon" onclick="deleteExpense(${
                  item.id
                })"></i></td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });
  updateStats();
  if (window.lucide) window.lucide.createIcons();
}

renderTable(expenseData);

// Filters
function filterData() {
  const term = searchInput.value.toLowerCase();
  const cat = filterCategory.value;

  const filtered = expenseData.filter((item) => {
    const matchesTerm = item.desc.toLowerCase().includes(term);
    const matchesCat = cat === "all" || item.category === cat;
    return matchesTerm && matchesCat;
  });
  renderTable(filtered);
}

if (searchInput) searchInput.addEventListener("keyup", filterData);
if (filterCategory) filterCategory.addEventListener("change", filterData);

// Modal Logic
btnAdd.addEventListener("click", () => modal.classList.add("active"));
btnClose.addEventListener("click", () => modal.classList.remove("active"));
window.onclick = (e) => {
  if (e.target === modal) modal.classList.remove("active");
};

// Add Logic
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newExp = {
    id: Date.now(),
    category: document.getElementById("exp-category").value,
    amount: parseInt(document.getElementById("exp-amount").value),
    desc: document.getElementById("exp-note").value,
    date: document.getElementById("exp-date").value,
    mode: document.getElementById("exp-mode").value,
  };

  expenseData.unshift(newExp); // Add to top
  alert("Expense Added!");
  renderTable(expenseData);
  modal.classList.remove("active");
  form.reset();
});

// Delete Logic
window.deleteExpense = function (id) {
  if (confirm("Delete this expense record?")) {
    expenseData = expenseData.filter((item) => item.id !== id);
    renderTable(expenseData);
  }
};

if (window.lucide) window.lucide.createIcons();
