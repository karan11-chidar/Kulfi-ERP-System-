// Path: public/js/manager/staff/backend/staffController.js

window.StaffController = {
  currentStaffList: [],

  init: function () {
    console.log("🚀 Controller: Starting Engines...");
    this.setupDataStream();
    this.setupEventListeners();
  },

  // 1. Service se Data mango
  setupDataStream: function () {
    StaffService.subscribeToStaffList(
      (data) => {
        this.currentStaffList = data; // Data store kar lo
        console.log("🔥 Data Received:", data.length);
        this.applyFilters(); // Table update karo

        if (window.StaffUI) window.StaffUI.hideLoader();
      },
      (error) => {
        console.error(error);
        alert("Data Error: Check Console");
      },
    );
  },

  // 2. Filters Handle karo (UI Logic)
  applyFilters: function () {
    const searchInput = document.getElementById("staff-search");
    const roleFilter = document.getElementById("filter-role");

    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedRole = roleFilter ? roleFilter.value : "all";

    const filteredList = this.currentStaffList.filter((staff) => {
      const matchesSearch =
        (staff.name || "").toLowerCase().includes(query) ||
        (staff.email || "").toLowerCase().includes(query);
      const matchesRole = selectedRole === "all" || staff.role === selectedRole;
      return matchesSearch && matchesRole;
    });

    if (window.StaffUI) {
      window.StaffUI.renderTable(filteredList);
      window.StaffUI.updateStats(filteredList);
    }
  },

  // 3. Listeners (Buttons)
  setupEventListeners: function () {
    // Search & Filter
    document
      .getElementById("staff-search")
      ?.addEventListener("input", () => this.applyFilters());
    document
      .getElementById("filter-role")
      ?.addEventListener("change", () => this.applyFilters());

    // Modals Open/Close
    document
      .getElementById("btn-add-staff")
      ?.addEventListener("click", () => this.openAddModal());
    document
      .getElementById("close-staff-modal")
      ?.addEventListener("click", () => this.closeModal("staff-modal"));
    document
      .getElementById("close-advance-modal")
      ?.addEventListener("click", () => this.closeModal("advance-modal"));

    // Forms Submit
    document
      .getElementById("staff-form")
      ?.addEventListener("submit", (e) => this.handleStaffSave(e));
    document
      .getElementById("advance-form")
      ?.addEventListener("submit", (e) => this.handleWalletUpdate(e));
  },

  // --- Actions ---

  handleStaffSave: async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector("button[type='submit']");
    this.toggleButtonLoading(btn, true);

    try {
      const id = document.getElementById("staff-id").value;
      const email = document.getElementById("staff-email").value;
      const password = document.getElementById("staff-password").value;

      const staffData = {
        name: document.getElementById("staff-name").value,
        role: document.getElementById("staff-role").value,
        mobile: document.getElementById("staff-mobile").value,
        salary: Number(document.getElementById("staff-salary").value),
        joining_date: document.getElementById("staff-date").value,
        status: document.getElementById("staff-status").value,
      };

      // 🔥 Service ko call karo (Backend ka kaam wo karega)
      await StaffService.saveStaffData(staffData, id, email, password);

      alert(id ? "✅ Staff Updated!" : "✅ New Staff Created!");
      this.closeModal("staff-modal");
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      this.toggleButtonLoading(btn, false);
    }
  },

  handleWalletUpdate: async function (e) {
    e.preventDefault();
    const id = document.getElementById("advance-staff-id").value;
    const amount = Number(document.getElementById("advance-amount").value);
    const action = document.querySelector(
      'input[name="adv_action"]:checked',
    ).value;

    if (!amount || amount <= 0) return alert("Enter valid amount");

    try {
      // 🔥 Service Call
      await StaffService.updateAdvance(id, amount, action);
      alert("✅ Wallet Updated!");
      this.closeModal("advance-modal");
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  },

  deleteStaff: async function (id) {
    if (confirm("Are you sure to delete?")) {
      try {
        // 🔥 Service Call
        await StaffService.deleteStaffById(id);
        // Alert ki jarurat nahi, Listener apne aap table update kar dega
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  },

  // --- UI Helpers ---

  openAddModal: function () {
    document.getElementById("staff-form").reset();
    document.getElementById("staff-id").value = "";
    document
      .getElementById("staff-password")
      .closest(".form-group").parentElement.style.display = "flex";
    document.getElementById("modal-title").innerText = "Add New Staff";
    document.getElementById("staff-modal").classList.add("active");
  },

  openEditModal: function (id) {
    const staff = this.currentStaffList.find((s) => s.id === id);
    if (!staff) return;

    // Fill Form
    document.getElementById("staff-id").value = staff.id;
    document.getElementById("staff-name").value = staff.name;
    document.getElementById("staff-email").value = staff.email;
    document.getElementById("staff-email").readOnly = true;
    document
      .getElementById("staff-password")
      .closest(".form-group").parentElement.style.display = "none";
    document.getElementById("staff-role").value = staff.role;
    document.getElementById("staff-mobile").value = staff.mobile;
    document.getElementById("staff-salary").value = staff.salary;
    document.getElementById("staff-date").value = staff.joining_date;
    document.getElementById("staff-status").value = staff.status;

    document.getElementById("modal-title").innerText = "Edit Staff";
    document.getElementById("staff-modal").classList.add("active");
  },

  openAdvanceModal: function (id) {
    const staff = this.currentStaffList.find((s) => s.id === id);
    if (!staff) return;
    document.getElementById("advance-staff-id").value = staff.id;
    document.getElementById("advance-staff-name").value = staff.name;
    document.getElementById("current-advance-display").value =
      "₹" + (staff.advance || 0).toLocaleString();
    document.getElementById("advance-amount").value = "";
    document.getElementById("advance-modal").classList.add("active");
  },

  closeModal: function (modalId) {
    document.getElementById(modalId).classList.remove("active");
  },

  toggleButtonLoading: function (btn, isLoading) {
    if (isLoading) {
      btn.dataset.text = btn.innerText;
      btn.innerText = "Processing...";
      btn.disabled = true;
    } else {
      btn.innerText = btn.dataset.text || "Save";
      btn.disabled = false;
    }
  },
};
