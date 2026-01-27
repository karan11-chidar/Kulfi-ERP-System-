lucide.createIcons();

// --- Mock Data (Database se aayega) ---
const historyData = [
    { shop: "Sharma General Store", amt: 500, date: "2024-01-26", time: "10:30 AM", status: "Cash" },
    { shop: "Gupta Kirana", amt: 1200, date: "2024-01-26", time: "11:15 AM", status: "Credit" },
    { shop: "City Cafe", amt: 700, date: "2024-01-25", time: "04:00 PM", status: "Online" },
    { shop: "Raju Tea Stall", amt: 200, date: "2024-01-25", time: "09:00 AM", status: "Cash" },
    { shop: "Yadav Dairy", amt: 1500, date: "2024-01-24", time: "02:00 PM", status: "Online" },
    { shop: "Apna Mart", amt: 450, date: "2024-01-24", time: "05:30 PM", status: "Cash" }
];

const listDiv = document.getElementById('list');

// --- Render Function ---
function render(data) {
    listDiv.innerHTML = "";
    
    if(data.length === 0) {
        listDiv.innerHTML = "<div style='text-align:center; padding:30px; color:#999; font-size:13px;'>No transaction record found.</div>";
        return;
    }

    data.forEach(item => {
        listDiv.innerHTML += `
        <div class="card">
            <div class="shop-info">
                <h4>${item.shop}</h4>
                <span>${item.date} • ${item.time}</span>
            </div>
            <div class="amount-info">
                <span class="amt">₹${item.amt}</span>
                <span class="status">${item.status}</span>
            </div>
        </div>`;
    });
}

// --- Filter Logic: Search + Date Combined ---
function filterData() {
    const searchVal = document.getElementById('searchInp').value.toLowerCase();
    const dateVal = document.getElementById('dateInp').value;

    const filtered = historyData.filter(item => {
        // 1. Check Name match
        const nameMatch = item.shop.toLowerCase().includes(searchVal);
        
        // 2. Check Date match (only if date is selected)
        // Agar date box khali hai to sab dikhao, nahi to match karo
        const dateMatch = dateVal === "" || item.date === dateVal;

        return nameMatch && dateMatch;
    });

    render(filtered);
}

// --- Clear Date Button ---
function clearDate() {
    document.getElementById('dateInp').value = "";
    filterData(); // Refresh list
}

// Initial Load
render(historyData);