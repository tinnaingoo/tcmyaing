// Chart.js library ကို load လုပ်ပါ
const loadChartJS = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
};

// JSON data ကို fetch လုပ်ပါ
const fetchPostData = async () => {
    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching post data:', error);
        showAlert('ဒေတာများကို ရယူရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်', 'danger');
        return [];
    }
};

// Dashboard ကို update လုပ်ပါ
const updateDashboard = async () => {
    await loadChartJS();
    const posts = await fetchPostData();
    
    // Basic stats
    document.getElementById('total-posts').textContent = posts.length;
    
    // Category count
    const categories = new Set();
    posts.forEach(post => {
        post.Category.forEach(cat => categories.add(cat));
    });
    document.getElementById('total-categories').textContent = categories.size;
    
    // Recent posts (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentPosts = posts.filter(post => {
        const postDate = new Date(post.Date);
        return postDate >= oneWeekAgo;
    });
    document.getElementById('recent-posts').textContent = recentPosts.length;
    
    // Prepare data for charts
    prepareCategoryChart(posts);
    prepareDateChart(posts);
};

// Category chart ပြင်ဆင်ခြင်း
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

// Date chart ပြင်ဆင်ခြင်း
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const previewBtn = document.getElementById('previewBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    const copyPreviewBtn = document.getElementById('copyPreviewBtn');
    const postForm = document.getElementById('post-form');
    
    // Set current date as default
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('post-date').value = formattedDate;

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }

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

    // Functions
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        
        if (isDarkMode) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    }

    function switchTab(tabId) {
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            }
        });
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });
    }

    function previewPost() {
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
    }

    function clearForm() {
        postForm.reset();
        document.getElementById('post-date').value = formattedDate; // Reset to current date
        showAlert('ဖောင်ကို ရှင်းလင်းပြီးပါပြီ', 'success');
    }

    async function copyPostData() {
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
        
        const postData = {
            title: title,
            author: author,
            date: date,
            coverImage: coverImage,
            imageAlt: imageAlt,
            content: content
        };
        
        const postDataString = `const postData = ${JSON.stringify(postData, null, 4)};\n\n// DOM content loaded\ndocument.addEventListener("DOMContentLoaded", () => {\n    // Set title\n    document.getElementById("post-title").textContent = postData.title;\n\n    // Set author and date\n    const postMeta = document.querySelector(".post-meta");\n    if (postMeta) {\n        postMeta.innerHTML = \`ရေးသူ <a>\${postData.author}</a> • \${postData.date}\`;\n    }\n\n    // Set cover image\n    const coverImageContainer = document.getElementById("post-cover-image");\n    if (coverImageContainer) {\n        coverImageContainer.innerHTML = \`<img src="\${postData.coverImage}" alt="\${postData.imageAlt}" />\`;\n    }\n\n    // Set post content\n    const postText = document.getElementById("post-text");\n    if (postText) {\n        postText.innerHTML = postData.content;\n    }\n});`;
        
        try {
            await navigator.clipboard.writeText(postDataString);
            showAlert('ဆောင်းပါးဒေတာများကို clipboard သို့ ကူးယူပြီးပါပြီ!', 'success');
        } catch (err) {
            showAlert('ကူးယူရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်: ' + err, 'danger');
        }
    }

    function showAlert(message, type) {
        const successAlert = document.getElementById('alert-success');
        const dangerAlert = document.getElementById('alert-danger');
        
        if (type === 'success') {
            successAlert.textContent = message;
            successAlert.style.display = 'block';
            dangerAlert.style.display = 'none';
        } else {
            dangerAlert.textContent = message;
            dangerAlert.style.display = 'block';
            successAlert.style.display = 'none';
        }
        
        setTimeout(() => {
            successAlert.style.display = 'none';
            dangerAlert.style.display = 'none';
        }, 5000);
    }

    // Dashboard ကို update လုပ်ပါ
    if (window.location.hash !== '#create-post') {
        updateDashboard();
    }
});
