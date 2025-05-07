/* ======================
   INITIAL SETUP & UTILITIES
   ====================== */

// Global variables
let currentEditingPost = null;
let allCategories = new Set();
let allPosts = JSON.parse(localStorage.getItem('postData')) || [];
let allUsers = JSON.parse(localStorage.getItem('users')) || [
    { username: 'admin', password: 'password123', role: 'admin' }
];
let currentPage = 1;

// Predefined categories
const predefinedCategories = ['Computer', 'AI', 'Technology Sharing'];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = '/admin/login.html';
        return;
    }
    initializeDarkMode();
    setupCurrentDate();
    setupSidebarNavigation();
    setupCreatePostTab();
    setupEditPostDialog();
    updateDashboard();
    initializeCategories();
    updateUsersTab();
    loadSettings();
    document.getElementById('add-category-btn').addEventListener('click', addCategory);
    document.getElementById('add-user-btn').addEventListener('click', addUser);
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
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
    
    const darkModeToggle = document.getElementById('darkModeToggle');
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
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('post-date').value = today;
};

const validateUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const validateDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
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
                localStorage.removeItem('postData');
                localStorage.removeItem('categories');
                localStorage.removeItem('users');
                localStorage.removeItem('settings');
                localStorage.removeItem('isAuthenticated');
                window.location.href = '/admin/login.html';
                return;
            }
            
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active'));
            const targetTab = document.getElementById(`${target}-tab`);
            if (targetTab) targetTab.classList.add('active');
            
            if (target === 'dashboard') updateDashboard();
            else if (target === 'all-posts') updateAllPostsPage();
            else if (target === 'create-post') switchTab('form');
            else if (target === 'categories') updateCategoriesTab();
            else if (target === 'users') updateUsersTab();
            else if (target === 'settings') loadSettings();
        });
    });
};

/* ======================
   DASHBOARD FUNCTIONALITY
   ====================== */

const updateDashboard = async () => {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    document.querySelector('#dashboard-tab .card').appendChild(spinner);

    try {
        await loadChartJS();
        const posts = await fetchPostData();
        
        document.getElementById('total-posts').textContent = posts.length;
        
        const categories = new Set();
        posts.forEach(post => post.Category.forEach(cat => categories.add(cat)));
        document.getElementById('total-categories').textContent = categories.size;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentPosts = posts.filter(post => new Date(post.Date) >= oneWeekAgo);
        document.getElementById('recent-posts').textContent = recentPosts.length;
        
        prepareCategoryChart(posts);
        prepareDateChart(posts);
    } catch (error) {
        showAlert('Error loading dashboard data', 'danger');
    } finally {
        spinner.remove();
    }
};

const loadChartJS = () => {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') return resolve();
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Chart.js'));
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
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
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
    
    if (!validateUrl(coverImage)) {
        showAlert('Please enter a valid URL for the cover image', 'danger');
        return;
    }
    
    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-meta').innerHTML = `ရေးသူ <a>${author}</a> • ${formatDate(date)}`;
    document.getElementById('preview-image').src = coverImage;
    document.getElementById('preview-image').alt = imageAlt;
    document.getElementById('preview-content').innerHTML = DOMPurify.sanitize(content);
    
    switchTab('preview');
    showAlert('ဆောင်းပါးအစမ်းမြင်ကွင်း အောင်မြင်စွာဖန်တီးပြီးပါပြီ', 'success');
};

const clearForm = () => {
    document.getElementById('post-form').reset();
    setupCurrentDate();
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
    
    if (!validateUrl(postData.coverImage)) {
        showAlert('Please enter a valid URL for the cover image', 'danger');
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
    try {
        allPosts = await fetchPostData();
        displayPosts(allPosts);
        setupCategoryFilter();
        setupSearchFilter();
    } catch (error) {
        showAlert('Failed to load posts', 'danger');
    }
};

const fetchPostData = async () => {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    document.querySelector('.main-content').appendChild(spinner);

    try {
        // For production, replace with real API call
        // const response = await fetch('/api/posts', {
        //     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        // });
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        allPosts = data;
        localStorage.setItem('postData', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error fetching post data:', error);
        showAlert('ဒေတာများကို ရယူရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်', 'danger');
        return allPosts.length ? allPosts : [];
    } finally {
        spinner.remove();
    }
};

const displayPosts = (posts) => {
    const postsList = document.getElementById('posts-list');
    const settings = JSON.parse(localStorage.getItem('settings')) || { postsPerPage: 10 };
    const postsPerPage = settings.postsPerPage;
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const paginatedPosts = posts.slice(start, end);

    let html = '';
    paginatedPosts.forEach(post => {
        html += `
            <tr>
                <td data-label="Title">${post.title}</td>
                <td data-label="Author">${post.Author}</td>
                <td data-label="Date">${post.Date}</td>
                <td data-label="Categories">${post.Category.join(', ')}</td>
                <td data-label="Actions">
                    <button class="btn btn-small btn-primary edit-post-btn" data-id="${post.PostUrl}">Edit</button>
                    <button class="btn btn-small btn-danger delete-post-btn" data-id="${post.PostUrl}">Delete</button>
                </td>
            </tr>
        `;
    });
    postsList.innerHTML = html;

    document.getElementById('page-info').textContent = `Page ${currentPage} of ${Math.ceil(posts.length / postsPerPage)}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === Math.ceil(posts.length / postsPerPage);

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
    
    searchInput.addEventListener('input', debounce(() => filterPosts(), 300));
    categoryFilter.addEventListener('change', () => filterPosts());

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPosts(allPosts);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const settings = JSON.parse(localStorage.getItem('settings')) || { postsPerPage: 10 };
        if (currentPage < Math.ceil(allPosts.length / settings.postsPerPage)) {
            currentPage++;
            displayPosts(allPosts);
        }
    });
};

const filterPosts = () => {
    const searchTerm = document.getElementById('post-search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    currentPage = 1;
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
    const modal = document.getElementById('edit-post-dialog');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-post-btn');
    
    closeBtn.addEventListener('click', closeEditDialog);
    cancelBtn.addEventListener('click', closeEditDialog);
    saveBtn.addEventListener('click', saveEditedPost);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeEditDialog();
    });
    
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = modal.querySelectorAll('input, button, select, textarea');
            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
};

const populatePostDropdowns = (excludePostUrl) => {
    const prePostSelect = document.getElementById('edit-pre-post');
    const nextPostSelect = document.getElementById('edit-next-post');
    
    prePostSelect.innerHTML = '<option value="">None</option>';
    nextPostSelect.innerHTML = '<option value="">None</option>';
    
    allPosts.forEach(post => {
        if (post.PostUrl === excludePostUrl) return;
        
        const preOption = document.createElement('option');
        preOption.value = post.PostUrl;
        preOption.textContent = post.title;
        prePostSelect.appendChild(preOption);
        
        const nextOption = document.createElement('option');
        nextOption.value = post.PostUrl;
        nextOption.textContent = post.title;
        nextPostSelect.appendChild(nextOption);
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
    
    // Populate categories with checkboxes
    const categoryContainer = document.getElementById('edit-post-category');
    categoryContainer.innerHTML = '';
    
    predefinedCategories.forEach(cat => {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'edit-post-category';
        checkbox.value = cat;
        checkbox.checked = post.Category.includes(cat);
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${cat}`));
        categoryContainer.appendChild(label);
    });
    
    // Populate Previous and Next Post dropdowns
    populatePostDropdowns(postUrl);
    
    // Set Previous and Next Post values if they exist
    document.getElementById('edit-pre-post').value = post.PrePostUrl || '';
    document.getElementById('edit-next-post').value = post.NextPostUrl || '';
    
    const modal = document.getElementById('edit-post-dialog');
    modal.style.display = 'block';
    modal.querySelector('input, button, select, textarea').focus();
};

const saveEditedPost = async () => {
    const postIndex = allPosts.findIndex(p => p.PostUrl === currentEditingPost.PostUrl);
    if (postIndex === -1) {
        showAlert('Post not found in database!', 'danger');
        return;
    }
    
    // Get selected categories
    const categoryCheckboxes = document.getElementsByName('edit-post-category');
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    if (selectedCategories.length === 0) {
        showAlert('Please select at least one category', 'danger');
        return;
    }
    
    // Get other form values
    const title = document.getElementById('edit-post-title').value;
    const description = document.getElementById('edit-post-description').value;
    const imageUrl = document.getElementById('edit-post-image').value;
    const imageCaption = document.getElementById('edit-post-image-caption').value;
    const author = document.getElementById('edit-post-author').value;
    const date = document.getElementById('edit-post-date').value;
    const postUrl = document.getElementById('edit-post-url').value;
    const prePostUrl = document.getElementById('edit-pre-post').value;
    const nextPostUrl = document.getElementById('edit-next-post').value;
    
    // Validation
    if (!title || !description || !imageUrl || !imageCaption || !author || !date || !postUrl) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    if (!validateUrl(imageUrl)) {
        showAlert('Please enter a valid URL for the image', 'danger');
        return;
    }
    
    if (!validateDate(date)) {
        showAlert('Please enter a valid date', 'danger');
        return;
    }
    
    if (allPosts.some(p => p.PostUrl === postUrl && p.PostUrl !== currentEditingPost.PostUrl)) {
        showAlert('Post URL already exists', 'danger');
        return;
    }
    
    // Prepare the updated post data
    const prePost = allPosts.find(p => p.PostUrl === prePostUrl);
    const nextPost = allPosts.find(p => p.PostUrl === nextPostUrl);
    
    const updatedPost = {
        Category: selectedCategories,
        title,
        Description: description,
        ImageUrl: imageUrl,
        ImageCaption: imageCaption,
        Author: author,
        Date: date,
        PostUrl: postUrl,
        PrePostTitle: prePost ? prePost.title : '',
        PrePostUrl: prePostUrl || '',
        NextPostTitle: nextPost ? nextPost.title : '',
        NextPostUrl: nextPostUrl || ''
    };
    
    // Update the post in allPosts
    allPosts[postIndex] = {
        ...allPosts[postIndex],
        ...updatedPost
    };
    
    localStorage.setItem('postData', JSON.stringify(allPosts));
    displayPosts(allPosts);
    
    // Copy to clipboard
    const postDataString = JSON.stringify(updatedPost, null, 4);
    try {
        await navigator.clipboard.writeText(postDataString);
        showAlert('Post updated and copied to clipboard successfully!', 'success');
    } catch (err) {
        showAlert('Post updated, but failed to copy to clipboard: ' + err, 'danger');
    }
    
    closeEditDialog();
};

const closeEditDialog = () => {
    document.getElementById('edit-post-dialog').style.display = 'none';
    currentEditingPost = null;
    document.querySelector('.sidebar-menu a.active').focus();
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

/* ======================
   CATEGORIES FUNCTIONALITY
   ====================== */

const initializeCategories = () => {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        allCategories = new Set(JSON.parse(storedCategories));
    }
    updateCategoriesTab();
};

const updateCategoriesTab = () => {
    const categoriesList = document.getElementById('categories-list');
    let html = '';
    
    allCategories.forEach(category => {
        html += `
            <tr>
                <td>${category}</td>
                <td>
                    <button class="btn btn-small btn-danger delete-category-btn" data-category="${category}">Delete</button>
                </td>
            </tr>
        `;
    });
    categoriesList.innerHTML = html;
    
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            deleteCategory(category);
        });
    });
};

const addCategory = () => {
    const newCategoryInput = document.getElementById('new-category');
    const category = newCategoryInput.value.trim();
    if (!category) {
        showAlert('Please enter a category name', 'danger');
        return;
    }
    if (allCategories.has(category)) {
        showAlert('Category already exists', 'danger');
        return;
    }
    
    allCategories.add(category);
    localStorage.setItem('categories', JSON.stringify([...allCategories]));
    newCategoryInput.value = '';
    updateCategoriesTab();
    setupCategoryFilter();
    showAlert('Category added successfully!', 'success');
};

const deleteCategory = (category) => {
    if (allPosts.some(post => post.Category.includes(category))) {
        showAlert('Cannot delete category in use by posts', 'danger');
        return;
    }
    if (confirm(`Are you sure you want to delete the category "${category}"?`)) {
        allCategories.delete(category);
        localStorage.setItem('categories', JSON.stringify([...allCategories]));
        updateCategoriesTab();
        setupCategoryFilter();
        showAlert('Category deleted successfully!', 'success');
    }
};

/* ======================
   USERS FUNCTIONALITY
   ====================== */

const updateUsersTab = () => {
    const usersList = document.getElementById('users-list');
    let html = '';
    
    allUsers.forEach(user => {
        html += `
            <tr>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-small btn-danger delete-user-btn" data-username="${user.username}">Delete</button>
                </td>
            </tr>
        `;
    });
    usersList.innerHTML = html;
    
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const username = btn.getAttribute('data-username');
            deleteUser(username);
        });
    });
};

const addUser = () => {
    const usernameInput = document.getElementById('new-user');
    const passwordInput = document.getElementById('new-password');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        showAlert('Please enter both username and password', 'danger');
        return;
    }
    if (allUsers.some(user => user.username === username)) {
        showAlert('Username already exists', 'danger');
        return;
    }
    
    allUsers.push({ username, password, role: 'editor' });
    localStorage.setItem('users', JSON.stringify(allUsers));
    usernameInput.value = '';
    passwordInput.value = '';
    updateUsersTab();
    showAlert('User added successfully!', 'success');
};

const deleteUser = (username) => {
    if (username === 'admin') {
        showAlert('Cannot delete default admin user', 'danger');
        return;
    }
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
        allUsers = allUsers.filter(user => user.username !== username);
        localStorage.setItem('users', JSON.stringify(allUsers));
        updateUsersTab();
        showAlert('User deleted successfully!', 'success');
    }
};

/* ======================
   SETTINGS FUNCTIONALITY
   ====================== */

const loadSettings = () => {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        siteTitle: 'TC-Myaing Admin',
        postsPerPage: 10
    };
    document.getElementById('site-title').value = settings.siteTitle;
    document.getElementById('posts-per-page').value = settings.postsPerPage;
    document.title = settings.siteTitle;
    document.querySelector('.logo').textContent = settings.siteTitle;
};

const saveSettings = (e) => {
    e.preventDefault();
    const siteTitle = document.getElementById('site-title').value.trim();
    const postsPerPage = parseInt(document.getElementById('posts-per-page').value, 10);
    
    if (!siteTitle) {
        showAlert('Please enter a site title', 'danger');
        return;
    }
    if (isNaN(postsPerPage) || postsPerPage < 1 || postsPerPage > 100) {
        showAlert('Posts per page must be between 1 and 100', 'danger');
        return;
    }
    
    const settings = { siteTitle, postsPerPage };
    localStorage.setItem('settings', JSON.stringify(settings));
    document.title = siteTitle;
    document.querySelector('.logo').textContent = siteTitle;
    showAlert('Settings saved successfully!', 'success');
    updateAllPostsPage();
};
