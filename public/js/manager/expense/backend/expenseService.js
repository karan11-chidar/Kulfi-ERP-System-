window.ExpenseService = {
  // 1. GET DATA (One Time Only)
  getAllExpenses: function () {
    // .get() = "Ek baar do aur phone kaat do"
    return db.collection("expenses").orderBy("date", "desc").get();
  },

  // 2. ADD EXPENSE
  addExpense: function (expenseData) {
    return db.collection("expenses").add({
      ...expenseData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  // 3. DELETE EXPENSE
  deleteExpense: function (id) {
    return db.collection("expenses").doc(id).delete();
  },
};
