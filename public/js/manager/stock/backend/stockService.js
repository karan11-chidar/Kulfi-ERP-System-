window.StockService = {
  // 1. GET GODOWN STOCK
  getGodownStock: async function () {
    try {
      const snap = await db.collection("products").orderBy("name", "asc").get();
      let products = [];
      snap.forEach((doc) => products.push({ id: doc.id, ...doc.data() }));
      return products;
    } catch (e) {
      return [];
    }
  },

  // 2. GET BOY STOCK
  getBoyStock: async function (boyName) {
    try {
      const snap = await db
        .collection("boy_inventory")
        .where("boyName", "==", boyName)
        .get();
      let items = [];
      snap.forEach((doc) => {
        if (doc.data().qty > 0)
          items.push({
            id: doc.id,
            name: doc.data().productName,
            category: "Assigned",
            price: 0,
            qty: doc.data().qty,
            packetSize: doc.data().packetSize || 1,
          });
      });
      return items;
    } catch (e) {
      return [];
    }
  },

  // 3. GET STATS
  getAllBoysStock: async function () {
    try {
      const snap = await db.collection("boy_inventory").get();
      let total = 0;
      snap.forEach((doc) => (total += Number(doc.data().qty) || 0));
      return total;
    } catch (e) {
      return 0;
    }
  },

  getDeliveryBoys: async function () {
    try {
      const snap = await db
        .collection("users")
        .where("role", "==", "delivery_boy")
        .get();
      let boys = [];
      snap.forEach((doc) => {
        if (doc.data().name) boys.push(doc.data().name);
      });
      return boys;
    } catch (e) {
      return [];
    }
  },

  // 4. ASSIGN (Calculated Logic)
  assignStock: async function (boyName, productName, qty, packetSize) {
    const batch = db.batch();
    const prodSnap = await db
      .collection("products")
      .where("name", "==", productName)
      .limit(1)
      .get();
    if (prodSnap.empty) throw new Error("Product not found!");

    const prodDoc = prodSnap.docs[0];
    const currentQty = Number(prodDoc.data().qty) || 0;

    if (currentQty < qty)
      throw new Error(`Stock kam hai! Only ${currentQty} units left.`);

    batch.update(prodDoc.ref, { qty: currentQty - qty });

    const boyInvRef = db
      .collection("boy_inventory")
      .doc(`${boyName}_${productName}`);
    const boySnap = await boyInvRef.get();

    if (boySnap.exists) {
      batch.update(boyInvRef, {
        qty: firebase.firestore.FieldValue.increment(qty),
        packetSize: Number(packetSize) || 1,
      });
    } else {
      batch.set(boyInvRef, {
        boyName,
        productName,
        qty,
        packetSize: Number(packetSize) || 1,
      });
    }
    await batch.commit();
  },

  // 5. RETURN (Calculated Logic)
  returnStock: async function (boyName, productName, qty) {
    const batch = db.batch();
    const boyInvRef = db
      .collection("boy_inventory")
      .doc(`${boyName}_${productName}`);
    const boySnap = await boyInvRef.get();

    if (!boySnap.exists || boySnap.data().qty < qty)
      throw new Error(`Insufficent stock!`);

    batch.update(boyInvRef, {
      qty: firebase.firestore.FieldValue.increment(-qty),
    });

    const prodSnap = await db
      .collection("products")
      .where("name", "==", productName)
      .limit(1)
      .get();
    if (!prodSnap.empty) {
      batch.update(prodSnap.docs[0].ref, {
        qty: firebase.firestore.FieldValue.increment(qty),
      });
    }
    await batch.commit();
  },

  // 6. 🔥 REPORT DAMAGE (Manual Entry - No Auto Calc / No Deduction)
  reportDamage: async function (data) {
    return db.collection("damage_logs").add({
      productName: data.productName,
      category: data.category,
      packets: Number(data.packets) || 0, // Raw Entry
      pieces: Number(data.pieces) || 0, // Raw Entry
      reason: data.reason,
      date: new Date().toISOString().split("T")[0],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  // 🔥 7. GET DAMAGE STATS (Sum of Raw Packets & Pieces)
  getDamageStats: async function () {
    try {
      const snap = await db.collection("damage_logs").get();
      let totalPkt = 0,
        totalPcs = 0;
      snap.forEach((doc) => {
        const d = doc.data();
        totalPkt += Number(d.packets) || 0;
        totalPcs += Number(d.pieces) || 0;
      });
      return { totalPkt, totalPcs };
    } catch (e) {
      return { totalPkt: 0, totalPcs: 0 };
    }
  },

  // 8. GET LOGS
  getDamageLogs: async function () {
    const snap = await db
      .collection("damage_logs")
      .orderBy("timestamp", "desc")
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // 9. DELETE / CLEAR LOGS
  deleteDamageLog: async function (id) {
    return db.collection("damage_logs").doc(id).delete();
  },
  clearDamageLogs: async function () {
    const snap = await db.collection("damage_logs").get();
    const batch = db.batch();
    snap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  },

  // 10. EDIT & DELETE STOCK (Full Control)
  updateProduct: async function (id, data) {
    return db.collection("products").doc(id).update(data);
  },
  deleteProduct: async function (id) {
    return db.collection("products").doc(id).delete();
  },
};
