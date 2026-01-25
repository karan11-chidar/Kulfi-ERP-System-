// --- DOM Elements ---
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-sidebar");
const tableBody = document.getElementById("shops-table-body");
const searchInput = document.getElementById("shop-search");
const filterStatus = document.getElementById("filter-status");

// Stats Elements
const totalShopsEl = document.getElementById("total-shops-count");
const activeShopsEl = document.getElementById("active-shops-count");
const inactiveShopsEl = document.getElementById("inactive-shops-count");

// Modal Elements
const shopModal = document.getElementById("shop-modal");
const btnAddShop = document.getElementById("btn-add-shop");
const closeModalBtn = document.getElementById("close-shop-modal");
const shopForm = document.getElementById("shop-form");
const modalTitle = document.getElementById("modal-title");

// Form Inputs
const inputId = document.getElementById("shop-id");
const inputName = document.getElementById("shop-name");
const inputOwner = document.getElementById("owner-name");
const inputMobile = document.getElementById("shop-mobile");
const inputStatus = document.getElementById("shop-status");
const inputAddress = document.getElementById("shop-address");

// --- Sidebar Logic ---
function toggleMenu() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// --- Dummy Shops Data ---
let shopsData = [
  {
    id: 1,
    name: "Gupta Kirana",
    owner: "Rajesh Gupta",
    mobile: "9876543210",
    address: "Indore Market",
    status: "Active",
  },
  {
    id: 2,
    name: "Sharma General Store",
    owner: "Amit Sharma",
    mobile: "9123456789",
    address: "Dewas Naka",
    status: "Active",
  },
  {
    id: 3,
    name: "City Cafe",
    owner: "Rahul Verma",
    mobile: "8899776655",
    address: "Bhopal Square",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Om Sai Ram",
    owner: "Suresh Patil",
    mobile: "7778899900",
    address: "Vijay Nagar",
    status: "Active",
  },
];

// --- Update Stats ---
function updateStats() {
  const total = shopsData.length;
  const active = shopsData.filter((s) => s.status === "Active").length;
  const inactive = total - active;

  if (totalShopsEl) totalShopsEl.innerText = total;
  if (activeShopsEl) activeShopsEl.innerText = active;
  if (inactiveShopsEl) inactiveShopsEl.innerText = inactive;
}

// --- Render Table ---
function renderTable(data) {
  tableBody.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No shops found</td></tr>`;
    return;
  }

  data.forEach((shop) => {
    const statusClass = shop.status === "Active" ? "active" : "inactive";

    const row = `
            <tr>
                <td><strong>${shop.name}</strong></td>
                <td>${shop.owner}</td>
                <td>${shop.mobile}</td>
                <td>${shop.address}</td>
                <td><span class="status-badge ${statusClass}">${shop.status}</span></td>
                <td>
                    <div class="action-icons">
                        <i data-lucide="edit" onclick="openEditModal(${shop.id})"></i>
                        <i data-lucide="trash-2" class="delete" onclick="deleteShop(${shop.id})"></i>
                    </div>
                </td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });

  updateStats();
  if (window.lucide) window.lucide.createIcons();
}

// Initial Render
renderTable(shopsData);

// --- Filter Logic ---
function filterData() {
  const term = searchInput.value.toLowerCase();
  const status = filterStatus.value;

  const filtered = shopsData.filter((shop) => {
    const matchesTerm =
      shop.name.toLowerCase().includes(term) || shop.mobile.includes(term);
    const matchesStatus = status === "all" || shop.status === status;
    return matchesTerm && matchesStatus;
  });

  renderTable(filtered);
}

if (searchInput) searchInput.addEventListener("keyup", filterData);
if (filterStatus) filterStatus.addEventListener("change", filterData);

// --- Modal Logic ---
function openModal() {
  shopModal.classList.add("active");
}
function closeModal() {
  shopModal.classList.remove("active");
  shopForm.reset();
  inputId.value = ""; // Clear ID to ensure next op is Add, not Edit
  modalTitle.innerText = "Add New Shop";
}

if (btnAddShop) {
  btnAddShop.addEventListener("click", () => {
    modalTitle.innerText = "Add New Shop";
    inputId.value = "";
    openModal();
  });
}

if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
window.onclick = function (event) {
  if (event.target === shopModal) closeModal();
};

// --- Add / Edit Logic ---
shopForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = inputId.value;

  const shopObj = {
    id: id ? parseInt(id) : Date.now(), // Existing ID or New Timestamp ID
    name: inputName.value,
    owner: inputOwner.value,
    mobile: inputMobile.value,
    address: inputAddress.value,
    status: inputStatus.value,
  };

  if (id) {
    // Update Existing
    const index = shopsData.findIndex((s) => s.id == id);
    if (index > -1) {
      shopsData[index] = shopObj;
      alert("Shop Details Updated!");
    }
  } else {
    // Add New
    shopsData.push(shopObj);
    alert("New Shop Added Successfully!");
  }

  renderTable(shopsData);
  closeModal();
});

// --- Edit & Delete Functions (Global Scope) ---
window.openEditModal = function (id) {
  const shop = shopsData.find((s) => s.id === id);
  if (shop) {
    inputId.value = shop.id;
    inputName.value = shop.name;
    inputOwner.value = shop.owner;
    inputMobile.value = shop.mobile;
    inputAddress.value = shop.address;
    inputStatus.value = shop.status;

    modalTitle.innerText = "Edit Shop Details";
    openModal();
  }
};

window.deleteShop = function (id) {
  if (confirm("Are you sure you want to delete this shop?")) {
    shopsData = shopsData.filter((s) => s.id !== id);
    renderTable(shopsData);
  }
};

// Initial Icon Load
if (window.lucide) window.lucide.createIcons();
