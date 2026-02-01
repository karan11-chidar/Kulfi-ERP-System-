window.ExpenseService = {
  // 1. Get List (Same)
  getExpenses: async function (
    dateString,
    lastTimestamp = null,
    limitCount = 10,
  ) {
    try {
      let q = db
        .collection("expenses")
        .where("date", "==", dateString)
        .orderBy("timestamp", "desc")
        .limit(limitCount);

      if (lastTimestamp) {
        q = q.startAfter(lastTimestamp);
      }
      return await q.get();
    } catch (error) {
      console.error("Firebase List Error:", error);
      throw error;
    }
  },

  // 2. Smart Sync (Same)
  getNewerExpenses: async function (dateString, latestTimestamp) {
    try {
      return await db
        .collection("expenses")
        .where("date", "==", dateString)
        .where("timestamp", ">", latestTimestamp)
        .orderBy("timestamp", "desc")
        .get();
    } catch (error) {
      console.error("Smart Sync Error:", error);
      return { empty: true };
    }
  },

  // 3. 🔥 STATS (Sirf Chote Cards - Optimized) 🔥
  getStats: async function (targetDate) {
    try {
      const today = targetDate || new Date().toISOString().split("T")[0];

      // Weekly Logic
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      const lastWeekStr = d.toISOString().split("T")[0];

      // Monthly Logic (Sirf Month Card ke liye)
      const firstDayOfMonth = new Date(
        new Date(today).getFullYear(),
        new Date(today).getMonth(),
        1,
      )
        .toISOString()
        .split("T")[0];

      // Queries
      let todayTotal = 0;
      const todaySnap = await db
        .collection("expenses")
        .where("date", "==", today)
        .get();
      todaySnap.forEach(
        (doc) => (todayTotal += Number(doc.data().amount) || 0),
      );

      let weekTotal = 0;
      const weekSnap = await db
        .collection("expenses")
        .where("date", ">=", lastWeekStr)
        .where("date", "<=", today)
        .get();
      weekSnap.forEach((doc) => (weekTotal += Number(doc.data().amount) || 0));

      let monthTotal = 0;
      const monthSnap = await db
        .collection("expenses")
        .where("date", ">=", firstDayOfMonth)
        .where("date", "<=", today)
        .get();
      monthSnap.forEach(
        (doc) => (monthTotal += Number(doc.data().amount) || 0),
      );

      return { todayTotal, weekTotal, monthTotal };
    } catch (error) {
      console.error("Stats Error:", error);
      return { todayTotal: 0, weekTotal: 0, monthTotal: 0 };
    }
  },

  // 4. 🔥 LIFE-TIME TOTAL (One-Time Fetch) 🔥
  getLifeTimeTotal: async function () {
    try {
      console.log("💰 Fetching Life-Time Total (One Time Only)...");
      const snap = await db.collection("expenses").get();
      let total = 0;
      snap.forEach((doc) => (total += Number(doc.data().amount) || 0));
      return total;
    } catch (e) {
      console.error("LifeTime Stats Error:", e);
      return 0;
    }
  },

  // 5. Add/Delete (Same)
  addExpense: async function (expenseData) {
    const dataWithTime = {
      ...expenseData,
      amount: Number(expenseData.amount) || 0,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };
    return db.collection("expenses").add(dataWithTime);
  },

  deleteExpense: async function (id) {
    return db.collection("expenses").doc(id).delete();
  },
};
