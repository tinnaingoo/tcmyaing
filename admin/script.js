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

/* ======================
   CREATE POST FUNCTIONALITY
   ====================== */

const setupCreatePostTab = () => {
    const previewBtn = document.getElementById('previewBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    const copyPreviewBtn = document.getElementById('copyPreviewBtn');
    const tabs = document.querySelectorAll('.tab');
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Button events
    previewBtn.addEventListener('click', previewPost);
    clearBtn.addEventListener('click', clearForm);
    copyBtn.addEventListener('click', copyPostData);
    backToFormBtn.addEventListener('click', () => switchTab('form'));
    copyPreviewBtn.addEventListener('click', copyPostData);
};

const switchTab = (tabId) => {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    
    document.querySelectorAll('#create-post-tab .tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}-tab`);
    });
};

const previewPost = () => {
    const title = document.getElementById('post-title').value;
    const author = document.getElementById('post-author').value;
    const date = document.getElementById('post-date').value;
    const coverImage = document.getElementById('post-cover-image').value;
    const imageAlt = document.getElementById('post-image-alt').value;
    const content = document.getElementById('post-content').value;
    
    if (!title || !author || !date || !coverImage || !imageAlt || !content) {
        showAlert('ကျေးဇူးပြု၍ အကွက်အားလုံးကို ဖြည့်ပါ', 'danger');
        return;
    }
    
    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-meta').innerHTML = `ရေးသူ <a>${author}</a> • ${date}`;
    document.getElementById('preview-image').src = coverImage;
    document.getElementById('preview-image').alt = imageAlt;
    document.getElementById('preview-content').innerHTML = content;
    
    switchTab('preview');
    showAlert('ဆောင်းပါးအစမ်းမြင်ကွင်း အောင်မြင်စွာဖန်တီးပြီးပါပြီ', 'success');
};

const clearForm = () => {
    document.getElementById('post-form').reset();
    document.getElementById('post-date').value = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    showAlert('ဖောင်ကို ရှင်းလင်းပြီးပါပြီ', 'success');
};

const copyPostData = async () => {
    const formElements = document.getElementById('post-form').elements;
    const postData = {
        title: formElements['post-title'].value,
        author: formElements['post-author'].value,
        date: formElements['post-date'].value,
        coverImage: formElements['post-cover-image'].value,
        imageAlt: formElements['post-image-alt'].value,
        content: formElements['post-content'].value
    };
    
    if (Object.values(postData).some(value => !value)) {
        showAlert('ကျေးဇူးပြု၍ အကွက်အားလုံးကို ဖြည့်ပါ', 'danger');
        return;
    }
    
    const postDataString = `const postData = ${JSON.stringify(postData, null, 4)};\n\n// DOM content loaded\ndocument.addEventListener("DOMContentLoaded", () => {\n    // Set title\n    document.getElementById("post-title").textContent = postData.title;\n\n    // Set author and date\n    const postMeta = document.querySelector(".post-meta");\n    if (postMeta) {\n        postMeta.innerHTML = \`ရေးသူ <a>\${postData.author}</a> • \${postData.date}\`;\n    }\n\n    // Set cover image\n    const coverImageContainer = document.getElementById("post-cover-image");\n    if (coverImageContainer) {\n        coverImageContainer.innerHTML = \`<img src="\${postData.coverImage}" alt="\${postData.imageAlt}" />\`;\n    }\n\n    // Set post content\n    const postText = document.getElementById("post-text");\n    if (postText) {\n        postText.innerHTML = postData.content;\n    }\n});`;
    
    try {
        await navigator.clipboard.writeText(postDataString);
        showAlert('ဆောင်းပါးဒေတာများကို clipboard သို့ ကူးယူပြီးပါပြီ!', 'success');
    } catch (err) {
        showAlert('ကူးယူရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်: ' + err, 'danger');
    }
};

/* ======================
   ALL POSTS FUNCTIONALITY
   ====================== */

const updateAllPostsPage = async () => {
    allPosts = await fetchPostData();
    displayPosts(allPosts);
    setupCategoryFilter();
    setupSearchFilter();
};

const fetchPostData = async () => {
    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        localStorage.setItem('postData', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error fetching post data:', error);
        showAlert('ဒေတာများကို ရယူရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်', 'danger');
        return JSON.parse(localStorage.getItem('postData')) || [];
    }
};

const displayPosts = (posts) => {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';
    
    posts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post.title}</td>
            <td>${post.Author}</td>
            <td>${post.Date}</td>
            <td>${post.Category.join(', ')}</td>
            <td>
                <button class="btn btn-small btn-primary edit-post-btn" data-id="${post.PostUrl}">Edit</button>
                <button class="btn btn-small btn-danger delete-post-btn" data-id="${post.PostUrl}">Delete</button>
            </td>
        `;
        postsList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.getAttribute('data-id');
            openEditDialog(postId);
        });
    });
    
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.getAttribute('data-id');
            confirmDeletePost(postId);
        });
    });
};

const setupCategoryFilter = () => {
    const categoryFilter = document.getElementById('category-filter');
    allCategories.clear();
    
    allPosts.forEach(post => post.Category.forEach(cat => allCategories.add(cat)));
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
};

const setupSearchFilter = () => {
    const searchInput = document.getElementById('post-search');
    const categoryFilter = document.getElementById('category-filter');
    
    searchInput.addEventListener('input', () => filterPosts());
    categoryFilter.addEventListener('change', () => filterPosts());
};

const filterPosts = () => {
    const searchTerm = document.getElementById('post-search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    const filtered = allPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                            post.Description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || post.Category.includes(category);
        return matchesSearch && matchesCategory;
    });
    
    displayPosts(filtered);
};

/* ======================
   EDIT POST DIALOG FUNCTIONALITY
   ====================== */

const setupEditPostDialog = () => {
    // Event listeners for dialog controls
    document.querySelector('.close-modal').addEventListener('click', closeEditDialog);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeEditDialog);
    document.getElementById('save-post-btn').addEventListener('click', saveEditedPost);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('edit-post-dialog')) {
            closeEditDialog();
        }
    });
};

const openEditDialog = (postUrl) => {
    const post = allPosts.find(p => p.PostUrl === postUrl);
    if (!post) {
        showAlert('Post not found!', 'danger');
        return;
    }
    
    currentEditingPost = post;
    
    // Populate form fields
    document.getElementById('edit-post-title').value = post.title;
    document.getElementById('edit-post-description').value = post.Description;
    document.getElementById('edit-post-image').value = post.ImageUrl;
    document.getElementById('edit-post-image-caption').value = post.ImageCaption;
    document.getElementById('edit-post-author').value = post.Author;
    document.getElementById('edit-post-date').value = post.Date;
    document.getElementById('edit-post-url').value = post.PostUrl;
    
    // Populate categories
    const categorySelect = document.getElementById('edit-post-category');
    categorySelect.innerHTML = '';
    
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        option.selected = post.Category.includes(cat);
        categorySelect.appendChild(option);
    });
    
    // Show the modal
    document.getElementById('edit-post-dialog').style.display = 'block';
};

const saveEditedPost = () => {
    const postIndex = allPosts.findIndex(p => p.PostUrl === currentEditingPost.PostUrl);
    if (postIndex === -1) {
        showAlert('Post not found in database!', 'danger');
        return;
    }
    
    // Get selected categories
    const categorySelect = document.getElementById('edit-post-category');
    const selectedCategories = Array.from(categorySelect.selectedOptions).map(opt => opt.value);
    
    // Update post data
    allPosts[postIndex] = {
        ...allPosts[postIndex],
        title: document.getElementById('edit-post-title').value,
        Category: selectedCategories,
        Description: document.getElementById('edit-post-description').value,
        ImageUrl: document.getElementById('edit-post-image').value,
        ImageCaption: document.getElementById('edit-post-image-caption').value,
        Author: document.getElementById('edit-post-author').value,
        Date: document.getElementById('edit-post-date').value,
        PostUrl: document.getElementById('edit-post-url').value
    };
    
    // Save back to localStorage
    localStorage.setItem('postData', JSON.stringify(allPosts));
    
    // Update UI
    displayPosts(allPosts);
    showAlert('Post updated successfully!', 'success');
    closeEditDialog();
};

const closeEditDialog = () => {
    document.getElementById('edit-post-dialog').style.display = 'none';
    currentEditingPost = null;
};

const confirmDeletePost = (postUrl) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        deletePost(postUrl);
    }
};

const deletePost = (postUrl) => {
    allPosts = allPosts.filter(post => post.PostUrl !== postUrl);
    localStorage.setItem('postData', JSON.stringify(allPosts));
    displayPosts(allPosts);
    showAlert('Post deleted successfully!', 'success');
};
