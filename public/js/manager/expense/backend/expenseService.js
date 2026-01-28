// Path: public/js/manager/expense/backend/expenseService.js

window.ExpenseService = {
  // 1. Get Expenses (List ke liye - Pagination ke sath)
  getExpenses: async function (
    dateString,
    lastTimestamp = null,
    limitCount = 20,
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

  // 🔥 NEW: Stats ke liye Smart Query (Reads Bachane ke liye)
  // Hum sirf 'Is Mahine' ka data layenge aur usi se Today/Weekly nikalenge
  getMonthDataForStats: async function () {
    const date = new Date();
    // YYYY-MM-01 (Mahine ki pehli tarikh)
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    // Query: Date >= 1st of this month
    const q = db.collection("expenses").where("date", ">=", firstDay);
    return await q.get();
  },

  // Total (All Time) - Sawdhaan: Isme reads lagte hain
  getTotalAllTime: async function () {
    // Filhal hum reads bachane ke liye ise separate call rakhte hain
    // Agar bahut data hai to ye heavy ho sakta hai
    // Abhi ke liye hum ise Monthly data se hi jodenge ya alag query karenge
    // Chalo simple rakhte hain:
    return await db.collection("expenses").get(); // ⚠️ High Cost potential
  },

  addExpense: async function (expenseData) {
    const dataWithTime = {
      ...expenseData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };
    return db.collection("expenses").add(dataWithTime);
  },

  deleteExpense: async function (id) {
    return db.collection("expenses").doc(id).delete();
  },
};
