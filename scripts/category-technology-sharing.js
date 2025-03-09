let currentFilter = null;

async function fetchAndDisplayPosts() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const postGrid = document.getElementById('post-content-grid');
    const filterStatus = document.getElementById('filterStatus');

    // DOM ဒြပ်စင်တွေ ရှိမရှိ စစ်ဆေးခြင်း
    if (!loadingIndicator || !postGrid || !filterStatus) {
        console.error('Required DOM elements are missing.');
        return;
    }

    loadingIndicator.style.display = 'block';
    postGrid.innerHTML = '';
    updateFilterStatus("Technology Sharing"); // မူရင်းမှာ Technology Sharing ပဲ ပြမယ်

    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const posts = await response.json();

        // "Technology Sharing" Category ပါတဲ့ Post တွေကိုပဲ စစ်ထုတ်မယ်
        const filteredPosts = posts.filter(post => post.Category.includes("Technology Sharing"));

        let postHTML = '';
        filteredPosts.forEach(post => {
            const categories = post.Category.join(' ');
            const categoryDisplay = post.Category
                .map(cat => `<span class="category-tag" data-category="${cat}">${cat}</span>`)
                .join(', ');

            postHTML += `
                <div class="post-card" data-category="${categories}">
                    <div class="post-image">
                        <img src="${post.ImageUrl}" alt="${post.ImageCaption}">
                    </div>
                    <div class="post-content">
                        <span class="post-category">${categoryDisplay}</span>
                        <h2 class="post-title" style="text-align: center;">${post.title}</h2>
                        <p class="post-excerpt">${post.Description}</p>
                        <div class="post-footer">
                            <a href="${post.PostUrl}.html" class="read-more">KEEP READING...</a>
                            <span class="post-meta">By <a href="#">${post.Author}</a> • ${post.Date}</span>
                        </div>
                    </div>
                </div>`;
        });

        postGrid.innerHTML = postHTML;
        loadingIndicator.style.display = 'none';

        // Category Tag တွေကို Click လုပ်ရင် Filter လုပ်ဖို့ Event Listener
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', function () {
                const selectedCategory = this.getAttribute('data-category');
                if (currentFilter === selectedCategory) {
                    filterPostsByCategory('all');
                    currentFilter = null;
                    updateFilterStatus("Technology Sharing"); // Reset လုပ်ရင် Technology Sharing ပြန်ပြမယ်
                } else {
                    filterPostsByCategory(selectedCategory);
                    currentFilter = selectedCategory;
                    updateFilterStatus(selectedCategory); // Filter လုပ်တဲ့ Category ကို ပြမယ်
                }
            });
        });
    } catch (error) {
        console.error('Error fetching or displaying posts:', error.message);
        loadingIndicator.style.display = 'none';
        postGrid.innerHTML = `<p>Sorry, something went wrong: ${error.message}</p>`;
        filterStatus.innerHTML = ''; // Error ဖြစ်ရင် Filter Status ဖျောက်မယ်
    }
}

// Filter Status ကို အပ်ဒိတ်လုပ်မယ့် Function
function updateFilterStatus(category) {
    const filterStatus = document.getElementById('filterStatus');
    if (category === 'all') {
        filterStatus.innerHTML = `Showing posts in <strong>Technology Sharing</strong> category only.`;
    } else {
        filterStatus.innerHTML = `Showing posts in <strong>${category}</strong> category.`;
    }
}

// Filter Posts လုပ်မယ့် Function
function filterPostsByCategory(category) {
    const posts = document.querySelectorAll('.post-card');
    posts.forEach(post => {
        const postCategories = post.getAttribute('data-category').split(' ');
        if (category === 'all' || postCategories.includes(category)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

// စာမျက်နှာ ဖွင့်တာနဲ့ Post တွေကို ဆွဲပြမယ်
document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);
