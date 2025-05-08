/* ======================
   INITIAL SETUP & UTILITIES
   ====================== */

// Global variables
let currentEditingPost = null;
let allCategories = new Set(['Computer', 'Technology Sharing', 'AI', 'E-book']);
let allPosts = [];
let currentPage = 1;
const postsPerPage = 10;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', async () => {
    // Authentication check
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = '/admin/login.html';
        return;
    }

    // Initialize components
    initializeDarkMode();
    setupCurrentDate();
    setupSidebarNavigation();
    setupCreatePostTab();
    setupEditPostDialog();
    
    // Load data
    await loadInitialData();
    
    // Initialize UI
    updateDashboard();
    initializeCategories();
    updateUsersTab();
    loadSettings();
    
    // Event listeners
    document.getElementById('add-category-btn').addEventListener('click', addCategory);
    document.getElementById('add-user-btn').addEventListener('click', addUser);
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
});

// Utility Functions
const showAlert = (message, type, duration = 5000) => {
    const alertElement = document.getElementById(`alert-${type}`);
    const otherType = type === 'success' ? 'danger' : 'success';
    const otherAlert = document.getElementById(`alert-${otherType}`);
    
    alertElement.textContent = message;
    alertElement.style.display = 'block';
    otherAlert.style.display = 'none';
    
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, duration);
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
    const today = new Date();
    document.getElementById('post-date').value = today.toISOString().split('T')[0];
};

const validateUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const formatDateForDisplay = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

/* ======================
   DATA LOADING FUNCTIONS
   ====================== */

const loadInitialData = async () => {
    try {
        // Load posts data
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error('Failed to fetch posts');
        allPosts = await response.json();
        localStorage.setItem('postData', JSON.stringify(allPosts));
        
        // Initialize categories from posts
        allPosts.forEach(post => {
            post.Category.forEach(cat => allCategories.add(cat));
        });
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showAlert('Failed to load initial data. Using cached data if available.', 'danger');
        
        // Fallback to localStorage if available
        const cachedPosts = JSON.parse(localStorage.getItem('postData')) || [];
        if (cachedPosts.length) {
            allPosts = cachedPosts;
        }
    }
};

/* ======================
   EDIT POST DIALOG ENHANCEMENTS
   ====================== */

const setupEditPostDialog = () => {
    // Dialog control elements
    const modal = document.getElementById('edit-post-dialog');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-post-btn');
    const previewImageBtn = document.getElementById('preview-image-btn');
    
    // Event listeners
    closeBtn.addEventListener('click', closeEditDialog);
    cancelBtn.addEventListener('click', closeEditDialog);
    saveBtn.addEventListener('click', saveEditedPost);
    previewImageBtn.addEventListener('click', previewFeaturedImage);
    
    // Close when clicking outside dialog
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeEditDialog();
    });
    
    // Better keyboard navigation
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeEditDialog();
        if (e.key === 'Tab') handleTabNavigation(e, modal);
    });
    
    // Auto-generate slug from title
    document.getElementById('edit-post-title').addEventListener('blur', function() {
        if (!document.getElementById('edit-post-url').value) {
            const slug = generateSlug(this.value);
            document.getElementById('edit-post-url').value = slug;
        }
    });
};

const handleTabNavigation = (e, modal) => {
    const focusableElements = modal.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
    }
};

const generateSlug = (text) => {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word characters
        .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with dashes
        .replace(/^-+|-+$/g, ''); // Trim dashes from start/end
};

const previewFeaturedImage = () => {
    const imageUrl = document.getElementById('edit-post-image').value;
    const preview = document.getElementById('image-preview');
    
    if (!imageUrl) {
        preview.style.display = 'none';
        return;
    }
    
    preview.src = imageUrl;
    preview.style.display = 'block';
    preview.onerror = () => {
        preview.style.display = 'none';
        showAlert('Image could not be loaded. Please check the URL.', 'danger');
    };
};

const openEditDialog = (postUrl) => {
    const post = allPosts.find(p => p.PostUrl === postUrl);
    if (!post) {
        showAlert('Post not found!', 'danger');
        return;
    }
    
    currentEditingPost = post;
    
    // Populate basic fields
    document.getElementById('edit-post-title').value = post.title;
    document.getElementById('edit-post-description').value = post.Description;
    document.getElementById('edit-post-image').value = post.ImageUrl;
    document.getElementById('edit-post-image-caption').value = post.ImageCaption;
    document.getElementById('edit-post-author').value = post.Author;
    
    // Format date for date input
    const postDate = new Date(post.Date);
    document.getElementById('edit-post-date').valueAsDate = postDate;
    
    // Extract slug from URL
    const slug = post.PostUrl.replace(/^\/home\//, '');
    document.getElementById('edit-post-url').value = slug;
    
    // Populate related posts
    document.getElementById('edit-pre-post-title').value = post['PrePost-Title'] || '';
    document.getElementById('edit-pre-post-url').value = post['PrePost-Url'] || '';
    document.getElementById('edit-next-post-title').value = post['NextPost-Title'] || '';
    document.getElementById('edit-next-post-url').value = post['NextPost-Url'] || '';
    
    // Populate categories
    populateCategorySelect(post.Category);
    
    // Show the modal and preview image
    document.getElementById('edit-post-dialog').style.display = 'block';
    previewFeaturedImage();
    
    // Focus first field
    document.getElementById('edit-post-title').focus();
};

const populateCategorySelect = (postCategories = []) => {
    const categoryContainer = document.getElementById('edit-post-category');
    categoryContainer.innerHTML = '';
    
    allCategories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-checkbox';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `category-${cat.replace(/\s+/g, '-').toLowerCase()}`;
        checkbox.value = cat;
        checkbox.checked = postCategories.includes(cat);
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = cat;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        categoryContainer.appendChild(div);
    });
};

const saveEditedPost = async () => {
    // Validate required fields
    const requiredFields = [
        'edit-post-title', 'edit-post-url', 'edit-post-description',
        'edit-post-image', 'edit-post-image-caption', 'edit-post-author',
        'edit-post-date'
    ];
    
    const fieldValues = {};
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const value = document.getElementById(fieldId).value.trim();
        fieldValues[fieldId] = value;
        
        if (!value) {
            showAlert(`Please fill in the ${fieldId.replace('edit-post-', '')} field`, 'danger');
            isValid = false;
        }
    });
    
    if (!isValid) return;
    
    // Validate image URL
    if (!validateUrl(fieldValues['edit-post-image'])) {
        showAlert('Please enter a valid URL for the featured image', 'danger');
        return;
    }
    
    // Get selected categories
    const selectedCategories = Array.from(
        document.querySelectorAll('#edit-post-category input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);
    
    if (selectedCategories.length === 0) {
        showAlert('Please select at least one category', 'danger');
        return;
    }
    
    // Format the new URL
    const slug = fieldValues['edit-post-url'].replace(/^\/|\/$/g, '');
    const newUrl = `/home/${slug}`;
    
    // Check for URL uniqueness (except for current post)
    const isUrlUnique = !allPosts.some(post => 
        post.PostUrl === newUrl && post.PostUrl !== currentEditingPost.PostUrl
    );
    
    if (!isUrlUnique) {
        showAlert('This URL is already used by another post. Please choose a different one.', 'danger');
        return;
    }
    
    try {
        // Prepare the updated post
        const updatedPost = {
            ...currentEditingPost,
            title: fieldValues['edit-post-title'],
            Description: fieldValues['edit-post-description'],
            ImageUrl: fieldValues['edit-post-image'],
            ImageCaption: fieldValues['edit-post-image-caption'],
            Author: fieldValues['edit-post-author'],
            Date: new Date(fieldValues['edit-post-date']).toISOString().split('T')[0],
            PostUrl: newUrl,
            Category: selectedCategories,
            'PrePost-Title': document.getElementById('edit-pre-post-title').value.trim(),
            'PrePost-Url': document.getElementById('edit-pre-post-url').value.trim(),
            'NextPost-Title': document.getElementById('edit-next-post-title').value.trim(),
            'NextPost-Url': document.getElementById('edit-next-post-url').value.trim()
        };
        
        // Update in the array
        const postIndex = allPosts.findIndex(p => p.PostUrl === currentEditingPost.PostUrl);
        allPosts[postIndex] = updatedPost;
        
        // Save to localStorage
        localStorage.setItem('postData', JSON.stringify(allPosts));
        
        // Update UI
        displayPosts(allPosts);
        showAlert('Post updated successfully!', 'success');
        closeEditDialog();
        
    } catch (error) {
        console.error('Error saving post:', error);
        showAlert('Failed to save post. Please try again.', 'danger');
    }
};

const closeEditDialog = () => {
    document.getElementById('edit-post-dialog').style.display = 'none';
    document.getElementById('edit-post-form').reset();
    document.getElementById('image-preview').style.display = 'none';
    currentEditingPost = null;
};

/* ======================
   POST MANAGEMENT FUNCTIONS
   ====================== */

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

// ... (rest of your existing code for other functionality)

/* ======================
   CATEGORY MANAGEMENT
   ====================== */

const addCategory = () => {
    const newCategoryInput = document.getElementById('new-category');
    const category = newCategoryInput.value.trim();
    
    if (!category) {
        showAlert('Please enter a category name', 'danger');
        return;
    }
    
    if (allCategories.has(category)) {
        showAlert('Category already exists', 'warning');
        return;
    }
    
    allCategories.add(category);
    localStorage.setItem('categories', JSON.stringify([...allCategories]));
    newCategoryInput.value = '';
    updateCategoriesTab();
    showAlert('Category added successfully!', 'success');
};

const deleteCategory = (category) => {
    // Check if category is used in any posts
    const isCategoryInUse = allPosts.some(post => 
        post.Category.includes(category)
    );
    
    if (isCategoryInUse) {
        showAlert('Cannot delete category that is in use by posts', 'danger');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the category "${category}"?`)) {
        allCategories.delete(category);
        localStorage.setItem('categories', JSON.stringify([...allCategories]));
        updateCategoriesTab();
        showAlert('Category deleted successfully!', 'success');
    }
};

/* ======================
   USER MANAGEMENT
   ====================== */

const addUser = () => {
    const username = document.getElementById('new-user').value.trim();
    const password = document.getElementById('new-password').value.trim();
    
    if (!username || !password) {
        showAlert('Please enter both username and password', 'danger');
        return;
    }
    
    if (allUsers.some(user => user.username === username)) {
        showAlert('Username already exists', 'warning');
        return;
    }
    
    allUsers.push({ 
        username, 
        password, 
        role: 'editor',
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('users', JSON.stringify(allUsers));
    document.getElementById('new-user').value = '';
    document.getElementById('new-password').value = '';
    updateUsersTab();
    showAlert('User added successfully!', 'success');
};

const deleteUser = (username) => {
    if (username === 'admin') {
        showAlert('Cannot delete the admin user', 'danger');
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
   SETTINGS MANAGEMENT
   ====================== */

const loadSettings = () => {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        siteTitle: 'TC-Myaing Admin',
        postsPerPage: 10,
        defaultAuthor: 'Admin'
    };
    
    document.getElementById('site-title').value = settings.siteTitle;
    document.getElementById('posts-per-page').value = settings.postsPerPage;
    document.getElementById('default-author').value = settings.defaultAuthor;
    
    // Apply settings to UI
    document.title = settings.siteTitle;
    document.querySelector('.logo').textContent = settings.siteTitle;
};

const saveSettings = (e) => {
    e.preventDefault();
    
    const siteTitle = document.getElementById('site-title').value.trim();
    const postsPerPage = parseInt(document.getElementById('posts-per-page').value, 10);
    const defaultAuthor = document.getElementById('default-author').value.trim();
    
    if (!siteTitle) {
        showAlert('Site title cannot be empty', 'danger');
        return;
    }
    
    if (isNaN(postsPerPage) || postsPerPage < 1 || postsPerPage > 50) {
        showAlert('Posts per page must be between 1 and 50', 'danger');
        return;
    }
    
    const settings = {
        siteTitle,
        postsPerPage,
        defaultAuthor
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Apply changes
    document.title = siteTitle;
    document.querySelector('.logo').textContent = siteTitle;
    
    showAlert('Settings saved successfully!', 'success');
};
