// --- DOM Elements ---
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-sidebar");
const tableBody = document.getElementById("staff-table-body");
const searchInput = document.getElementById("staff-search");
const filterRole = document.getElementById("filter-role");

// Stats Elements
const totalStaffEl = document.getElementById("total-staff-count");
const activeStaffEl = document.getElementById("active-staff-count");
const totalAdvanceEl = document.getElementById("total-advance-count");

// Staff Modal Elements
const staffModal = document.getElementById("staff-modal");
const btnAddStaff = document.getElementById("btn-add-staff");
const closeStaffModalBtn = document.getElementById("close-staff-modal");
const staffForm = document.getElementById("staff-form");
const modalTitle = document.getElementById("modal-title");

// Advance Modal Elements
const advanceModal = document.getElementById("advance-modal");
const closeAdvanceModalBtn = document.getElementById("close-advance-modal");
const advanceForm = document.getElementById("advance-form");
const advanceStaffId = document.getElementById("advance-staff-id");
const advanceStaffName = document.getElementById("advance-staff-name");
const currentAdvanceDisplay = document.getElementById(
  "current-advance-display"
);
const advanceAmount = document.getElementById("advance-amount");

// Form Inputs (Staff)
const inputId = document.getElementById("staff-id");
const inputName = document.getElementById("staff-name");
const inputEmail = document.getElementById("staff-email");
const inputPassword = document.getElementById("staff-password");
const inputRole = document.getElementById("staff-role");
const inputMobile = document.getElementById("staff-mobile");
const inputSalary = document.getElementById("staff-salary"); // New
const inputDate = document.getElementById("staff-date");
const inputStatus = document.getElementById("staff-status");

// --- Sidebar Logic ---
function toggleMenu() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// --- Dummy Staff Data (Updated with Salary & Advance) ---
let staffData = [
  {
    id: 1,
    name: "Ramesh Kumar",
    email: "ramesh@kulfi.com",
    password: "123",
    role: "Delivery Boy",
    mobile: "9876543210",
    salary: 15000,
    advance: 2000,
    joining_date: "2023-05-12",
    status: "Active",
  },
  {
    id: 2,
    name: "Suresh Singh",
    email: "suresh@kulfi.com",
    password: "123",
    role: "Delivery Boy",
    mobile: "9123456789",
    salary: 14500,
    advance: 0,
    joining_date: "2023-08-20",
    status: "Active",
  },
  {
    id: 3,
    name: "Rahul Verma",
    email: "rahul@kulfi.com",
    password: "admin",
    role: "Manager",
    mobile: "8899776655",
    salary: 25000,
    advance: 5000,
    joining_date: "2022-01-10",
    status: "On Leave",
  },
];

// --- Update Stats ---
function updateStats() {
  const total = staffData.length;
  const active = staffData.filter((s) => s.status === "Active").length;
  // Calculate Total Advance Given
  const totalAdv = staffData.reduce(
    (sum, item) => sum + (item.advance || 0),
    0
  );

  if (totalStaffEl) totalStaffEl.innerText = total;
  if (activeStaffEl) activeStaffEl.innerText = active;
  if (totalAdvanceEl)
    totalAdvanceEl.innerText = "₹" + totalAdv.toLocaleString();
}

// --- Render Table ---
function renderTable(data) {
  tableBody.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No staff found</td></tr>`;
    return;
  }

  data.forEach((staff) => {
    let statusClass = "inactive";
    if (staff.status === "Active") statusClass = "active";
    if (staff.status === "On Leave") statusClass = "leave";

    const row = `
            <tr>
                <td>
                    <strong>${staff.name}</strong><br>
                    <span style="font-size:11px; color:#777;">${
                      staff.email
                    }</span>
                </td>
                <td>${staff.role}</td>
                <td>${staff.mobile}</td>
                <td>₹${staff.salary.toLocaleString()}</td>
                <td style="color: #e74c3c; font-weight:600;">₹${(
                  staff.advance || 0
                ).toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}">${
      staff.status
    }</span></td>
                <td>
                    <div class="action-icons">
                        <i data-lucide="wallet" style="color: #2196f3;" onclick="openAdvanceModal(${
                          staff.id
                        })" title="Manage Payment"></i>
                        <i data-lucide="edit" onclick="openEditModal(${
                          staff.id
                        })" title="Edit Details"></i>
                        <i data-lucide="trash-2" class="delete" onclick="deleteStaff(${
                          staff.id
                        })" title="Delete"></i>
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
renderTable(staffData);

// --- Filter Logic ---
function filterData() {
  const term = searchInput.value.toLowerCase();
  const role = filterRole.value;

  const filtered = staffData.filter((staff) => {
    const matchesTerm =
      staff.name.toLowerCase().includes(term) ||
      staff.role.toLowerCase().includes(term) ||
      staff.email.toLowerCase().includes(term);
    const matchesRole = role === "all" || staff.role === role;
    return matchesTerm && matchesRole;
  });

  renderTable(filtered);
}

if (searchInput) searchInput.addEventListener("keyup", filterData);
if (filterRole) filterRole.addEventListener("change", filterData);

// --- STAFF Modal Logic ---
function openModal() {
  staffModal.classList.add("active");
}
function closeModal() {
  staffModal.classList.remove("active");
  staffForm.reset();
  inputId.value = "";
  modalTitle.innerText = "Add New Staff";
  inputEmail.readOnly = false;
}

if (btnAddStaff) {
  btnAddStaff.addEventListener("click", () => {
    modalTitle.innerText = "Add New Staff";
    inputId.value = "";
    openModal();
  });
}

if (closeStaffModalBtn)
  closeStaffModalBtn.addEventListener("click", closeModal);

// --- Add / Edit Logic ---
staffForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = inputId.value;

  const staffObj = {
    id: id ? parseInt(id) : Date.now(),
    name: inputName.value,
    email: inputEmail.value,
    password: inputPassword.value,
    role: inputRole.value,
    mobile: inputMobile.value,
    salary: parseInt(inputSalary.value) || 0, // Save Salary
    advance: id ? staffData.find((s) => s.id == id).advance : 0, // Keep old advance or 0
    joining_date: inputDate.value,
    status: inputStatus.value,
  };

  if (id) {
    const index = staffData.findIndex((s) => s.id == id);
    if (index > -1) {
      staffData[index] = staffObj;
      alert("Staff Details Updated!");
    }
  } else {
    staffData.push(staffObj);
    alert(
      `New Staff Created!\nID: ${staffObj.email}\nPass: ${staffObj.password}`
    );
  }

  renderTable(staffData);
  closeModal();
});

// --- ADVANCE Modal Logic ---
window.openAdvanceModal = function (id) {
  const staff = staffData.find((s) => s.id === id);
  if (staff) {
    advanceStaffId.value = staff.id;
    advanceStaffName.value = staff.name;
    currentAdvanceDisplay.value = "₹" + (staff.advance || 0).toLocaleString();
    advanceModal.classList.add("active");
  }
};

if (closeAdvanceModalBtn) {
  closeAdvanceModalBtn.addEventListener("click", () => {
    advanceModal.classList.remove("active");
  });
}

// Handle Advance Form Submit
advanceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = parseInt(advanceStaffId.value);
  const amount = parseInt(advanceAmount.value);
  const action = document.querySelector(
    'input[name="adv_action"]:checked'
  ).value;

  const index = staffData.findIndex((s) => s.id === id);
  if (index > -1) {
    if (action === "give") {
      staffData[index].advance = (staffData[index].advance || 0) + amount;
      alert(`Advance of ₹${amount} given to ${staffData[index].name}.`);
    } else {
      // Recover logic
      if (staffData[index].advance >= amount) {
        staffData[index].advance -= amount;
        alert(`Recovered ₹${amount} from ${staffData[index].name}.`);
      } else {
        alert("Error: Cannot recover more than current balance!");
        return;
      }
    }
    renderTable(staffData);
    advanceModal.classList.remove("active");
    advanceForm.reset();
  }
});

// --- Edit & Delete Functions ---
window.openEditModal = function (id) {
  const staff = staffData.find((s) => s.id === id);
  if (staff) {
    inputId.value = staff.id;
    inputName.value = staff.name;
    inputEmail.value = staff.email;
    inputPassword.value = staff.password;
    inputRole.value = staff.role;
    inputMobile.value = staff.mobile;
    inputSalary.value = staff.salary; // Fill Salary
    inputDate.value = staff.joining_date;
    inputStatus.value = staff.status;

    modalTitle.innerText = "Edit Staff Details";
    openModal();
  }
};

window.deleteStaff = function (id) {
  if (confirm("Are you sure you want to delete this staff member?")) {
    staffData = staffData.filter((s) => s.id !== id);
    renderTable(staffData);
  }
};

// Close Modals on Outside Click
window.onclick = function (event) {
  if (event.target === staffModal) closeModal();
  if (event.target === advanceModal) advanceModal.classList.remove("active");
};

if (window.lucide) window.lucide.createIcons();
