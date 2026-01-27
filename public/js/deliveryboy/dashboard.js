lucide.createIcons();

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function toggleDuty(el) {
    const txt = document.getElementById('duty-text');
    if(el.checked) {
        txt.innerText = "ON DUTY";
        txt.style.color = "#4caf50";
    } else {
        txt.innerText = "OFF DUTY";
        txt.style.color = "#777";
    }
}