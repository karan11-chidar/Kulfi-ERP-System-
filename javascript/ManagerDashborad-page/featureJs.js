lucide.createIcons();

const menuBtn = document.getElementById("menu-btn");
const closeBtn = document.getElementById("close-sidebar");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

// Function to open sidebar
const openSidebar = () => {
  sidebar.classList.add("active");
  overlay.classList.add("active");
};

// Function to close sidebar
const closeSidebar = () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
};

// Event Listeners
menuBtn.addEventListener("click", openSidebar);
closeBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar); // Overlay par click karne se bhi band hoga
