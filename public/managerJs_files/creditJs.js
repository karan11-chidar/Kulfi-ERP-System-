// --- DOM Elements ---
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-sidebar");
const tableBody = document.getElementById("credit-table-body");
const searchInput = document.getElementById("credit-search");
const sortSelect = document.getElementById("sort-credit");

// Stats Elements
const totalCreditEl = document.getElementById("total-credit-display");
const todayCreditEl = document.getElementById("today-credit-display");
const weekCreditEl = document.getElementById("week-credit-display");

// Update Modal Elements
const creditModal = document.getElementById("credit-modal");
const closeCreditModalBtn = document.getElementById("close-credit-modal");
const updateForm = document.getElementById("update-credit-form");
const modalShopName = document.getElementById("modal-shop-name");
const modalCurrentCredit = document.getElementById("modal-current-credit");
const modalAmount = document.getElementById("modal-amount");

// Add New Shop Modal Elements
const addShopModal = document.getElementById("add-shop-modal");
const btnAddShopCredit = document.getElementById("btn-add-shop-credit");
const closeAddShopModalBtn = document.getElementById("close-add-shop-modal");
const addShopForm = document.getElementById("add-shop-form");

// --- Sidebar Logic ---
function toggleMenu() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// --- Dummy Credit Data ---
let creditData = [
  {
    id: 1,
    name: "Gupta Kirana Store",
    mobile: "98765 43210",
    address: "Indore",
    credit: 15000,
    last_updated: "Today, 10:30 AM",
  },
  {
    id: 2,
    name: "Sharma General Store",
    mobile: "91234 56789",
    address: "Dewas",
    credit: 8500,
    last_updated: "Yesterday",
  },
  {
    id: 3,
    name: "Verma Dairy",
    mobile: "88997 76655",
    address: "Bhopal",
    credit: 3200,
    last_updated: "2 days ago",
  },
  {
    id: 4,
    name: "Sai Ram Parlour",
    mobile: "77788 99900",
    address: "Indore",
    credit: 1200,
    last_updated: "1 week ago",
  },
];

// --- Stats Logic ---
function updateStats() {
  let total = creditData.reduce((sum, item) => sum + item.credit, 0);
  if (totalCreditEl) totalCreditEl.innerText = "₹" + total.toLocaleString();
  if (todayCreditEl) todayCreditEl.innerText = "₹2,500"; // Dummy Dynamic
  if (weekCreditEl) weekCreditEl.innerText = "₹12,800"; // Dummy Dynamic
}

// --- Render Table ---
function renderTable(data) {
  tableBody.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No records found</td></tr>`;
    return;
  }

  data.forEach((shop) => {
    const row = `
            <tr>
                <td><strong>${shop.name}</strong></td>
                <td>${shop.mobile}</td>
                <td>${shop.address}</td>
                <td class="credit-val">₹${shop.credit.toLocaleString()}</td>
                <td>${shop.last_updated}</td>
                <td>
                    <button class="btn-action" onclick="openUpdateModal(${
                      shop.id
                    })">Update</button>
                </td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });

  updateStats();
  if (window.lucide) window.lucide.createIcons();
}

// Initial Render
renderTable(creditData);

// --- Filter & Search Logic ---
function filterAndSortData() {
  const term = searchInput.value.toLowerCase();
  const sortType = sortSelect.value;

  let filtered = creditData.filter(
    (shop) =>
      shop.name.toLowerCase().includes(term) || shop.mobile.includes(term)
  );

  if (sortType === "high") {
    filtered.sort((a, b) => b.credit - a.credit);
  } else if (sortType === "low") {
    filtered.sort((a, b) => a.credit - b.credit);
  } else if (sortType === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderTable(filtered);
}

if (searchInput) searchInput.addEventListener("keyup", filterAndSortData);
if (sortSelect) sortSelect.addEventListener("change", filterAndSortData);

// --- MODAL 1: UPDATE EXISTING CREDIT ---
window.openUpdateModal = function (id) {
  const shop = creditData.find((s) => s.id === id);
  if (shop) {
    modalShopName.value = shop.name;
    modalCurrentCredit.value = "₹" + shop.credit.toLocaleString();
    creditModal.classList.add("active");
    creditModal.setAttribute("data-id", id);
  }
};

if (closeCreditModalBtn) {
  closeCreditModalBtn.addEventListener("click", () => {
    creditModal.classList.remove("active");
  });
}

if (updateForm) {
  updateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseInt(modalAmount.value);
    const action = document.querySelector('input[name="action"]:checked').value;
    const id = parseInt(creditModal.getAttribute("data-id"));

    const shopIndex = creditData.findIndex((s) => s.id === id);

    if (shopIndex > -1) {
      if (action === "receive") {
        creditData[shopIndex].credit -= amount;
        alert(`Payment of ₹${amount} Received!`);
      } else {
        creditData[shopIndex].credit += amount;
        alert(`Credit of ₹${amount} Added.`);
      }
      creditData[shopIndex].last_updated = "Just now";
      renderTable(creditData);
    }

    creditModal.classList.remove("active");
    updateForm.reset();
  });
}

// --- MODAL 2: ADD NEW SHOP CREDIT (NEW LOGIC) ---
if (btnAddShopCredit) {
  btnAddShopCredit.addEventListener("click", () => {
    addShopModal.classList.add("active");
  });
}

if (closeAddShopModalBtn) {
  closeAddShopModalBtn.addEventListener("click", () => {
    addShopModal.classList.remove("active");
  });
}

if (addShopForm) {
  addShopForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get Values
    const name = document.getElementById("new-shop-name").value;
    const mobile = document.getElementById("new-shop-mobile").value;
    const address = document.getElementById("new-shop-address").value;
    const credit = parseInt(document.getElementById("new-shop-credit").value);

    // Create New Object
    const newShop = {
      id: creditData.length + 1, // Simple ID gen
      name: name,
      mobile: mobile,
      address: address,
      credit: credit,
      last_updated: "Just now",
    };

    // Add to Data
    creditData.push(newShop);

    alert("New Shop Added Successfully!");

    // Refresh Table
    renderTable(creditData);

    // Close Modal & Reset
    addShopModal.classList.remove("active");
    addShopForm.reset();
  });
}

// Close Modals on Outside Click
window.onclick = function (event) {
  if (event.target === creditModal) {
    creditModal.classList.remove("active");
  }
  if (event.target === addShopModal) {
    addShopModal.classList.remove("active");
  }
};

// Initial Icons Load
if (window.lucide) window.lucide.createIcons();
