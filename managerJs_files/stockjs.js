// --- DOM Elements ---
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-sidebar");
const tableBody = document.getElementById("stock-table-body");
const searchInput = document.getElementById("stock-search");

// Buttons
const addBtn = document.getElementById("add-stock-btn");
const assignBtn = document.getElementById("assign-stock-btn");
const returnBtn = document.getElementById("return-stock-btn");

// Modals
const stockModal = document.getElementById("stock-modal");
const assignModal = document.getElementById("assign-modal");
const returnModal = document.getElementById("return-modal");

// Close Buttons (Multiple)
const closeButtons = document.querySelectorAll(".close-modal");

// Forms
const addForm = document.getElementById("add-stock-form");
const assignForm = document.getElementById("assign-form");
const returnForm = document.getElementById("return-form");

// --- Sidebar Logic ---
function toggleMenu() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// --- Dummy Stock Data ---
const stockData = [
  {
    name: "Kesar Pista Kulfi",
    category: "Kulfi",
    price: 40,
    qty: 500,
    status: "in-stock",
  },
  {
    name: "Malai Kulfi",
    category: "Kulfi",
    price: 30,
    qty: 120,
    status: "in-stock",
  },
  {
    name: "Mango Dolly",
    category: "Ice Cream",
    price: 20,
    qty: 25,
    status: "low",
  },
  {
    name: "Chocolate Cone",
    category: "Cone",
    price: 50,
    qty: 0,
    status: "out",
  },
  {
    name: "Rabdi Falooda",
    category: "Kulfi",
    price: 60,
    qty: 200,
    status: "in-stock",
  },
];

// --- Render Table ---
function renderTable(data) {
  tableBody.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No products found</td></tr>`;
    return;
  }
  data.forEach((item) => {
    let statusText = "In Stock";
    let statusClass = "in-stock";
    if (item.status === "low") {
      statusText = "Low Stock";
      statusClass = "low";
    }
    if (item.status === "out") {
      statusText = "Out of Stock";
      statusClass = "out";
    }

    const row = `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>₹${item.price}</td>
                <td style="font-weight: 600;">${item.qty}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-icons">
                        <i data-lucide="edit-2"></i>
                        <i data-lucide="trash-2" class="delete"></i>
                    </div>
                </td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });
  // Re-initialize icons after rendering
  if (window.lucide) window.lucide.createIcons();
}
renderTable(stockData);

// --- Search Logic ---
if (searchInput) {
  searchInput.addEventListener("keyup", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = stockData.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
    renderTable(filtered);
  });
}

// --- MODAL LOGIC (OPENING) ---
function openModal(modal) {
  if (modal) modal.classList.add("active");
}
function closeModalFunction(modal) {
  if (modal) modal.classList.remove("active");
}

// Open specific modals (Only if button and modal exist)
if (addBtn && stockModal)
  addBtn.addEventListener("click", () => openModal(stockModal));
if (assignBtn && assignModal)
  assignBtn.addEventListener("click", () => openModal(assignModal));
if (returnBtn && returnModal)
  returnBtn.addEventListener("click", () => openModal(returnModal));

// Close buttons functionality
closeButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const modalId = e.target.getAttribute("data-target");
    const modalToClose = document.getElementById(modalId);
    closeModalFunction(modalToClose);
  });
});

// Close on outside click
window.onclick = function (event) {
  if (event.target.classList.contains("modal-overlay")) {
    event.target.classList.remove("active");
  }
};

// --- FORM SUBMIT LOGIC ---
if (addForm) {
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("New Product Added! (Data saved to DB)");
    closeModalFunction(stockModal);
  });
}

if (assignForm) {
  assignForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Stock Assigned to Delivery Boy Successfully!");
    closeModalFunction(assignModal);
  });
}

if (returnForm) {
  returnForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Stock Returned to Godown Successfully!");
    closeModalFunction(returnModal);
  });
}

// Initial icon load
if (window.lucide) window.lucide.createIcons();
