let currentFilter = null;

async function fetchAndDisplayPosts() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const postGrid = document.getElementById('post-content-grid');
    const filterStatus = document.getElementById('filterStatus');
    const noResultsMessage = document.getElementById('noResultsMessage');

    if (!loadingIndicator || !postGrid || !filterStatus) {
        console.error('Required DOM elements are missing.');
        return;
    }

    loadingIndicator.style.display = 'block';
    postGrid.innerHTML = '';

    // URL Parameter ကနေ Category ကို ဖတ်မယ်
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    currentFilter = categoryFromUrl || 'all'; // URL မှာ ရှိရင် အဲဒါကို သုံး၊ မရှိရင် 'all' သုံး

    updateFilterStatus(currentFilter); // Filter Status ကို အပ်ဒိတ်လုပ်မယ်

    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const posts = await response.json();

        // Default အနေနဲ့ Post အားလုံးကို ယူမယ်၊ URL Parameter ရှိရင် Filter လုပ်မယ်
        let filteredPosts = posts;
        if (categoryFromUrl && categoryFromUrl !== 'all') {
            filteredPosts = posts.filter(post => post.Category.includes(categoryFromUrl));
        }

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

        // Initial Filter ကိစ္စကို စီမံမယ်
        filterPostsByCategory(currentFilter);

        // Category Tag တွေကို Click လုပ်ရင် Filter လုပ်ပြီး URL ပြောင်းမယ်
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', function () {
                const selectedCategory = this.getAttribute('data-category');
                if (currentFilter === selectedCategory) {
                    // ထပ် Click ရင် All ပြန်ပြပြီး URL ကို Reset လုပ်မယ်
                    filterPostsByCategory('all');
                    currentFilter = 'all';
                    updateFilterStatus(currentFilter);
                    window.history.pushState({}, document.title, '/home');
                } else {
                    // Category အသစ်ရွေးရင် Filter လုပ်ပြီး URL ကို ပြောင်းမယ်
                    filterPostsByCategory(selectedCategory);
                    currentFilter = selectedCategory;
                    updateFilterStatus(currentFilter);
                    window.history.pushState({}, document.title, `/home/?category=${encodeURIComponent(selectedCategory)}`);
                }
            });
        });

        // "Show All" Link ကို Click လုပ်ရင် Reset လုပ်ဖို့ Event Listener
        const showAllLink = document.getElementById('showAllLink');
        if (showAllLink) {
            showAllLink.addEventListener('click', function (e) {
                e.preventDefault();
                filterPostsByCategory('all');
                currentFilter = 'all';
                updateFilterStatus(currentFilter);
                window.history.pushState({}, document.title, '/home');
            });
        }
    } catch (error) {
        console.error('Error fetching or displaying posts:', error.message);
        loadingIndicator.style.display = 'none';
        postGrid.innerHTML = `<p>Sorry, something went wrong: ${error.message}</p>`;
        filterStatus.style.display = 'none';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
    }
}

// Filter Status ကို အပ်ဒိတ်လုပ်မယ့် Function
function updateFilterStatus(category) {
    const filterStatus = document.getElementById('filterStatus');
    if (category === 'all') {
        filterStatus.style.display = 'none'; // "all" ဖြစ်ရင် Filter Status ဖျောက်မယ်
    } else {
        filterStatus.style.display = 'block'; // Category တစ်ခုခု ရှိရင် ပြမယ်
        filterStatus.innerHTML = `Showing posts in <strong>${category}</strong> category. <a href="/home" id="showAllLink">Show All</a>`;
    }
}

// Filter Posts လုပ်မယ့် Function
function filterPostsByCategory(category) {
    const postGrid = document.getElementById('post-content-grid');
    const noResultsMessage = document.getElementById('noResultsMessage');

    if (!postGrid) {
        console.error('Post grid not found.');
        return;
    }

    const postCards = postGrid.getElementsByClassName('post-card');
    const categoryTags = document.querySelectorAll('.category-tag');
    let hasResults = false;

    // အရင် Highlight တွေကို ဖယ်မယ်
    categoryTags.forEach(tag => tag.classList.remove('highlighted'));

    // Post တွေကို Filter လုပ်မယ်
    Array.from(postCards).forEach(postCard => {
        const categories = postCard.getAttribute('data-category'); // Space-separated string အတိုင်း ထားမယ်
        if (category === 'all' || categories.includes(category)) {
            postCard.style.display = 'block';
            hasResults = true;
        } else {
            postCard.style.display = 'none';
        }
    });

    // Category ကို Highlight လုပ်မယ် (category !== 'all' ဆိုရင်)
    if (category !== 'all') {
        categoryTags.forEach(tag => {
            if (tag.getAttribute('data-category') === category) {
                tag.classList.add('highlighted');
            }
        });
    }

    // No Results Message ကို ထိန်းမယ်
    if (noResultsMessage) {
        noResultsMessage.style.display = hasResults ? 'none' : 'block';
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);
