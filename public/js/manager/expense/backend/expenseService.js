window.ExpenseService = {
  subscribeToExpenses: function (onSuccess, onError) {
    return db
      .collection("expenses")
      .orderBy("date", "desc")
      .onSnapshot((snapshot) => {
        const expenses = [];
        snapshot.forEach((doc) => {
          expenses.push({ id: doc.id, ...doc.data() });
        });
        onSuccess(expenses);
      }, onError);
  },

  addExpense: function (expenseData) {
    return db.collection("expenses").add({
      ...expenseData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  deleteExpense: function (id) {
    return db.collection("expenses").doc(id).delete();
  },
};
