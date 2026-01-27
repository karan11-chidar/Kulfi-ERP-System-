// Path: public/js/manager/staff/backend/staffController.js

window.StaffController = {
  currentStaffList: [],

  init: function () {
    console.log("👨‍🍳 StaffController: Single-Execution Mode...");
    this.loadStaffList();
    this.setupEventListeners();
  },

  // 1. Data Lana
  loadStaffList: async function () {
    try {
      const snapshot = await StaffService.getAllStaff();
      this.currentStaffList = [];
      snapshot.forEach((doc) => {
        this.currentStaffList.push({ id: doc.id, ...doc.data() });
      });
      console.log(`🔥 Loaded ${this.currentStaffList.length} staff members`);
      this.applyFilters();
      if (window.StaffUI) window.StaffUI.hideLoader();
    } catch (error) {
      console.error(error);
    }
  },

  // 2. Filters
  applyFilters: function () {
    const searchInput = document.getElementById("staff-search");
    const roleFilter = document.getElementById("filter-role");

    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedRole = roleFilter ? roleFilter.value : "all";

    const filtered = this.currentStaffList.filter((staff) => {
      const matchesSearch =
        (staff.name || "").toLowerCase().includes(query) ||
        (staff.email || "").toLowerCase().includes(query);
      const matchesRole = selectedRole === "all" || staff.role === selectedRole;
      return matchesSearch && matchesRole;
    });

    if (window.StaffUI) {
      window.StaffUI.renderTable(filtered);
      window.StaffUI.updateStats(filtered);
    }
  },

  // 3. Listeners (NUCLEAR FIX ☢️)
  setupEventListeners: function () {
    // Inputs
    const searchInput = document.getElementById("staff-search");
    if (searchInput) searchInput.oninput = () => this.applyFilters();

    const roleFilter = document.getElementById("filter-role");
    if (roleFilter) roleFilter.onchange = () => this.applyFilters();

    // Buttons
    const addBtn = document.getElementById("btn-add-staff");
    if (addBtn) addBtn.onclick = () => this.openAddModal();

    const closeStaff = document.getElementById("close-staff-modal");
    if (closeStaff) closeStaff.onclick = () => this.closeModal("staff-modal");

    const closeAdv = document.getElementById("close-advance-modal");
    if (closeAdv) closeAdv.onclick = () => this.closeModal("advance-modal");

    // Forms (BRAHMASTRA FIX: using .onsubmit instead of .addEventListener)
    // Isse duplicate listener ka sawal hi paida nahi hota.
    const staffForm = document.getElementById("staff-form");
    if (staffForm) {
      staffForm.onsubmit = (e) => this.handleStaffSave(e);
    }

    const advanceForm = document.getElementById("advance-form");
    if (advanceForm) {
      advanceForm.onsubmit = (e) => this.handleWalletUpdate(e);
    }
  },

  // 4. Save Staff Logic
  handleStaffSave: async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector("button[type='submit']");
    if (btn.disabled) return; // Extra Safety

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

      const savedId = await StaffService.saveStaffData(
        staffData,
        id,
        email,
        password,
      );

      if (id) {
        // Local Update
        const index = this.currentStaffList.findIndex((s) => s.id === id);
        if (index !== -1)
          this.currentStaffList[index] = {
            ...this.currentStaffList[index],
            ...staffData,
          };
        alert("✅ Staff Updated!");
      } else {
        // Local Add
        this.currentStaffList.push({
          id: savedId,
          email: email,
          advance: 0,
          ...staffData,
        });
        alert("✅ New Staff Created!");
      }

      this.applyFilters();
      this.closeModal("staff-modal");
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      this.toggleButtonLoading(btn, false);
    }
  },

  // 5. Wallet Logic (Fixed Forever 🔒)
  handleWalletUpdate: async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector("button[type='submit']");

    // Safety Check: Agar button pehle se disabled hai, to ruk jao
    if (btn.disabled) return;

    // Button Lock Karo
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Updating...";

    try {
      const id = document.getElementById("advance-staff-id").value;
      const amount = Number(document.getElementById("advance-amount").value);
      const action = document.querySelector(
        'input[name="adv_action"]:checked',
      ).value;

      if (!amount || amount <= 0) throw new Error("Enter valid amount");

      // Server Call (Sirf 1 baar jayega)
      const newBalance = await StaffService.updateAdvance(id, amount, action);

      // Local Memory Update
      const index = this.currentStaffList.findIndex((s) => s.id === id);
      if (index !== -1) {
        this.currentStaffList[index].advance = newBalance;
      }

      alert("✅ Wallet Updated!");
      this.applyFilters();
      this.closeModal("advance-modal");
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      // Button Unlock
      btn.disabled = false;
      btn.innerText = originalText;
    }
  },

  // 6. Delete Logic
  deleteStaff: async function (id) {
    if (confirm("Are you sure?")) {
      try {
        await StaffService.deleteStaffById(id);
        this.currentStaffList = this.currentStaffList.filter(
          (s) => s.id !== id,
        );
        this.applyFilters();
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  },

  // Helpers
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
