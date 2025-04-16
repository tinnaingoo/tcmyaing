let currentFilter = 'all';
let currentPage = 1;
const postsPerPage = 15;

async function fetchAndDisplayPosts() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const postGrid = document.getElementById('post-content-grid');
    const filterStatus = document.getElementById('filterStatus');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbersContainer = document.getElementById('pageNumbers');

    if (!loadingIndicator || !postGrid || !filterStatus || !noResultsMessage || !prevPageBtn || !nextPageBtn || !pageNumbersContainer) {
        console.error('Required DOM elements are missing.');
        return;
    }

    loadingIndicator.style.display = 'block';
    postGrid.innerHTML = '';
    pageNumbersContainer.innerHTML = '';

    // Get category and page from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category') || 'all';
    const pageFromUrl = parseInt(urlParams.get('page')) || 1;
    currentFilter = categoryFromUrl;
    currentPage = pageFromUrl;

    updateFilterStatus(currentFilter);

    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const posts = await response.json();

        // Filter posts based on category
        let filteredPosts = currentFilter === 'all' ? posts : posts.filter(post => post.Category.includes(currentFilter));

        // Calculate pagination
        const totalPosts = filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        // Display posts
        let postHTML = '';
        paginatedPosts.forEach(post => {
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
        noResultsMessage.style.display = totalPosts > 0 ? 'none' : 'block';

        // Update pagination controls
        updatePaginationControls(totalPages, prevPageBtn, nextPageBtn, pageNumbersContainer);

        // Add event listeners for category tags
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', function () {
                const selectedCategory = this.getAttribute('data-category');
                if (currentFilter === selectedCategory) {
                    currentFilter = 'all';
                    currentPage = 1;
                    updateURL(currentFilter, currentPage);
                    fetchAndDisplayPosts();
                } else {
                    currentFilter = selectedCategory;
                    currentPage = 1;
                    updateURL(currentFilter, currentPage);
                    fetchAndDisplayPosts();
                }
            });
        });

        // Add event listener for "Show All" link
        const showAllLink = document.getElementById('showAllLink');
        if (showAllLink) {
            showAllLink.addEventListener('click', function (e) {
                e.preventDefault();
                currentFilter = 'all';
                currentPage = 1;
                updateURL(currentFilter, currentPage);
                fetchAndDisplayPosts();
            });
        }

        // Add event listeners for pagination buttons
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateURL(currentFilter, currentPage);
                fetchAndDisplayPosts();
            }
        });

        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateURL(currentFilter, currentPage);
                fetchAndDisplayPosts();
            }
        });

        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            const params = new URLSearchParams(window.location.search);
            currentFilter = params.get('category') || 'all';
            currentPage = parseInt(params.get('page')) || 1;
            fetchAndDisplayPosts();
        });

    } catch (error) {
        console.error('Error fetching or displaying posts:', error.message);
        loadingIndicator.style.display = 'none';
        postGrid.innerHTML = `<p>Sorry, something went wrong: ${error.message}</p>`;
        filterStatus.style.display = 'none';
        noResultsMessage.style.display = 'none';
    }
}

// Update filter status
function updateFilterStatus(category) {
    const filterStatus = document.getElementById('filterStatus');
    if (category === 'all') {
        filterStatus.style.display = 'none';
    } else {
        filterStatus.style.display = 'block';
        filterStatus.innerHTML = `Showing posts in <strong>${category}</strong> category. <a href="/home" id="showAllLink">Show All</a>`;
    }
}

// Update pagination controls
function updatePaginationControls(totalPages, prevPageBtn, nextPageBtn, pageNumbersContainer) {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    let pageHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        pageHTML += `<a href="/home/?${currentFilter !== 'all' ? `category=${encodeURIComponent(currentFilter)}&` : ''}page=${i}" class="page-number${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</a>`;
    }
    pageNumbersContainer.innerHTML = pageHTML;

    // Add event listeners for page numbers
    document.querySelectorAll('.page-number').forEach(number => {
        number.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = parseInt(this.getAttribute('data-page'));
            updateURL(currentFilter, currentPage);
            fetchAndDisplayPosts();
        });
    });
}

// Update URL with category and page
function updateURL(category, page) {
    let url = '/home';
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (page > 1) params.set('page', page);
    if (params.toString()) url += `/?${params.toString()}`;
    window.history.pushState({}, document.title, url);
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);
