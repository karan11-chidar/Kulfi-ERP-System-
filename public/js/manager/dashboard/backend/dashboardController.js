window.DashboardController = {
  init: async function () {
    if (window.DashboardUI) window.DashboardUI.showLoader();

    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. Fetch Data
      const [salesSnap, expenseSnap, products, shopsSnap, usersSnap] =
        await Promise.all([
          // Sales & Expense (Optimized: Sirf Aaj ka)
          db.collection("sales").where("date", "==", today).get(),
          db.collection("expenses").where("date", "==", today).get(),

          // Stock (Standard fetch)
          StockService.getGodownStock(),

          // 🔥 OPTIMIZED: Sirf Udhaar wali dukaanein mangwao (Bachaat!)
          db.collection("shops").where("currentCredit", ">", 0).get(),

          // Active Boys
          db.collection("users").where("role", "==", "delivery_boy").get(),
        ]);

      // ... (Sales & Stock Calculation Logic Same rahega) ...
      const todaySales = salesSnap.docs.map((doc) => doc.data());
      const todayExpenses = expenseSnap.docs.map((doc) => doc.data());
      const stockList = Array.isArray(products) ? products : [];

      // Totals Calculation
      const salesTotal = todaySales.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0,
      );
      // ... (Expenses, Stock totals code same rahega) ...

      let totalPackets = 0,
        totalUnits = 0;
      stockList.forEach((p) => {
        const qty = Number(p.qty) || 0;
        const size = Number(p.packetSize) || 1;
        totalUnits += qty;
        totalPackets += Math.floor(qty / size);
      });

      // 🔥 PENDING CREDIT LOGIC (Simplified & Optimized)
      let totalCredit = 0;
      let pendingShops = [];

      // Ab shopsSnap mein sirf udhaar wali dukaanein hi aayengi
      shopsSnap.forEach((doc) => {
        const s = doc.data();
        const pending = Number(s.currentCredit) || 0;
        // Address logic
        const address = s.address || s.location || s.area || "No Address";

        // Double check (waise query filter kar chuka hai)
        if (pending > 0) {
          totalCredit += pending;
          pendingShops.push({
            name: s.shopName || s.name || "Unknown",
            address: address,
            mobile: s.mobile || "",
            amount: pending,
          });
        }
      });

      pendingShops.sort((a, b) => b.amount - a.amount);
      const topPending = pendingShops.slice(0, 5);
      const activeBoys = usersSnap.size;

      // Update UI
      if (window.DashboardUI) {
        window.DashboardUI.updateDashboard({
          stockPackets: totalPackets,
          stockUnits: totalUnits,
          salesToday: salesTotal,
          totalCredit: totalCredit,
          activeBoys: activeBoys,
          topPending: topPending,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (window.DashboardUI) window.DashboardUI.hideLoader();
    }
  },
};
