// Path: public/js/manager/shops/shopsService.js

window.ShopsService = {
  // ... (getShops function waisa hi rahega) ...
  getShops: async function (lastDoc, limitCount, filters) {
    // ... (Purana code same rakho) ...
    try {
      let q = db.collection("shops");
      if (filters.search && filters.search.trim() !== "") {
        const term = filters.search.trim();
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
      } else if (filters.status && filters.status !== "all") {
        q = q
          .where("status", "==", filters.status)
          .orderBy("timestamp", "desc");
      } else {
        q = q.orderBy("timestamp", "desc");
      }
      if (lastDoc) q = q.startAfter(lastDoc);
      q = q.limit(limitCount);
      return await q.get();
    } catch (error) {
      console.error("Fetch Error:", error);
      throw error;
    }
  },

  // 🔥 UPDATED STATS FUNCTION (Debug Enabled)
  getStats: async function () {
    console.log("📊 Fetching Stats...");
    try {
      const coll = db.collection("shops");

      // 1. Total Count
      const totalSnap = await coll.count().get();
      console.log("✅ Total Count Fetched:", totalSnap.data().count);

      // 2. Active Count
      const activeSnap = await coll
        .where("status", "==", "Active")
        .count()
        .get();

      // 3. Inactive Count
      const inactiveSnap = await coll
        .where("status", "==", "Inactive")
        .count()
        .get();

      return {
        total: totalSnap.data().count,
        active: activeSnap.data().count,
        inactive: inactiveSnap.data().count,
      };
    } catch (e) {
      console.error("❌ Stats Error (Check Here):", e);

      // FALLBACK: Agar count() fail ho jaye (e.g. Index nahi hai),
      // toh hum purane tarike se data layenge (thoda slow par reliable)
      try {
        const fallbackSnap = await db.collection("shops").get();
        const total = fallbackSnap.size;
        const active = fallbackSnap.docs.filter(
          (d) => d.data().status === "Active",
        ).length;
        const inactive = fallbackSnap.docs.filter(
          (d) => d.data().status === "Inactive",
        ).length;
        console.log("⚠️ Used Fallback Stats Method");
        return { total, active, inactive };
      } catch (err) {
        console.error("Critical Stats Failure:", err);
        return { total: 0, active: 0, inactive: 0 };
      }
    }
  },

  // ... (Baki functions same rahenge: addShop, updateShop, deleteShop) ...
  addShop: async function (data) {
    return db
      .collection("shops")
      .add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
  },
  updateShop: async function (id, data) {
    return db
      .collection("shops")
      .doc(id)
      .update({
        ...data,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
  },
  deleteShop: async function (id) {
    return db.collection("shops").doc(id).delete();
  },
};
