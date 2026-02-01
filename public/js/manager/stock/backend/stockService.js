// Path: public/js/manager/stock/backend/stockService.js

window.StockService = {
  // --- 1. GET GODOWN STOCK ---
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

  // --- 2. GET DELIVERY BOYS ---
  getDeliveryBoys: async function () {
    try {
      // 🔥 Spelling Check: Database me "delivery_boy" hai ya "Delivery Boy"?
      // Hum dono check kar rahe hain taaki issue na aaye.
      const snap1 = await db
        .collection("users")
        .where("role", "==", "delivery_boy")
        .get();
      const snap2 = await db
        .collection("users")
        .where("role", "==", "Delivery Boy")
        .get();

      let boys = [];

      // Merge Results
      snap1.forEach((doc) => {
        if (doc.data().name) boys.push(doc.data().name);
      });
      snap2.forEach((doc) => {
        const name = doc.data().name;
        if (name && !boys.includes(name)) boys.push(name);
      });

      return boys;
    } catch (e) {
      console.error("Boy Fetch Error:", e);
      return [];
    }
  },

  // --- 3. ADD / UPDATE STOCK (For Purchase Page) ---
  addOrUpdateStock: async function (data) {
    try {
      const snap = await db
        .collection("products")
        .where("name", "==", data.name)
        .limit(1)
        .get();

      if (!snap.empty) {
        // AGAR HAI: Quantity Badha do (+)
        const doc = snap.docs[0];
        const currentQty = Number(doc.data().qty) || 0;
        const newQty = currentQty + (Number(data.qty) || 0);

        await db
          .collection("products")
          .doc(doc.id)
          .update({
            qty: newQty,
            price: Number(data.price) || doc.data().price,
          });
      } else {
        // AGAR NAHI HAI: Naya Product banao
        await db.collection("products").add({
          name: data.name,
          category: data.category || "General",
          price: Number(data.price) || 0,
          qty: Number(data.qty) || 0,
          status: "in-stock",
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      console.error("Stock Update Error:", e);
      throw e;
    }
  },

  // --- 4. ASSIGN STOCK (Godown to Boy) ---
  assignStock: async function (boyName, productName, qty) {
    const batch = db.batch();
    const productSnap = await db
      .collection("products")
      .where("name", "==", productName)
      .limit(1)
      .get();
    if (productSnap.empty) throw new Error("Product not found in Godown!");

    const prodDoc = productSnap.docs[0];
    const currentQty = Number(prodDoc.data().qty) || 0;

    if (currentQty < qty)
      throw new Error(`Not enough stock! Godown has only ${currentQty}.`);

    batch.update(prodDoc.ref, { qty: currentQty - qty });

    // Log Maintain Karo
    const logRef = db.collection("stock_logs").doc();
    batch.set(logRef, {
      action: "ASSIGN",
      boyName: boyName,
      productName: productName,
      qty: qty,
      date: new Date().toISOString().split("T")[0],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
  },

  // --- 5. RETURN STOCK (Boy to Godown) ---
  returnStock: async function (boyName, productName, qty) {
    const batch = db.batch();
    const productSnap = await db
      .collection("products")
      .where("name", "==", productName)
      .limit(1)
      .get();
    if (productSnap.empty) throw new Error("Product not found!");

    const prodDoc = productSnap.docs[0];
    const currentQty = Number(prodDoc.data().qty) || 0;

    batch.update(prodDoc.ref, { qty: currentQty + qty });

    const logRef = db.collection("stock_logs").doc();
    batch.set(logRef, {
      action: "RETURN",
      boyName: boyName,
      productName: productName,
      qty: qty,
      date: new Date().toISOString().split("T")[0],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
  },

  // --- 6. REPORT DAMAGE ---
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

    if (currentQty < qty)
      throw new Error(`Cannot damage ${qty}. Godown has only ${currentQty}.`);

    batch.update(prodDoc.ref, { qty: currentQty - qty });

    const logRef = db.collection("damage_logs").doc();
    batch.set(logRef, {
      productName: productName,
      qty: qty,
      reason: reason,
      date: new Date().toISOString().split("T")[0],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
  },

  deleteProduct: async function (id) {
    return db.collection("products").doc(id).delete();
  },
};
