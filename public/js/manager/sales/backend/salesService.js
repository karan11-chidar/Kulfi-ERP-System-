window.SalesService = {
  // --- 1. GET SALES (Optimized: 10-10 karke layega) ---
  getSales: async function (lastDoc, limitCount = 10, filters = {}) {
    try {
      let q = db.collection("sales");
      if (filters.search && filters.search.trim() !== "") {
        const term = filters.search.trim();
        q = q
          .where("shopName", ">=", term)
          .where("shopName", "<=", term + "\uf8ff")
          .orderBy("shopName", "asc");
      } else {
        if (filters.date) q = q.where("date", "==", filters.date);
        if (filters.boy && filters.boy !== "all")
          q = q.where("deliveryBoy", "==", filters.boy);
        if (filters.payment && filters.payment !== "all")
          q = q.where("paymentType", "==", filters.payment);
        q = q.orderBy("timestamp", "desc");
      }
      if (lastDoc) q = q.startAfter(lastDoc);
      q = q.limit(limitCount);
      return await q.get();
    } catch (error) {
      console.error("Sales Fetch Error:", error);
      throw error;
    }
  },

  // --- 2. GET PURCHASES (Optimized: 10-10 karke layega) ---
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
      throw error;
    }
  },

  // --- 3. ADD PURCHASE ---
  addPurchase: async function (data) {
    const today = new Date().toISOString().split("T")[0];
    return db.collection("purchases").add({
      ...data,
      cost: Number(data.cost) || 0,
      quantity: Number(data.quantity) || 0,
      date: today,
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

  // --- 5. GET STATS (Sirf Aaj ka aur Last Week ka data padhega - Safe) ---
  getStats: async function (targetDate) {
    try {
      const today = targetDate || new Date().toISOString().split("T")[0];

      // Calculate Date 7 days ago
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      const lastWeek = d.toISOString().split("T")[0];

      // A. Sales Stats (Sirf Aaj ki padho)
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
        if (d.paymentType === "online") onlineTotal += amt;
        if (d.paymentType === "cash") cashTotal += amt;
      });

      // B. Purchase Stats (Sirf Aaj ki aur Pending bills)
      let purchaseTotal = 0,
        stockInCount = 0,
        weeklyPurchase = 0,
        pendingBills = 0;

      // Today's Purchase
      const purchaseSnap = await db
        .collection("purchases")
        .where("date", "==", today)
        .get();
      purchaseSnap.forEach((doc) => {
        const d = doc.data();
        purchaseTotal += Number(d.cost) || 0;
        // Total Units count karo (agar totalUnits field hai toh wo, nahi toh quantity)
        stockInCount += Number(d.totalUnits) || Number(d.quantity) || 0;
      });

      // Weekly Purchase (Pichle 7 din) - Ye thoda heavy ho sakta hai agar bohot kharidari ho, par zaroori hai
      const weekPurchSnap = await db
        .collection("purchases")
        .where("date", ">=", lastWeek)
        .where("date", "<=", today)
        .get();
      weekPurchSnap.forEach((doc) => {
        weeklyPurchase += Number(doc.data().cost) || 0;
      });

      // Pending Bills
      const pendingSnap = await db
        .collection("purchases")
        .where("status", "==", "Pending")
        .get();
      pendingSnap.forEach((doc) => {
        pendingBills += Number(doc.data().cost) || 0;
      });

      return {
        salesTotal,
        onlineTotal,
        cashTotal,
        purchaseTotal,
        stockInCount,
        weeklyPurchase,
        pendingBills,
      };
    } catch (e) {
      console.error("Stats Error:", e);
      return {
        salesTotal: 0,
        onlineTotal: 0,
        cashTotal: 0,
        purchaseTotal: 0,
        stockInCount: 0,
        weeklyPurchase: 0,
        pendingBills: 0,
      };
    }
  },

  // ❌ REMOVED: getLifeTimeTotalSales (Ye bohot reads kha raha tha)

  // --- 6. GET STAFF ---
  getDeliveryStaff: async function () {
    try {
      // Sirf active delivery boys lao (Reads kam honge)
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
