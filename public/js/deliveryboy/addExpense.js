lucide.createIcons();

// --- 1. Auto Set Date & Time ---
function updateTime() {
    const now = new Date();
    // Format: 26 Jan, 10:30 AM
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    document.getElementById('autoDate').value = now.toLocaleDateString('en-IN', options);
}
updateTime();

// --- 2. Mock Data (Aaj ke purane kharche) ---
let expenses = [
    { title: "Petrol", amt: 100, desc: "Bike tank refill", time: "09:15 am" },
    { title: "Tea & Snacks", amt: 30, desc: "Breakfast at Dewas Naka", time: "10:00 am" }
];

const listContainer = document.getElementById('expenseList');
const form = document.getElementById('expenseForm');

// --- 3. Render List Function ---
function renderExpenses() {
    listContainer.innerHTML = "";
    
    // Naya kharcha upar dikhe (reverse)
    expenses.slice().reverse().forEach(ex => {
        const card = `
            <div class="expense-item">
                <div class="ex-info">
                    <h4>${ex.title}</h4>
                    <span class="ex-desc">${ex.desc}</span>
                    <div class="ex-time"><i data-lucide="clock" style="width:10px;"></i> ${ex.time}</div>
                </div>
                <div class="ex-amt">-₹${ex.amt}</div>
            </div>
        `;
        listContainer.innerHTML += card;
    });
    lucide.createIcons();
}

// Initial Load
renderExpenses();

// --- 4. Add New Expense Logic ---
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('exTitle').value;
    const amount = document.getElementById('exAmount').value;
    const desc = document.getElementById('exDesc').value;
    
    // Get current time only for the new entry
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add to Array
    expenses.push({
        title: title,
        amt: amount,
        desc: desc || "No details",
        time: timeString
    });

    // Alert & Reset
    alert(`Expense Added: ₹${amount} for ${title}`);
    form.reset();
    updateTime(); // Time wapas update karo agle ke liye
    renderExpenses(); // List refresh karo
});