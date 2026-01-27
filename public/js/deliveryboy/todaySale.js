lucide.createIcons();

// --- MOCK DATA (Aaj ki entry) ---
let salesData = [
    { id: 1, shop: "Sharma General Store", product: "Matka Kulfi", qty: 10, rate: 20, time: "10:30 AM" },
    { id: 2, shop: "Gupta Kirana", product: "Stick Kulfi", qty: 50, rate: 10, time: "11:15 AM" },
    { id: 3, shop: "City Cafe", product: "Rabdi", qty: 5, rate: 40, time: "12:00 PM" },
    { id: 4, shop: "Raju Tea Stall", product: "Matka Kulfi", qty: 8, rate: 20, time: "01:20 PM" },
    { id: 5, shop: "Yadav Dairy", product: "Stick Kulfi", qty: 25, rate: 10, time: "02:00 PM" }
];

const listDiv = document.getElementById('salesList');

// --- 1. RENDER FUNCTION ---
function render(data) {
    listDiv.innerHTML = "";
    let tQty = 0;
    let tVal = 0;

    if(data.length === 0) {
        listDiv.innerHTML = "<div style='text-align:center; padding:30px; color:#999;'>No sales found.</div>";
    }

    data.forEach(item => {
        const total = item.qty * item.rate;
        tQty += Number(item.qty);
        tVal += total;

        const card = `
        <div class="sale-card">
            <div class="sale-info">
                <h4>${item.shop}</h4>
                <div class="product">${item.product}</div>
                <div class="meta">Qty: ${item.qty} x ₹${item.rate} • ${item.time}</div>
            </div>
            <div class="sale-right">
                <span class="price-tag">₹${total}</span>
                <div class="edit-icon" onclick="openEditModal(${item.id})">
                    <i data-lucide="pencil" style="width:14px;"></i>
                </div>
            </div>
        </div>`;
        listDiv.innerHTML += card;
    });

    // Update Summary
    document.getElementById('totalQty').innerText = tQty;
    document.getElementById('totalVal').innerText = "₹" + tVal;
    
    lucide.createIcons();
}

// --- 2. FILTER LOGIC ---
function filterSales() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const flavorVal = document.getElementById('flavorFilter').value;
    const priceMode = document.getElementById('priceFilter').value;

    // Filter by Search & Flavor
    let filtered = salesData.filter(item => {
        const matchesName = item.shop.toLowerCase().includes(searchVal);
        const matchesFlavor = flavorVal === "All" || item.product.includes(flavorVal);
        return matchesName && matchesFlavor;
    });

    // Sort by Price
    if(priceMode === "high") {
        filtered.sort((a, b) => (b.qty * b.rate) - (a.qty * a.rate));
    } else if(priceMode === "low") {
        filtered.sort((a, b) => (a.qty * a.rate) - (b.qty * b.rate));
    }

    render(filtered);
}

// --- 3. EDIT MODAL LOGIC ---
let currentEditId = null;

function openEditModal(id) {
    const item = salesData.find(s => s.id === id);
    if(!item) return;

    currentEditId = id;
    document.getElementById('editId').value = id;
    document.getElementById('editShop').value = item.shop;
    document.getElementById('editProduct').value = item.product;
    document.getElementById('editQty').value = item.qty;
    document.getElementById('editRate').value = item.rate;
    
    calcTotal(); // Calculate initial total
    document.getElementById('editModal').style.display = 'flex';
}

function calcTotal() {
    const q = document.getElementById('editQty').value;
    const r = document.getElementById('editRate').value;
    document.getElementById('editTotal').innerText = "₹" + (q * r);
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveUpdate(e) {
    e.preventDefault();
    
    // Find item and update
    const index = salesData.findIndex(s => s.id === currentEditId);
    if(index !== -1) {
        salesData[index].qty = document.getElementById('editQty').value;
        salesData[index].rate = document.getElementById('editRate').value;
        
        alert("Entry Updated Successfully!");
        closeModal();
        filterSales(); // Re-render list
    }
}

// Initial Load
render(salesData);