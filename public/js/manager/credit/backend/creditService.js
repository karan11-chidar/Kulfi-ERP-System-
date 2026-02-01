window.CreditService = {
  // --- 1. GET SHOPS ---
  getShops: async function (
    viewMode,
    lastDoc,
    limitCount = 10,
    searchTerm = "",
    sortOption = "high",
    dateFilter = null,
  ) {
    try {
      let q = db.collection("shops");

      if (searchTerm && searchTerm.trim() !== "") {
        const term = searchTerm.trim();
        const isNumber = /^\d+$/.test(term);
        if (isNumber) {
          q = q
            .where("mobile", ">=", term)
            .where("mobile", "<=", term + "\uf8ff")
            .orderBy("mobile", "asc");
        } else {
          q = q
            .where("shopName", ">=", term)
            .where("shopName", "<=", term + "\uf8ff")
            .orderBy("shopName", "asc");
        }
      } else {
        if (viewMode === "date") {
          const targetDate =
            dateFilter || new Date().toISOString().split("T")[0];
          q = q.where("lastTransactionDate", "==", targetDate);
        } else if (viewMode === "pending") {
          q = q.where("currentCredit", ">", 0);
        }

        if (sortOption === "low") {
          q = q.orderBy("currentCredit", "asc");
        } else if (sortOption === "name") {
          q = q.orderBy("shopName", "asc");
        } else {
          q = q.orderBy("currentCredit", "desc");
        }
      }

      if (lastDoc) q = q.startAfter(lastDoc);
      q = q.limit(limitCount);
      return await q.get();
    } catch (error) {
      console.error("Fetch Error:", error);
      throw error;
    }
  },

  // --- 2. GET STATS (Sirf Date wale - Total Hata Diya) ---
  getStats: async function (targetDate) {
    try {
      const todayStr = targetDate || new Date().toISOString().split("T")[0];
      const d = new Date(todayStr);
      d.setDate(d.getDate() - 7);
      const lastWeekStr = d.toISOString().split("T")[0];

      // Note: Market Total yahan se hata diya gaya hai (Optimization)

      // A. TODAY'S NET FLOW
      const todaySnap = await db
        .collection("credit_logs")
        .where("date", "==", todayStr)
        .get();
      let todayNet = 0;
      todaySnap.forEach((doc) => {
        const data = doc.data();
        if (data.type === "GIVEN") todayNet += data.amount;
        else if (data.type === "RECEIVED") todayNet -= data.amount;
      });

      // B. WEEKLY NET FLOW
      const weekSnap = await db
        .collection("credit_logs")
        .where("date", ">=", lastWeekStr)
        .where("date", "<=", todayStr)
        .get();
      let weekNet = 0;
      weekSnap.forEach((doc) => {
        const data = doc.data();
        if (data.type === "GIVEN") weekNet += data.amount;
        else if (data.type === "RECEIVED") weekNet -= data.amount;
      });

      return { todayNet, weekNet };
    } catch (e) {
      console.error("Stats Error:", e);
      return { todayNet: 0, weekNet: 0 };
    }
  },

  // 🔥 3. GET TOTAL MARKET (NEW FUNCTION - One Time Call) 🔥
  getTotalMarketCredit: async function () {
    try {
      console.log("💰 Fetching Total Market Credit (Heavy Operation)...");
      const marketSnap = await db
        .collection("shops")
        .where("currentCredit", ">", 0)
        .get();
      let total = 0;
      marketSnap.forEach((doc) => (total += doc.data().currentCredit || 0));
      return total;
    } catch (e) {
      console.error("Market Total Error:", e);
      return 0;
    }
  },

  // --- 4. UPDATE TRANSACTION ---
  updateCredit: async function (shopId, amount, type, note) {
    const batch = db.batch();
    const shopRef = db.collection("shops").doc(shopId);
    const logRef = db.collection("credit_logs").doc();
    const todayDate = new Date().toISOString().split("T")[0];

    const change = type === "GIVEN" ? amount : -amount;

    batch.update(shopRef, {
      currentCredit: firebase.firestore.FieldValue.increment(change),
      lastTransactionDate: todayDate,
      lastTransactionType: type,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    batch.set(logRef, {
      shopId,
      amount,
      type,
      note,
      date: todayDate,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  },

  // --- 5. ADD NEW SHOP ---
  addNewShopWithCredit: async function (data) {
    const todayDate = new Date().toISOString().split("T")[0];
    return db.collection("shops").add({
      ...data,
      currentCredit: Number(data.currentCredit) || 0,
      lastTransactionDate: todayDate,
      status: "Active",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },
};
