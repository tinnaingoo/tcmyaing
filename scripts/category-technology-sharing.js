let currentFilter = null;

async function fetchAndDisplayPosts() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const postGrid = document.getElementById('post-content-grid');

    if (!loadingIndicator || !postGrid) {
        console.error('Required DOM elements are missing.');
        return;
    }

    loadingIndicator.style.display = 'block';
    postGrid.innerHTML = '';

    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const posts = await response.json();

        // "Technology Sharing" Category ပါတဲ့ Post တွေကိုပဲ စစ်ထုတ်မယ်
        const filteredPosts = posts.filter(post => post.Category.includes("Technology Sharing"));

        let postHTML = '';
        filteredPosts.forEach(post => {
            const categories = post.Category.join(' '); // Space-separated string for data-category
            const categoryDisplay = post.Category
                .map(cat => `<span class="category-tag" data-category="${cat}">${cat}</span>`)
                .join(', '); // Comma-separated with span tags

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
                } else {
                    filterPostsByCategory(selectedCategory);
                    currentFilter = selectedCategory;
                }
            });
        });
    } catch (error) {
        console.error('Error fetching or displaying posts:', error.message);
        loadingIndicator.style.display = 'none';
        postGrid.innerHTML = `<p>Sorry, something went wrong: ${error.message}</p>`;
    }
}

// စာမျက်နှာ ဖွင့်တာနဲ့ Post တွေကို ဆွဲပြမယ်
document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);

// Filter Posts လုပ်ဖို့ Function (Optional အနေနဲ့ ထည့်ထားတယ်)
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
