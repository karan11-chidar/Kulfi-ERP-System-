// Path: public/js/manager/staff/backend/staffService.js

window.StaffService = {
  // 1. GET DATA (One Time Only 💰)
  getAllStaff: function () {
    // Manager ko chhodkar sabko lao
    return db.collection("users").where("role", "!=", "manager").get();
  },

  // 2. SAVE STAFF (Add/Update)
  saveStaffData: async function (
    staffData,
    id = null,
    email = null,
    password = null,
  ) {
    if (id) {
      // ---> UPDATE Existing
      await db.collection("users").doc(id).update(staffData);
      return id; // ID wapas bhejo
    } else {
      // ---> CREATE New (Using Secondary App Trick)
      const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
      try {
        const userCred = await secondaryApp
          .auth()
          .createUserWithEmailAndPassword(email, password);
        const uid = userCred.user.uid;

        await db
          .collection("users")
          .doc(uid)
          .set({
            uid: uid,
            email: email,
            advance: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            ...staffData,
          });

        await secondaryApp.auth().signOut();
        return uid; // Naye user ki ID wapas bhejo
      } finally {
        secondaryApp.delete();
      }
    }
  },

  // 3. WALLET TRANSACTION
  updateAdvance: async function (staffId, amount, action) {
    const staffRef = db.collection("users").doc(staffId);

    // Transaction use kar rahe hain taaki calculation gadbad na ho
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
      return newAdv; // Naya balance wapas bhejo
    });
  },

  // 4. DELETE STAFF
  deleteStaffById: async function (id) {
    return db.collection("users").doc(id).delete();
  },
};
