lucide.createIcons();

// --- Mock Data (Isme mixed data hai, JS sirf Pending wala filter karegi) ---
const allTransactions = [
    { shop: "Sharma General Store", amt: 500, date: "26 Jan", status: "Pending", phone: "9876543210" },
    { shop: "Gupta Kirana", amt: 1200, date: "26 Jan", status: "Cash", phone: "9988776655" }, // Ye nahi dikhega
    { shop: "City Cafe", amt: 700, date: "25 Jan", status: "Pending", phone: "9123456789" },
    { shop: "Raju Tea Stall", amt: 200, date: "25 Jan", status: "Online", phone: "9000011111" }, // Ye nahi dikhega
    { shop: "Yadav Dairy", amt: 1500, date: "24 Jan", status: "Pending", phone: "8888899999" }
];

const listDiv = document.getElementById('pendingList');
let totalPending = 0;

// --- Filter & Render Logic ---
// Sirf wo shops jinka status "Pending" hai
const pendingList = allTransactions.filter(item => item.status === "Pending");

if (pendingList.length === 0) {
    listDiv.innerHTML = "<div style='text-align:center; padding:30px; color:#999;'>No pending payments! 🎉</div>";
} else {
    pendingList.forEach(item => {
        // Total calculate karo
        totalPending += item.amt;

        // HTML banao
        const card = `
        <div class="card">
            <div style="display:flex; align-items:center; flex:1;">
                <div class="shop-info">
                    <h4>${item.shop}</h4>
                    <span>${item.date} • Due Amount</span>
                </div>
            </div>
            
            <div class="amount-box">
                <span class="amt">₹${item.amt}</span>
                <span class="status-badge">Due</span>
            </div>

            <a href="tel:${item.phone}" class="call-btn">
                <i data-lucide="phone" style="width:16px;"></i>
            </a>
        </div>`;
        
        listDiv.innerHTML += card;
    });
}

// Total Update Karo
document.getElementById('totalPendingAmount').innerText = "₹" + totalPending;

// Re-init Icons for dynamic content
lucide.createIcons();