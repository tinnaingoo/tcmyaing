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
    loadExistingPosts(); // Load dropdown with posts from post-data.json
});

// Utility Functions
const showAlert = (message, type) => {
    const successAlert = document.getElementById('alert-success');
    const dangerAlert = document.getElementById('alert-danger');
    
    // Check if elements exist
    if (!successAlert || !dangerAlert) {
        console.error('Alert elements not found in the DOM!');
        return;
    }

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

const normalizeUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? url : `/${url}`;
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
    const fetchDataBtn = document.getElementById('fetch-data-btn');
    const existingPostSelect = document.getElementById('existing-post-select');
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
    fetchDataBtn.addEventListener('click', fetchDataFromUrl);
    existingPostSelect.addEventListener('change', loadExistingPost);

    populateExistingPosts();
};

const loadExistingPosts = async () => {
    const select = document.getElementById('existing-post-select');
    select.innerHTML = '<option value="">Select an existing post to edit</option>';

    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error('Failed to fetch post-data.json');
        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            console.log('No posts available in post-data.json.');
            return;
        }

        // Get current website domain
        const currentDomain = window.location.origin; // e.g., https://example.com

        // Populate dropdown with post titles and construct full URL
        posts.forEach(post => {
            if (post.title && post.PostUrl) {
                const fullUrl = `${currentDomain}${post.PostUrl}.html`;
                const option = document.createElement('option');
                option.value = fullUrl; // Store the full URL as the value
                option.textContent = post.title;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading posts from post-data.json:', error);
        showAlert('Error loading posts: ' + error.message, 'danger');
    }
};

const populateExistingPosts = () => {
    const existingPostSelect = document.getElementById('existing-post-select');
    if (!existingPostSelect) {
        console.error('Existing post select element not found!');
        return;
    }
    existingPostSelect.innerHTML = '<option value="">Select an existing post to edit</option>';
    allPosts.forEach(post => {
        const option = document.createElement('option');
        option.value = post.PostUrl;
        option.textContent = `${post.title} (${post.PostUrl})`;
        existingPostSelect.appendChild(option);
    });
};

const loadExistingPost = async () => {
    const select = document.getElementById('existing-post-select');
    const selectedUrl = select.value;

    if (!selectedUrl) {
        clearForm();
        return;
    }

    // Automatically populate the URL input and trigger fetch
    const urlInput = document.getElementById('post-url-input');
    urlInput.value = selectedUrl;

    // Call fetchDataFromUrl to fetch data from the selected URL
    await fetchDataFromUrl();
};

const fetchDataFromUrl = async () => {
    const urlInput = document.getElementById('post-url-input');
    const url = urlInput.value.trim();
    if (!url || !validateUrl(url)) {
        showAlert('ကျေးဇူးပြု၍ မှန်ကန်သော URL ထည့်ပါ', 'danger');
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch the URL');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract postData from <script> tag
        const scriptTag = doc.querySelector('script:not([src])');
        let postData = null;
        if (scriptTag) {
            try {
                const scriptContent = scriptTag.textContent;
                const postDataMatch = scriptContent.match(/const\s+postData\s*=\s*({[\s\S]*?});/);
                if (postDataMatch && postDataMatch[1]) {
                    postData = JSON.parse(postDataMatch[1]);
                }
            } catch (e) {
                console.error('Error parsing postData:', e);
            }
        }

        if (!postData) {
            throw new Error('postData not found in the webpage script');
        }

        // Save fetched postData to allPosts
        if (!allPosts.some(p => p.title === postData.title)) {
            allPosts.push(postData);
            localStorage.setItem('postData', JSON.stringify(allPosts));
            populateExistingPosts(); // Refresh the dropdown
        }

        // Populate form with postData
        document.getElementById('post-title').value = postData.title || '';
        document.getElementById('post-author').value = postData.author || '';
        document.getElementById('post-date').value = postData.date ? new Date(postData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        document.getElementById('post-cover-image').value = postData.coverImage || '';
        document.getElementById('post-image-alt').value = postData.imageAlt || '';
        document.getElementById('post-content').value = postData.content || '';

        // Debug log to check extracted data
        console.log('Fetched postData:', postData);

        showAlert('Data fetched from URL successfully!', 'success');
    } catch (error) {
        console.error('Fetch Error:', error);
        showAlert('ဒေတာကို URL မှ ဆွဲယူရာတွင် အမှားဖြစ်ခဲ့သည်: ' + error.message, 'danger');
    }
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
    document.getElementById('preview-meta').innerHTML = `By <a>${author}</a> • ${formatDate(date)}`;
    document.getElementById('preview-image').src = coverImage;
    document.getElementById('preview-image').alt = imageAlt;
    document.getElementById('preview-content').innerHTML = DOMPurify.sanitize(content);
    
    switchTab('preview');
    showAlert('ဆောင်းပါးအစမ်းမြင်ကွင်း အောင်မြင်စွာဖန်တီးပြီးပါပြီ', 'success');
};

const clearForm = () => {
    document.getElementById('post-form').reset();
    document.getElementById('existing-post-select').value = '';
    document.getElementById('post-url-input').value = '';
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
    
    const postDataString = `const postData = ${JSON.stringify(postData, null, 4)};`;
    
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
    if (!modal) {
        console.error('Edit post dialog element not found!');
        return;
    }
    
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

const openEditDialog = (postUrl) => {
    console.log('Attempting to open edit dialog for post URL:', postUrl);
    
    const post = allPosts.find(p => p.PostUrl === postUrl);
    if (!post) {
        console.error('Post not found with URL:', postUrl);
        showAlert('Post not found!', 'danger');
        return;
    }
    
    currentEditingPost = post;
    console.log('Post found:', post);
    
    const modal = document.getElementById('edit-post-dialog');
    if (!modal) {
        console.error('Edit post dialog element not found!');
        showAlert('Error: Edit dialog not found in the page!', 'danger');
        return;
    }
    
    // Format date for input[type="date"]
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Populate all fields
    document.getElementById('edit-post-title').value = post.title || '';
    document.getElementById('edit-post-description').value = post.Description || '';
    document.getElementById('edit-post-image').value = post.ImageUrl || '';
    document.getElementById('edit-post-image-caption').value = post.ImageCaption || '';
    document.getElementById('edit-post-author').value = post.Author || '';
    document.getElementById('edit-post-date').value = formatDateForInput(post.Date) || '';
    document.getElementById('edit-post-url').value = post.PostUrl || '';

    // Populate categories
    const categoryContainer = document.getElementById('edit-post-category');
    if (!categoryContainer) {
        console.error('Category container not found!');
        showAlert('Error: Category container not found in the dialog!', 'danger');
        return;
    }
    categoryContainer.innerHTML = '';
    
    const allUniqueCategories = [...new Set([
        ...predefinedCategories,
        ...allPosts.flatMap(p => p.Category || [])
    ])];
    
    allUniqueCategories.forEach(cat => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `category-${cat.toLowerCase().replace(/\s+/g, '-')}`;
        checkbox.value = cat;
        checkbox.checked = post.Category && post.Category.includes(cat);
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = cat;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        categoryContainer.appendChild(div);
    });

    // Populate Previous/Next Post dropdowns
    const prePostSelect = document.getElementById('edit-pre-post');
    const nextPostSelect = document.getElementById('edit-next-post');
    
    if (!prePostSelect || !nextPostSelect) {
        console.error('Previous/Next post dropdowns not found!');
        showAlert('Error: Previous/Next post dropdowns not found in the dialog!', 'danger');
        return;
    }
    
    prePostSelect.innerHTML = '<option value="">None</option>';
    nextPostSelect.innerHTML = '<option value="">None</option>';
    
    allPosts.forEach(p => {
        if (p.PostUrl !== postUrl) {
            const optionText = p.title || `Untitled Post (${p.PostUrl})`;
            
            const preOption = document.createElement('option');
            preOption.value = p.PostUrl;
            preOption.textContent = optionText;
            // Normalize URLs for comparison
            if (normalizeUrl(p.PostUrl) === normalizeUrl(post['PrePost-Url'])) {
                preOption.selected = true;
            }
            prePostSelect.appendChild(preOption);
            
            const nextOption = document.createElement('option');
            nextOption.value = p.PostUrl;
            nextOption.textContent = optionText;
            // Normalize URLs for comparison
            if (normalizeUrl(p.PostUrl) === normalizeUrl(post['NextPost-Url'])) {
                nextOption.selected = true;
            }
            nextPostSelect.appendChild(nextOption);
        }
    });
    
    // Show modal
    console.log('Showing modal...');
    modal.style.display = 'block';
    document.getElementById('edit-post-title').focus();
};

const saveEditedPost = async () => {
    const postIndex = allPosts.findIndex(p => p.PostUrl === currentEditingPost.PostUrl);
    if (postIndex === -1) {
        showAlert('ပို့စ်ကို ဒေတာဘေ့စ်ထဲတွင် ရှာမတွေ့ပါ!', 'danger');
        return;
    }
    
    const title = document.getElementById('edit-post-title').value.trim();
    const description = document.getElementById('edit-post-description').value.trim();
    const imageUrl = document.getElementById('edit-post-image').value.trim();
    const imageCaption = document.getElementById('edit-post-image-caption').value.trim();
    const author = document.getElementById('edit-post-author').value.trim();
    const date = document.getElementById('edit-post-date').value;
    const postUrl = document.getElementById('edit-post-url').value.trim();
    const prePostUrl = document.getElementById('edit-pre-post').value;
    const nextPostUrl = document.getElementById('edit-next-post').value;
    
    const categoryCheckboxes = document.querySelectorAll('#edit-post-category input[type="checkbox"]:checked');
    const categories = Array.from(categoryCheckboxes).map(cb => cb.value);
    
    // Validate required fields
    if (!title) {
        showAlert('ကျေးဇူးပြု၍ ခေါင်းစဉ်ဖြည့်ပါ', 'danger');
        return;
    }
    if (!description) {
        showAlert('ကျေးဇူးပြု၍ ဖော်ပြချက်ဖြည့်ပါ', 'danger');
        return;
    }
    if (!imageUrl) {
        showAlert('ကျေးဇူးပြု၍ ပုံလိပ်စာဖြည့်ပါ', 'danger');
        return;
    }
    if (!imageCaption) {
        showAlert('ကျေးဇူးပြု၍ ပုံစာတန်းဖြည့်ပါ', 'danger');
        return;
    }
    if (!author) {
        showAlert('ကျေးဇူးပြု၍ ရေးသားသူဖြည့်ပါ', 'danger');
        return;
    }
    if (!date) {
        showAlert('ကျေးဇူးပြု၍ ရက်စွဲဖြည့်ပါ', 'danger');
        return;
    }
    if (!postUrl) {
        showAlert('ကျေးဇူးပြု၍ ပို့စ်လိပ်စာဖြည့်ပါ', 'danger');
        return;
    }
    
    if (!validateUrl(imageUrl)) {
        showAlert('ကျေးဇူးပြု၍ မှန်ကန်သော ပုံလိပ်စာထည့်ပါ', 'danger');
        return;
    }
    
    if (postUrl !== currentEditingPost.PostUrl && allPosts.some(p => p.PostUrl === postUrl)) {
        showAlert('ဤပို့စ်လိပ်စာရှိပြီးဖြစ်သည်။ ကျေးဇူးပြု၍ အခြားတစ်ခုရွေးပါ။', 'danger');
        return;
    }
    
    const prePostSelect = document.getElementById('edit-pre-post');
    const nextPostSelect = document.getElementById('edit-next-post');
    const prePostTitle = prePostUrl ? prePostSelect.options[prePostSelect.selectedIndex].text : '';
    const nextPostTitle = nextPostUrl ? nextPostSelect.options[nextPostSelect.selectedIndex].text : '';
    
    const updatedPost = {
        Category: categories,
        title,
        Description: description,
        ImageUrl: imageUrl,
        ImageCaption: imageCaption,
        Author: author,
        Date: formatDate(date), // Format date to "Month DD, YYYY"
        PostUrl: postUrl,
        'PrePost-Url': prePostUrl || null,
        'PrePost-Title': prePostTitle || null,
        'NextPost-Url': nextPostUrl || null,
        'NextPost-Title': nextPostTitle || null
    };
    
    allPosts[postIndex] = updatedPost;
    localStorage.setItem('postData', JSON.stringify(allPosts));
    
    updateRelatedPosts(updatedPost);
    
    const postDataString = JSON.stringify(updatedPost, null, 4) + ',';
    try {
        await navigator.clipboard.writeText(postDataString);
        showAlert('ပို့စ်ကို အောင်မြင်စွာ ပြင်ဆင်ပြီး clipboard သို့ ကူးယူပြီးပါပြီ!', 'success');
    } catch (err) {
        showAlert('Clipboard သို့ ကူးယူရာတွင် အမှားဖြစ်ခဲ့သည်: ' + err.message, 'danger');
        return;
    }
    
    closeEditDialog();
    updateAllPostsPage();
};

const updateRelatedPosts = (updatedPost) => {
    if (updatedPost['PrePost-Url']) {
        const prePostIndex = allPosts.findIndex(p => p.PostUrl === updatedPost['PrePost-Url']);
        if (prePostIndex !== -1 && allPosts[prePostIndex]['NextPost-Url'] !== updatedPost.PostUrl) {
            allPosts[prePostIndex]['NextPost-Url'] = updatedPost.PostUrl;
            allPosts[prePostIndex]['NextPost-Title'] = updatedPost.title;
        }
    }
    
    if (updatedPost['NextPost-Url']) {
        const nextPostIndex = allPosts.findIndex(p => p.PostUrl === updatedPost['NextPost-Url']);
        if (nextPostIndex !== -1 && allPosts[nextPostIndex]['PrePost-Url'] !== updatedPost.PostUrl) {
            allPosts[nextPostIndex]['PrePost-Url'] = updatedPost.PostUrl;
            allPosts[nextPostIndex]['PrePost-Title'] = updatedPost.title;
        }
    }
    
    localStorage.setItem('postData', JSON.stringify(allPosts));
};

const closeEditDialog = () => {
    const modal = document.getElementById('edit-post-dialog');
    if (modal) {
        modal.style.display = 'none';
    }
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
