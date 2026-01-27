lucide.createIcons();

// --- Mock Data (Database se aayega) ---
const stockData = [
    { name: "Matka Kulfi", total: 50, sold: 12 },
    { name: "Stick Kulfi", total: 100, sold: 45 },
    { name: "Rabdi Special", total: 40, sold: 35 },
    { name: "Family Pack", total: 20, sold: 5 }
];

let grandTotal = 0;
let grandSold = 0;
const listContainer = document.getElementById('stockList');

// --- Render Logic ---
stockData.forEach(item => {
    // Totals Calculate karo
    grandTotal += item.total;
    grandSold += item.sold;

    const balance = item.total - item.sold;
    const percent = (balance / item.total) * 100;
    
    // Color Logic based on percentage
    let color = '#4caf50'; // Green
    if(percent < 30) color = '#f44336'; // Red
    else if(percent < 60) color = '#ff9800'; // Orange

    // HTML Card Create karo
    const card = `
    <div class="card">
        <div class="row-top">
            <span class="item-name">${item.name}</span>
            <span class="load-badge">Load: ${item.total}</span>
        </div>
        <div class="stats-row">
            <div class="box box-sold">
                <small>Sold</small>
                <b>-${item.sold}</b>
            </div>
            <div class="box box-bal">
                <small>Available</small>
                <b>${balance}</b>
            </div>
        </div>
        <div class="prog-info">
            <span>Stock Level</span>
            <span>${Math.round(percent)}%</span>
        </div>
        <div class="prog-track">
            <div class="prog-fill" style="width: ${percent}%; background: ${color};"></div>
        </div>
    </div>`;

    listContainer.innerHTML += card;
});

// --- Update Top Summary ---
document.getElementById('g-tot').innerText = grandTotal;
document.getElementById('g-sold').innerText = grandSold;
document.getElementById('g-bal').innerText = grandTotal - grandSold;