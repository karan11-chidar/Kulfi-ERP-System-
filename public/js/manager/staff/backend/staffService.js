// Path: public/js/manager/staff/backend/staffService.js

window.StaffService = {
  // 1. 📡 LIVE DATA LISTENER
  subscribeToStaffList: function (onSuccess, onError) {
    return db
      .collection("users")
      .where("role", "!=", "manager")
      .onSnapshot((snapshot) => {
        const staffList = [];
        snapshot.forEach((doc) => {
          staffList.push({ id: doc.id, ...doc.data() });
        });
        onSuccess(staffList); // Controller ko data bhej do
      }, onError);
  },

  // 2. 💾 ADD / UPDATE STAFF
  saveStaffData: async function (
    staffData,
    id = null,
    email = null,
    password = null,
  ) {
    if (id) {
      // ---> UPDATE Existing
      return db.collection("users").doc(id).update(staffData);
    } else {
      // ---> CREATE New (Using Secondary App Trick)
      const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
      try {
        const userCred = await secondaryApp
          .auth()
          .createUserWithEmailAndPassword(email, password);

        await db
          .collection("users")
          .doc(userCred.user.uid)
          .set({
            uid: userCred.user.uid,
            email: email,
            advance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            ...staffData,
          });

        await secondaryApp.auth().signOut();
      } finally {
        secondaryApp.delete(); // App band karna mat bhulna
      }
    }
  },

  // 3. 💰 WALLET TRANSACTION
  updateAdvance: async function (staffId, amount, action) {
    const staffRef = db.collection("users").doc(staffId);

    return db.runTransaction(async (transaction) => {
      const doc = await transaction.get(staffRef);
      if (!doc.exists) throw new Error("Staff not found");

      const currentAdv = Number(doc.data().advance || 0);
      let newAdv = currentAdv;

      if (action === "give") {
        newAdv = currentAdv + amount;
      } else {
        if (currentAdv < amount)
          throw new Error("Balance se jyada cut nahi kar sakte!");
        newAdv = currentAdv - amount;
      }

      transaction.update(staffRef, { advance: newAdv });
    });
  },

  // 4. 🗑️ DELETE STAFF
  deleteStaffById: async function (id) {
    return db.collection("users").doc(id).delete();
  },
};
