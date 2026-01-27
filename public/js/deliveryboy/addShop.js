lucide.createIcons();
document.getElementById('addShopForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Shop Registered Successfully!');
    this.reset();
});