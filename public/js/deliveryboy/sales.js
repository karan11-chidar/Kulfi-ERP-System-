lucide.createIcons();

// --- DATA ---
const transactions = [
    { shop: "Sharma General Store", amount: 500, type: "Cash", time: "10:30 AM" },
    { shop: "Gupta Kirana", amount: 1200, type: "Pending", time: "11:15 AM" },
    { shop: "City Cafe", amount: 700, type: "Online", time: "12:00 PM" },
    { shop: "Raju Tea Stall", amount: 200, type: "Cash", time: "01:20 PM" },
    { shop: "Yadav Dairy", amount: 500, type: "Advance", time: "02:00 PM" },
    { shop: "Apna Mart", amount: 1500, type: "Online", time: "03:45 PM" },
    { shop: "Mahalaxmi Sweets", amount: 300, type: "Cash", time: "04:10 PM" }
];

let totalCash = 0, totalOnline = 0, totalPending = 0, totalAdvance = 0;
const listContainer = document.getElementById('transaction-list');
let currentFilter = 'All'; // Track current filter

// --- 1. Init Totals ---
transactions.forEach(t => {
    if(t.type === "Cash") totalCash += t.amount;
    else if(t.type === "Online") totalOnline += t.amount;
    else if(t.type === "Pending") totalPending += t.amount;
    else if(t.type === "Advance") totalAdvance += t.amount;
});

document.getElementById('total-cash').innerText = "₹" + totalCash;
document.getElementById('total-online').innerText = "₹" + totalOnline;
document.getElementById('total-pending').innerText = "₹" + totalPending;
document.getElementById('total-advance').innerText = "₹" + totalAdvance;
document.getElementById('final-hand').innerText = "₹" + (totalCash + totalOnline + totalAdvance);


// --- 2. Main Render Function ---
function renderList(data) {
    listContainer.innerHTML = "";
    if(data.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#999;">No transactions found.</div>`;
        return;
    }

    data.forEach(t => {
        let badgeClass = "", amtColor = "#333";
        if(t.type === "Cash") { badgeClass = "badge-cash"; amtColor = "#4caf50"; }
        else if(t.type === "Online") { badgeClass = "badge-online"; amtColor = "#2196f3"; }
        else if(t.type === "Pending") { badgeClass = "badge-pending"; amtColor = "#f44336"; }
        else if(t.type === "Advance") { badgeClass = "badge-adv"; amtColor = "#ff9800"; }

        const card = `
            <div class="trans-card">
                <div class="shop-info">
                    <h4>${t.shop}</h4>
                    <small>${t.time} • ${t.type}</small>
                </div>
                <div class="trans-amount">
                    <span class="amt" style="color:${amtColor}">₹${t.amount}</span>
                    <span class="badge ${badgeClass}">${t.type}</span>
                </div>
            </div>`;
        listContainer.innerHTML += card;
    });
}

// --- 3. Filter Logic (Click on Box) ---
function filterList(filterType) {
    currentFilter = filterType;
    document.getElementById('searchInput').value = ""; // Reset Search on filter change

    // Highlight Logic
    document.querySelectorAll('.stat-box').forEach(box => box.classList.remove('active-filter'));
    if(filterType !== 'All') {
        const boxId = 'box-' + filterType.toLowerCase();
        document.getElementById(boxId).classList.add('active-filter');
    }

    // Filter Data
    const filteredData = filterType === 'All' 
        ? transactions 
        : transactions.filter(t => t.type === filterType);

    renderList(filteredData);
}

// --- 4. Search Logic ---
function handleSearch() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    
    // First filter by Type (if selected), then search by Name
    let dataToSearch = currentFilter === 'All' 
        ? transactions 
        : transactions.filter(t => t.type === currentFilter);

    const searchResults = dataToSearch.filter(t => 
        t.shop.toLowerCase().includes(searchText)
    );

    renderList(searchResults);
}

// Start
renderList(transactions);