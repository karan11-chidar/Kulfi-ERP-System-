window.StockService = {
  // 1. GET GODOWN STOCK
  getGodownStock: async function () {
    try {
      const snap = await db.collection("products").orderBy("name", "asc").get();
      let products = [];
      snap.forEach((doc) => products.push({ id: doc.id, ...doc.data() }));
      return products;
    } catch (e) {
      console.error("Stock Fetch Error:", e);
      return [];
    }
  },

  // 2. GET BOY STOCK (New: Specific Boy ka Stock lane ke liye)
  getBoyStock: async function (boyName) {
    try {
      const snap = await db
        .collection("boy_inventory")
        .where("boyName", "==", boyName)
        .get();
      let items = [];
      snap.forEach((doc) => {
        if (doc.data().qty > 0) items.push(doc.data());
      });
      return items;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // 3. GET ALL STOCK WITH BOYS (Stats ke liye)
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

  // 4. ASSIGN STOCK (Godown [-] , Boy [+])
  assignStock: async function (boyName, productName, qty, packetSize) {
    const batch = db.batch();

    // A. Godown se kam karo
    const prodSnap = await db
      .collection("products")
      .where("name", "==", productName)
      .limit(1)
      .get();
    if (prodSnap.empty) throw new Error("Product Godown me nahi mila!");
    const prodDoc = prodSnap.docs[0];
    const currentQty = Number(prodDoc.data().qty) || 0;

    if (currentQty < qty)
      throw new Error(`Godown me maal kam hai! Sirf ${currentQty} bache hain.`);
    batch.update(prodDoc.ref, { qty: currentQty - qty });

    // B. Boy Inventory me badhao
    const boyInvRef = db
      .collection("boy_inventory")
      .doc(`${boyName}_${productName}`);
    const boySnap = await boyInvRef.get();

    if (boySnap.exists) {
      batch.update(boyInvRef, {
        qty: firebase.firestore.FieldValue.increment(qty),
      });
    } else {
      batch.set(boyInvRef, {
        boyName,
        productName,
        qty,
        packetSize: Number(packetSize) || 1,
      });
    }

    // C. Log Entry
    const logRef = db.collection("stock_logs").doc();
    batch.set(logRef, {
      action: "ASSIGN",
      boyName,
      productName,
      qty,
      date: new Date().toISOString().split("T")[0],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  },

  // 5. RETURN STOCK (Godown [+] , Boy [-])
  returnStock: async function (boyName, productName, qty) {
    const batch = db.batch();

    // A. Boy Inventory se kam karo
    const boyInvRef = db
      .collection("boy_inventory")
      .doc(`${boyName}_${productName}`);
    const boySnap = await boyInvRef.get();

    if (!boySnap.exists || boySnap.data().qty < qty) {
      throw new Error(
        `Ladke ke paas itna stock (${productName}) nahi hai return karne ke liye!`,
      );
    }
    batch.update(boyInvRef, {
      qty: firebase.firestore.FieldValue.increment(-qty),
    });

    // B. Godown me wapas jodo
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

    // C. Log
    const logRef = db.collection("stock_logs").doc();
    batch.set(logRef, {
      action: "RETURN",
      boyName,
      productName,
      qty,
      date: new Date().toISOString().split("T")[0],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  },

  // 6. DAMAGE / ADD / EDIT / DELETE (Same as before)
  addOrUpdateStock: async function (data) {
    /* ... Purana code ... */
    // (Keep your existing logic for addOrUpdateStock here)
    // Main concept same rahega
    const snap = await db
      .collection("products")
      .where("name", "==", data.name)
      .limit(1)
      .get();
    const packetSize = Number(data.packetSize) || 1;
    if (!snap.empty) {
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
  updateProduct: async function (id, data) {
    return db.collection("products").doc(id).update(data);
  },
  deleteProduct: async function (id) {
    return db.collection("products").doc(id).delete();
  },
  reportDamage: async function (productName, qty, reason) {
    const batch = db.batch();
    const productSnap = await db
      .collection("products")
      .where("name", "==", productName)
      .limit(1)
      .get();
    if (productSnap.empty) throw new Error("Product not found!");
    const prodDoc = productSnap.docs[0];
    const currentQty = Number(prodDoc.data().qty) || 0;
    if (currentQty < qty) throw new Error(`Stock kam hai!`);
    batch.update(prodDoc.ref, { qty: currentQty - qty });
    const logRef = db.collection("damage_logs").doc();
    batch.set(logRef, {
      productName,
      qty,
      reason,
      date: new Date().toISOString().split("T")[0],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
  },
};
