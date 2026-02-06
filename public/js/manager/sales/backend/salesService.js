window.SalesService = {
  // --- 1. GET SALES (Smart Filter - No Index Error) ---
  getSales: async function (lastDoc, limitCount = 10, filters = {}) {
    try {
      let q = db.collection("sales");
      let applySort = true; // Default sorting on

      // 1. Date Filter
      if (filters.date) {
        q = q.where("date", "==", filters.date);
      }

      // 2. Boy Filter
      if (filters.boy && filters.boy !== "all") {
        q = q.where("deliveryBoy", "==", filters.boy);
        // Note: Jab Date aur Boy dono filter hon, toh sorting hata di hai taaki error na aaye
        applySort = false;
      }

      // 3. Payment Filter (Smart Case Check)
      if (filters.payment && filters.payment !== "all") {
        // 'Online' aur 'online' dono check karega
        const val = filters.payment.toLowerCase();
        const valTitle = val.charAt(0).toUpperCase() + val.slice(1);
        q = q.where("paymentType", "in", [val, valTitle]);
        applySort = false;
      }

      // 4. Sorting (Sirf tab lagao jab simple query ho, taaki Index Error na aaye)
      if (applySort) {
        q = q.orderBy("timestamp", "desc");
      }

      // 5. Pagination
      if (lastDoc) {
        q = q.startAfter(lastDoc);
      }

      q = q.limit(limitCount);

      return await q.get();
    } catch (error) {
      console.error("Sales Fetch Error:", error);
      // Agar error aaye (Index wala), toh user ko alert mat karo, bas empty list bhej do
      return { empty: true, docs: [] };
    }
  },

  // --- 2. GET PURCHASES ---
  getPurchases: async function (lastDoc, limitCount = 10, filters = {}) {
    try {
      let q = db.collection("purchases");
      if (filters.search && filters.search.trim() !== "") {
        const term = filters.search.trim();
        q = q
          .where("itemName", ">=", term)
          .where("itemName", "<=", term + "\uf8ff")
          .orderBy("itemName", "asc");
      } else {
        if (filters.date) q = q.where("date", "==", filters.date);
        q = q.orderBy("timestamp", "desc");
      }
      if (lastDoc) q = q.startAfter(lastDoc);
      q = q.limit(limitCount);
      return await q.get();
    } catch (error) {
      console.error("Purchase Fetch Error:", error);
      return { empty: true, docs: [] };
    }
  },

  // --- 3. ADD PURCHASE ---
  addPurchase: async function (data) {
    const today = new Date();
    const localDate =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");
    return db.collection("purchases").add({
      ...data,
      cost: Number(data.cost) || 0,
      quantity: Number(data.quantity) || 0,
      date: localDate,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  // --- 4. UPDATE PURCHASE ---
  updatePurchase: async function (id, data) {
    return db
      .collection("purchases")
      .doc(id)
      .update({
        ...data,
        cost: Number(data.cost) || 0,
        quantity: Number(data.quantity) || 0,
      });
  },

  // --- 5. GET STATS (Cards Logic) ---
  getStats: async function (targetDate) {
    try {
      const today = targetDate; // Ye wahi date hai jo aapne select ki hai

      // Weekly Logic
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      const lastWeek = d.toISOString().split("T")[0];

      // A. Sales Stats
      let salesTotal = 0,
        onlineTotal = 0,
        cashTotal = 0;
      const salesSnap = await db
        .collection("sales")
        .where("date", "==", today)
        .get();

      salesSnap.forEach((doc) => {
        const d = doc.data();
        const amt = Number(d.amount) || 0;
        salesTotal += amt;

        // Casing Handle (Online/online)
        const type = (d.paymentType || "").toLowerCase();
        if (type === "online") onlineTotal += amt;
        else if (type === "cash") cashTotal += amt;
      });

      // B. Purchase Stats
      let purchaseTotal = 0,
        stockInCount = 0,
        weeklyPurchase = 0,
        pendingBills = 0,
        stockInPackets = 0;
      const purchaseSnap = await db
        .collection("purchases")
        .where("date", "==", today)
        .get();
      purchaseSnap.forEach((doc) => {
        const d = doc.data();
        purchaseTotal += Number(d.cost) || 0;
        stockInCount += Number(d.totalUnits) || Number(d.quantity) || 0;
        const pktSize = Number(d.packetSize) || 1;
        stockInPackets += Math.floor((Number(d.totalUnits) || 0) / pktSize);
      });

      const weekPurchSnap = await db
        .collection("purchases")
        .where("date", ">=", lastWeek)
        .where("date", "<=", today)
        .get();
      weekPurchSnap.forEach(
        (doc) => (weeklyPurchase += Number(doc.data().cost) || 0),
      );

      const pendingSnap = await db
        .collection("purchases")
        .where("status", "==", "Pending")
        .get();
      pendingSnap.forEach(
        (doc) => (pendingBills += Number(doc.data().cost) || 0),
      );

      return {
        salesTotal,
        onlineTotal,
        cashTotal,
        purchaseTotal,
        stockInCount,
        stockInPackets,
        weeklyPurchase,
        pendingBills,
      };
    } catch (e) {
      console.error("Stats Error:", e);
      return {};
    }
  },

  // --- 6. WEEKLY SALES TOTAL (For Header Card) ---
  getWeeklyTotalSales: async function () {
    try {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);

      const todayStr = today.toISOString().split("T")[0];
      const lastWeekStr = lastWeek.toISOString().split("T")[0];

      const snap = await db
        .collection("sales")
        .where("date", ">=", lastWeekStr)
        .where("date", "<=", todayStr)
        .get();

      let total = 0;
      snap.forEach((doc) => (total += Number(doc.data().amount) || 0));
      return total;
    } catch (e) {
      return 0;
    }
  },

  // --- 7. GET STAFF ---
  getDeliveryStaff: async function () {
    try {
      const snap = await db
        .collection("users")
        .where("role", "==", "delivery_boy")
        .get();
      let staff = [];
      snap.forEach((doc) => {
        if (doc.data().name) staff.push({ name: doc.data().name });
      });
      return staff;
    } catch (e) {
      return [];
    }
  },
};
