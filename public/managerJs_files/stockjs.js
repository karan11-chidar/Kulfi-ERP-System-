// --- DOM Elements ---
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-sidebar");
const tableBody = document.getElementById("stock-table-body");
const searchInput = document.getElementById("stock-search");

// Stats Elements
const totalDamagedEl = document.getElementById("total-damaged-count");
const resetDamageBtn = document.getElementById("reset-damage-btn");
// New Elements for Boy Stock Card
const boyStockTitle = document.getElementById("boy-stock-title");
const boyStockCount = document.getElementById("boy-stock-count");
const boyStockFilter = document.getElementById("boy-stock-filter");

// Buttons
const assignBtn = document.getElementById("assign-stock-btn");
const returnBtn = document.getElementById("return-stock-btn");
const damageBtn = document.getElementById("damage-stock-btn");

// Modals
const assignModal = document.getElementById("assign-modal");
const returnModal = document.getElementById("return-modal");
const damageModal = document.getElementById("damage-modal");

// Close Buttons
const closeButtons = document.querySelectorAll(".close-modal");

// Forms
const assignForm = document.getElementById("assign-form");
const returnForm = document.getElementById("return-form");
const damageForm = document.getElementById("damage-form");

// Input Fields for Logic
const damageQtyInput = document.getElementById("damage-qty");
const assignQtyInput = document.getElementById("assign-qty");
const assignBoySelect = document.getElementById("assign-boy-select");
const returnQtyInput = document.getElementById("return-qty");
const returnBoySelect = document.getElementById("return-boy-select");

// --- Variables ---
let totalDamagedCount = 0;

// Dummy Data: Har ladke ke paas abhi kitna stock hai
let boysStockData = {
  "Ramesh Kumar": 150,
  "Suresh Singh": 80,
  "Rahul Verma": 45,
};

// Function to calculate Total Stock with All Boys
function getTotalBoysStock() {
  let total = 0;
  for (let boy in boysStockData) {
    total += boysStockData[boy];
  }
  return total;
}

// Function to Update the Card UI based on Dropdown
function updateBoyStockCard() {
  const selectedBoy = boyStockFilter.value;

  if (selectedBoy === "all") {
    boyStockTitle.innerText = "Stock with All Boys";
    boyStockCount.innerText = getTotalBoysStock() + " Items";
  } else {
    boyStockTitle.innerText = "Stock: " + selectedBoy.split(" ")[0]; // Show First Name
    boyStockCount.innerText = (boysStockData[selectedBoy] || 0) + " Items";
  }
}

// Initial Call
updateBoyStockCard();

// --- Sidebar Logic ---
function toggleMenu() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// --- Dummy Godown Stock Data ---
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
  if (window.lucide) window.lucide.createIcons();
}
renderTable(stockData);

// --- Filter Logic ---
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

// Listen for Boy Dropdown Change
if (boyStockFilter) {
  boyStockFilter.addEventListener("change", updateBoyStockCard);
}

// --- MODAL LOGIC ---
function openModal(modal) {
  if (modal) modal.classList.add("active");
}
function closeModalFunction(modal) {
  if (modal) modal.classList.remove("active");
}

if (assignBtn && assignModal)
  assignBtn.addEventListener("click", () => openModal(assignModal));
if (returnBtn && returnModal)
  returnBtn.addEventListener("click", () => openModal(returnModal));
if (damageBtn && damageModal)
  damageBtn.addEventListener("click", () => openModal(damageModal));

closeButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const modalId = e.target.getAttribute("data-target");
    const modalToClose = document.getElementById(modalId);
    closeModalFunction(modalToClose);
  });
});

window.onclick = function (event) {
  if (event.target.classList.contains("modal-overlay")) {
    event.target.classList.remove("active");
  }
};

// --- FORM SUBMIT LOGIC ---

// 1. ASSIGN STOCK LOGIC
if (assignForm) {
  assignForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const boy = assignBoySelect.value;
    const qty = parseInt(assignQtyInput.value);

    if (boy && qty > 0) {
      // Logic: Increase boy's stock
      if (boysStockData[boy] !== undefined) {
        boysStockData[boy] += qty;
      } else {
        boysStockData[boy] = qty;
      }

      updateBoyStockCard(); // Update UI
      alert(`Assigned ${qty} items to ${boy}.`);
      assignForm.reset();
      closeModalFunction(assignModal);
    } else {
      alert("Please select a boy and valid quantity.");
    }
  });
}

// 2. RETURN STOCK LOGIC
if (returnForm) {
  returnForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const boy = returnBoySelect.value;
    const qty = parseInt(returnQtyInput.value);

    if (boy && qty > 0) {
      // Logic: Decrease boy's stock
      if (boysStockData[boy] !== undefined && boysStockData[boy] >= qty) {
        boysStockData[boy] -= qty;
        updateBoyStockCard(); // Update UI
        alert(`Returned ${qty} items from ${boy}.`);
        returnForm.reset();
        closeModalFunction(returnModal);
      } else {
        alert(`Error: ${boy} only has ${boysStockData[boy]} items!`);
      }
    } else {
      alert("Please select a boy and valid quantity.");
    }
  });
}

// 3. DAMAGED LOGIC
if (resetDamageBtn) {
  resetDamageBtn.addEventListener("click", () => {
    if (confirm("Reset damaged count to 0?")) {
      totalDamagedCount = 0;
      if (totalDamagedEl)
        totalDamagedEl.innerText = totalDamagedCount + " Items";
    }
  });
}

if (damageForm) {
  damageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const qty = parseInt(damageQtyInput.value);

    if (qty > 0) {
      totalDamagedCount += qty;
      if (totalDamagedEl)
        totalDamagedEl.innerText = totalDamagedCount + " Items";

      alert(`Recorded ${qty} Damaged Items!`);
      damageForm.reset();
      closeModalFunction(damageModal);
    } else {
      alert("Please enter a valid quantity!");
    }
  });
}

if (window.lucide) window.lucide.createIcons();
