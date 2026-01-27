lucide.createIcons();
const shops = [
    {name:"Sharma Store", owner:"Ramesh", addr:"Main Market", c:"bg-orange"},
    {name:"Gupta Kirana", owner:"Suresh", addr:"Kolar Road", c:"bg-green"},
    {name:"City Cafe", owner:"Amit", addr:"MP Nagar", c:"bg-blue"}
];

const list = document.getElementById('list');
function render(data){
    list.innerHTML = "";
    data.forEach(s => {
        list.innerHTML += `<div class="shop-card">
            <div class="icon-box ${s.c}"><i data-lucide="store"></i></div>
            <div class="details"><div class="shop-name">${s.name}</div><div class="owner">${s.owner}</div><div class="owner" style="color:#aaa">${s.addr}</div></div>
            <button class="add-btn" onclick="openModal('${s.name}')"><i data-lucide="plus"></i></button>
        </div>`;
    });
    lucide.createIcons();
}
render(shops);

const modal = document.getElementById('modal');
const rate = document.getElementById('rate'), pkt = document.getElementById('pkt'), loose = document.getElementById('loose');

function openModal(name) { 
    document.getElementById('m-shop').innerText = name; 
    modal.classList.add('active'); 
    pkt.value = ""; loose.value = ""; calc();
}
function closeModal() { modal.classList.remove('active'); }
function setPay(el) { document.querySelectorAll('.p-opt').forEach(e=>e.classList.remove('active')); el.classList.add('active'); }

function calc() {
    const p = Number(pkt.value)||0, l = Number(loose.value)||0, r = Number(rate.value)||0;
    const q = (p*50)+l;
    document.getElementById('t-qty').innerText = q;
    document.getElementById('t-amt').innerText = "₹"+(q*r);
}
pkt.addEventListener('input', calc); loose.addEventListener('input', calc); rate.addEventListener('input', calc);

function save() {
    alert("Sale Saved: " + document.getElementById('t-amt').innerText);
    closeModal();
}