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

  // 3. GET ALL BOYS STOCK (For Stats)
  getAllBoysStock: async function () {
    try {
      const snap = await db.collection("boy_inventory").get();
      let totalUnits = 0;
      let totalPackets = 0;
      snap.forEach((doc) => {
        const d = doc.data();
        const qty = Number(d.qty) || 0;
        const size = Number(d.packetSize) || 1;
        totalUnits += qty;
        totalPackets += Math.floor(qty / size);
      });
      return { totalUnits, totalPackets };
    } catch (e) {
      return { totalUnits: 0, totalPackets: 0 };
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

  // 4. ASSIGN STOCK (Calculated)
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

  // 5. RETURN STOCK (Calculated)
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

  // 6. 🔥 REPORT DAMAGE (Manual Entry - No Stock Deduction)
  reportDamage: async function (data) {
    return db.collection("damage_logs").add({
      productName: data.productName,
      category: data.category,
      packets: Number(data.packets) || 0,
      pieces: Number(data.pieces) || 0,
      reason: data.reason,
      date: new Date().toISOString().split("T")[0],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  // 7. GET DAMAGE STATS
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

  getDamageLogs: async function () {
    const snap = await db
      .collection("damage_logs")
      .orderBy("timestamp", "desc")
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  deleteDamageLog: async function (id) {
    return db.collection("damage_logs").doc(id).delete();
  },

  clearDamageLogs: async function () {
    const snap = await db.collection("damage_logs").get();
    const batch = db.batch();
    snap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  },

  // 🔥🔥🔥 THIS IS THE FUNCTION FROM SALES PAGE (Checking if it exists) 🔥🔥🔥
  addOrUpdateStock: async function (data) {
    const snap = await db
      .collection("products")
      .where("name", "==", data.name)
      .limit(1)
      .get();
    const packetSize = Number(data.packetSize) || 1;

    if (!snap.empty) {
      // Product hai -> Update Qty & Price
      const doc = snap.docs[0];
      const currentQty = Number(doc.data().qty) || 0;
      await db
        .collection("products")
        .doc(doc.id)
        .update({
          qty: currentQty + (Number(data.qty) || 0),
          price: Number(data.price) || doc.data().price,
          packetSize: packetSize,
        });
    } else {
      // Naya Product -> Create
      await db.collection("products").add({
        name: data.name,
        category: data.category || "General",
        price: Number(data.price) || 0,
        qty: Number(data.qty) || 0,
        packetSize: packetSize,
        status: "in-stock",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
  },

  // 10. EDIT & DELETE STOCK (Direct)
  updateProduct: async function (id, data) {
    return db.collection("products").doc(id).update(data);
  },
  deleteProduct: async function (id) {
    return db.collection("products").doc(id).delete();
  },
};
