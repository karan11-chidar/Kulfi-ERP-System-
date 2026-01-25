// Path: public/js/manager/staff/ui/staffUI.js

window.StaffUI = {
  // 1. Sare Elements ka Reference
  elements: {
    loader: document.getElementById("auth-loader"),
    tableBody: document.getElementById("staff-table-body"),

    // Stats Cards
    totalStaffEl: document.getElementById("total-staff-count"),
    activeStaffEl: document.getElementById("active-staff-count"),
    totalAdvanceEl: document.getElementById("total-advance-count"),

    // Modals & Buttons
    staffModal: document.getElementById("staff-modal"),
    btnAddStaff: document.getElementById("btn-add-staff"),
    closeStaffBtn: document.getElementById("close-staff-modal"),
    staffForm: document.getElementById("staff-form"),
    modalTitle: document.getElementById("modal-title"),

    advanceModal: document.getElementById("advance-modal"),
    closeAdvanceBtn: document.getElementById("close-advance-modal"),
    advanceForm: document.getElementById("advance-form"),
  },

  // 2. Init Function
  init: function () {
    console.log("🎨 StaffUI: Visuals Ready");
    this.setupEventListeners();
  },

  // 3. Table Render Karna (Data -> HTML)
  renderTable: function (staffList) {
    const tbody = this.elements.tableBody;
    tbody.innerHTML = ""; // Purana data saaf karo

    if (staffList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No staff found</td></tr>`;
      return;
    }

    staffList.forEach((staff) => {
      // Status ka color decide karo
      let statusClass = "inactive";
      if (staff.status === "active" || staff.status === "Active")
        statusClass = "active";
      if (staff.status === "On Leave") statusClass = "leave";

      // Advance aur Salary ko Number me badlo (Safety ke liye)
      const salary = Number(staff.salary || 0).toLocaleString();
      const advance = Number(staff.advance || 0).toLocaleString();

      const row = `
                <tr>
                    <td>
                        <strong>${staff.name}</strong><br>
                        <span style="font-size:11px; color:#777;">${staff.email}</span>
                    </td>
                    <td>${staff.role}</td>
                    <td>${staff.mobile}</td>
                    <td>₹${salary}</td>
                    <td style="color: #e74c3c; font-weight:600;">₹${advance}</td>
                    <td><span class="status-badge ${statusClass}">${staff.status}</span></td>
                    <td>
                        <div class="action-icons">
                            <i data-lucide="wallet" style="color: #2196f3;" 
                               onclick="window.StaffController.openAdvanceModal('${staff.id}')" 
                               title="Manage Advance"></i>
                            
                            <i data-lucide="edit" 
                               onclick="window.StaffController.openEditModal('${staff.id}')" 
                               title="Edit Details"></i>
                            
                            <i data-lucide="trash-2" class="delete" 
                               onclick="window.StaffController.deleteStaff('${staff.id}')" 
                               title="Delete Staff"></i>
                        </div>
                    </td>
                </tr>
            `;
      tbody.innerHTML += row;
    });

    // Icons ko refresh karo (Warna naye icons dikhenge nahi)
    if (window.lucide) window.lucide.createIcons();
  },

  // 4. Stats Cards Update Karna
  updateStats: function (staffList) {
    const total = staffList.length;
    // Sirf Active walo ko count karo
    const active = staffList.filter(
      (s) => s.status === "active" || s.status === "Active",
    ).length;
    // Total Advance jodo
    const totalAdv = staffList.reduce(
      (sum, s) => sum + (Number(s.advance) || 0),
      0,
    );

    if (this.elements.totalStaffEl)
      this.elements.totalStaffEl.innerText = total;
    if (this.elements.activeStaffEl)
      this.elements.activeStaffEl.innerText = active;
    if (this.elements.totalAdvanceEl)
      this.elements.totalAdvanceEl.innerText = "₹" + totalAdv.toLocaleString();
  },

  // 5. Helpers (Loader & Modal)
  hideLoader: function () {
    if (this.elements.loader) this.elements.loader.style.display = "none";
  },

  showTableLoading: function () {
    this.elements.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Loading Staff Data...</td></tr>`;
  },

  // 6. Event Listeners (Modal Open/Close Handle karna)
  setupEventListeners: function () {
    const el = this.elements;

    // Open Add Modal
    if (el.btnAddStaff) {
      el.btnAddStaff.addEventListener("click", () => {
        el.staffModal.classList.add("active");
        el.modalTitle.innerText = "Add New Staff";
        el.staffForm.reset();
        // Controller ko batao ki hum "Add Mode" me hain (ID clear karo)
        document.getElementById("staff-id").value = "";
        document.getElementById("staff-email").readOnly = false;
      });
    }

    // Close Staff Modal
    if (el.closeStaffBtn) {
      el.closeStaffBtn.addEventListener("click", () =>
        el.staffModal.classList.remove("active"),
      );
    }

    // Close Advance Modal
    if (el.closeAdvanceBtn) {
      el.closeAdvanceBtn.addEventListener("click", () =>
        el.advanceModal.classList.remove("active"),
      );
    }

    // Overlay Click (Modal band karne ke liye)
    window.onclick = (event) => {
      if (event.target === el.staffModal)
        el.staffModal.classList.remove("active");
      if (event.target === el.advanceModal)
        el.advanceModal.classList.remove("active");
    };
  },
};
