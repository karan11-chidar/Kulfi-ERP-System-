// --- DOM Elements ---
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-sidebar");
const searchInput = document.getElementById("sales-search");
const filterBoy = document.getElementById("filter-boy");

// Views
const btnShowSales = document.getElementById("btn-show-sales");
const btnShowPurchase = document.getElementById("btn-show-purchase");
const salesSection = document.getElementById("sales-section");
const purchaseSection = document.getElementById("purchase-section");
const salesStats = document.getElementById("sales-stats");
const purchaseStats = document.getElementById("purchase-stats");
const btnAddPurchase = document.getElementById("btn-add-purchase");
const btnOpenSheet = document.getElementById("btn-open-sheet");

// Purchase Modal Elements
const purchaseModal = document.getElementById("purchase-modal");
const closePurchaseModalBtn = document.getElementById("close-purchase-modal");
const purchaseForm = document.getElementById("add-purchase-form");

// --- Sidebar Logic ---
function toggleMenu() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// --- Google Sheet Logic ---
if (btnOpenSheet) {
  btnOpenSheet.addEventListener("click", () => {
    window.open("https://docs.google.com/spreadsheets", "_blank");
  });
}

// --- Toggle View Logic (Sales / Purchase) ---
if (btnShowSales && btnShowPurchase) {
  btnShowSales.addEventListener("click", () => {
    btnShowSales.classList.add("active");
    btnShowPurchase.classList.remove("active");

    salesSection.classList.remove("hidden");
    purchaseSection.classList.add("hidden");
    salesStats.classList.remove("hidden");
    purchaseStats.classList.add("hidden");

    if (btnAddPurchase) btnAddPurchase.classList.add("hidden"); // Hide Add Button in Sales view
    if (filterBoy) filterBoy.classList.remove("hidden");
  });

  btnShowPurchase.addEventListener("click", () => {
    btnShowPurchase.classList.add("active");
    btnShowSales.classList.remove("active");

    salesSection.classList.add("hidden");
    purchaseSection.classList.remove("hidden");
    salesStats.classList.add("hidden");
    purchaseStats.classList.remove("hidden");

    if (btnAddPurchase) btnAddPurchase.classList.remove("hidden"); // Show Add Button in Purchase view
    if (filterBoy) filterBoy.classList.add("hidden");
  });
}

// --- Modal Logic (Purchase) ---
if (btnAddPurchase) {
  btnAddPurchase.addEventListener("click", () => {
    if (purchaseModal) purchaseModal.classList.add("active");
  });
}

if (closePurchaseModalBtn) {
  closePurchaseModalBtn.addEventListener("click", () => {
    if (purchaseModal) purchaseModal.classList.remove("active");
  });
}

// Close on outside click
window.onclick = function (event) {
  if (event.target === purchaseModal) {
    purchaseModal.classList.remove("active");
  }
};

// Dummy Form Submit
if (purchaseForm) {
  purchaseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Purchase Entry Saved! (Updating Stock...)");
    purchaseModal.classList.remove("active");
    // In real app, we will add data to table here
  });
}

// --- Dummy Sales Data ---
const salesData = [
  {
    id: 1,
    shop: "Gupta Kirana",
    amount: 1200,
    type: "online",
    boy: "Ramesh",
    time: "10:30 AM",
  },
  {
    id: 2,
    shop: "Sharma Store",
    amount: 500,
    type: "cash",
    boy: "Suresh",
    time: "11:00 AM",
  },
  {
    id: 3,
    shop: "City Cafe",
    amount: 800,
    type: "credit",
    boy: "Ramesh",
    time: "11:45 AM",
  },
];

// --- Dummy Purchase Data ---
const purchaseData = [
  {
    item: "Raw Milk",
    supplier: "Dairy Farm Inc.",
    qty: "200 L",
    cost: 8000,
    date: "2023-10-25",
    status: "Paid",
  },
  {
    item: "Sugar Sacks",
    supplier: "Wholesale Mart",
    qty: "50 kg",
    cost: 2000,
    date: "2023-10-24",
    status: "Pending",
  },
];

// --- Render Tables ---
function renderSalesTable(data) {
  const tbody = document.getElementById("sales-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No sales found</td></tr>`;
    return;
  }
  data.forEach((sale) => {
    const row = `<tr>
            <td><strong>${sale.shop}</strong></td>
            <td>₹${sale.amount}</td>
            <td><span class="badge ${sale.type}">${sale.type}</span></td>
            <td>${sale.boy}</td>
            <td>${sale.time}</td>
        </tr>`;
    tbody.innerHTML += row;
  });
}

function renderPurchaseTable(data) {
  const tbody = document.getElementById("purchase-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  data.forEach((p) => {
    let statusColor =
      p.status === "Paid" ? "color: var(--success);" : "color: var(--danger);";
    const row = `<tr>
            <td><strong>${p.item}</strong></td>
            <td>${p.supplier}</td>
            <td>${p.qty}</td>
            <td>₹${p.cost}</td>
            <td>${p.date}</td>
            <td style="${statusColor} font-weight:600;">${p.status}</td>
        </tr>`;
    tbody.innerHTML += row;
  });
}

// Initial Render
renderSalesTable(salesData);
renderPurchaseTable(purchaseData);

// --- Filter Logic ---
function filterSales() {
  if (!searchInput || !filterBoy) return;

  const term = searchInput.value.toLowerCase();
  const boy = filterBoy.value;

  const filtered = salesData.filter((sale) => {
    const matchesSearch = sale.shop.toLowerCase().includes(term);
    const matchesBoy = boy === "all" || sale.boy.toLowerCase().includes(boy);
    return matchesSearch && matchesBoy;
  });
  renderSalesTable(filtered);
}

if (searchInput) searchInput.addEventListener("keyup", filterSales);
if (filterBoy) filterBoy.addEventListener("change", filterSales);

// Icons
if (window.lucide) window.lucide.createIcons();
