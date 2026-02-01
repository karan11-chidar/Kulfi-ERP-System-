window.SalesService = {
  // 1. GET SALES (List) - No Change
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

  // 2. GET PURCHASES - No Change
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

  // 3. ADD PURCHASE - No Change
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

  // 🔥 4. GET STATS (Optimized: Removed Weekly) 🔥
  getStats: async function (targetDate) {
    try {
      const today = targetDate || new Date().toISOString().split("T")[0];
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      const lastWeek = d.toISOString().split("T")[0];

      // --- SALES STATS (Sirf Today) ---
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

      // --- PURCHASE STATS (Weekly abhi bhi rakh sakte hain ya hata sakte hain, yahan rakha hai) ---
      let purchaseTotal = 0,
        stockInCount = 0,
        weeklyPurchase = 0,
        pendingBills = 0;

      // Today Purchase
      const purchaseSnap = await db
        .collection("purchases")
        .where("date", "==", today)
        .get();
      purchaseSnap.forEach((doc) => {
        const d = doc.data();
        purchaseTotal += Number(d.cost) || 0;
        stockInCount += Number(d.quantity) || 0;
      });

      // Weekly Purchase (Purchase ke liye reads kam hote hain, isliye rakh sakte hain)
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

  // 🔥 5. NEW: LIFE-TIME TOTAL SALES (One-Time Fetch) 🔥
  getLifeTimeTotalSales: async function () {
    try {
      console.log("💰 Fetching Life-Time Sales Total (One Time)...");
      // Note: High volume hone par ye thoda heavy ho sakta hai startup par
      const snap = await db.collection("sales").get();
      let total = 0;
      snap.forEach((doc) => (total += Number(doc.data().amount) || 0));
      return total;
    } catch (e) {
      console.error("LifeTime Sales Error:", e);
      return 0;
    }
  },

  // 6. GET STAFF
  getDeliveryStaff: async function () {
    try {
      const snap = await db
        .collection("users")
        .where("role", "==", "delivery_boy")
        .get();
      let staff = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.name) staff.push({ name: data.name });
      });
      return staff;
    } catch (e) {
      console.error("Staff Fetch Error:", e);
      return [];
    }
  },
};
