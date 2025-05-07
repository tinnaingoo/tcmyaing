/* ======================
   INITIAL SETUP & UTILITIES
   ====================== */

// Global variables
let currentEditingPost = null;
let allCategories = new Set();
let allPosts = [];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    setupCurrentDate();
    setupSidebarNavigation();
    setupCreatePostTab();
    setupEditPostDialog();
    initializeDashboard();
});

// Utility Functions
const showAlert = (message, type) => {
    const successAlert = document.getElementById('alert-success');
    const dangerAlert = document.getElementById('alert-danger');
    
    const alertElement = type === 'success' ? successAlert : dangerAlert;
    const otherAlert = type === 'success' ? dangerAlert : successAlert;
    
    alertElement.textContent = message;
    alertElement.style.display = 'block';
    otherAlert.style.display = 'none';
    
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
};

const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    
    darkModeToggle.innerHTML = isDarkMode 
        ? '<i class="fas fa-sun"></i> Light Mode' 
        : '<i class="fas fa-moon"></i> Dark Mode';
};

const initializeDarkMode = () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
};

const setupCurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('post-date').value = formattedDate;
};

/* ======================
   SIDEBAR & NAVIGATION
   ====================== */

const setupSidebarNavigation = () => {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('href').substring(1);
            
            if (target === 'logout') {
                window.location.href = '/index.html';
                return;
            }
            
            // Update active states
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active'));
            const targetTab = document.getElementById(`${target}-tab`);
            if (targetTab) targetTab.classList.add('active');
            
            // Load appropriate content
            if (target === 'dashboard') updateDashboard();
            else if (target === 'all-posts') updateAllPostsPage();
            else if (target === 'create-post') switchTab('form');
        });
    });
};

/* ======================
   DASHBOARD FUNCTIONALITY
   ====================== */

const updateDashboard = async () => {
    await loadChartJS();
    const posts = await fetchPostData();
    
    // Basic stats
    document.getElementById('total-posts').textContent = posts.length;
    
    // Category count
    const categories = new Set();
    posts.forEach(post => post.Category.forEach(cat => categories.add(cat)));
    document.getElementById('total-categories').textContent = categories.size;
    
    // Recent posts (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentPosts = posts.filter(post => new Date(post.Date) >= oneWeekAgo);
    document.getElementById('recent-posts').textContent = recentPosts.length;
    
    // Prepare charts
    prepareCategoryChart(posts);
    prepareDateChart(posts);
};

const loadChartJS = () => {
    return new Promise((resolve) => {
        if (typeof Chart !== 'undefined') return resolve();
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
};

const prepareCategoryChart = (posts) => {
    const categoryCount = {};
    posts.forEach(post => {
        post.Category.forEach(cat => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
    });
    
    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryCount),
            datasets: [{
                label: 'Posts by Category',
                data: Object.values(categoryCount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
};

const prepareDateChart = (posts) => {
    const dateCount = {};
    posts.forEach(post => {
        const date = new Date(post.Date).toLocaleDateString();
        dateCount[date] = (dateCount[date] || 0) + 1;
    });
    
    const ctx = document.getElementById('dateChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(dateCount),
            datasets: [{
                label: 'Posts by Date',
                data: Object.values(dateCount),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
};
