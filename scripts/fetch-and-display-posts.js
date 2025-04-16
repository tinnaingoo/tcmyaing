let currentFilter = null;
let currentPage = 1;
const postsPerPage = 15; // Number of posts to show per page
let allPosts = []; // Store all posts for filtering/pagination

async function fetchAndDisplayPosts() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const postGrid = document.getElementById('post-content-grid');
    const filterStatus = document.getElementById('filterStatus');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const paginationContainer = document.getElementById('pagination');

    if (!loadingIndicator || !postGrid || !filterStatus) {
        console.error('Required DOM elements are missing.');
        return;
    }

    loadingIndicator.style.display = 'block';
    postGrid.innerHTML = '';
    paginationContainer.innerHTML = '';

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    const pageFromUrl = parseInt(urlParams.get('page')) || 1;
    
    currentFilter = categoryFromUrl || 'all';
    currentPage = pageFromUrl;

    updateFilterStatus(currentFilter);

    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        allPosts = await response.json();

        // Filter posts if needed
        let filteredPosts = allPosts;
        if (currentFilter && currentFilter !== 'all') {
            filteredPosts = allPosts.filter(post => post.Category.includes(currentFilter));
        }

        // Update URL with current filter and page
        updateUrl(currentFilter, currentPage);

        // Calculate pagination
        const totalPosts = filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        
        // Validate current page
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        // Get posts for current page
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = Math.min(startIndex + postsPerPage, totalPosts);
        const postsToDisplay = filteredPosts.slice(startIndex, endIndex);

        // Display posts
        let postHTML = '';
        postsToDisplay.forEach(post => {
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

        // Generate pagination links if we have more than one page
        if (totalPages > 1) {
            generatePaginationLinks(totalPages, currentPage, currentFilter);
        }

        // Handle category tag clicks
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const selectedCategory = this.getAttribute('data-category');
                if (currentFilter === selectedCategory) {
                    filterAndPaginate('all', 1);
                } else {
                    filterAndPaginate(selectedCategory, 1);
                }
            });
        });

        // Show/hide no results message
        if (noResultsMessage) {
            noResultsMessage.style.display = filteredPosts.length === 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error fetching or displaying posts:', error.message);
        loadingIndicator.style.display = 'none';
        postGrid.innerHTML = `<p>Sorry, something went wrong: ${error.message}</p>`;
        filterStatus.style.display = 'none';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
    }
}

function filterAndPaginate(category, page) {
    currentFilter = category;
    currentPage = page;
    updateUrl(currentFilter, currentPage);
    fetchAndDisplayPosts();
}

function updateUrl(category, page) {
    let url = '/home';
    const params = [];
    
    if (category && category !== 'all') {
        params.push(`category=${encodeURIComponent(category)}`);
    }
    
    if (page > 1) {
        params.push(`page=${page}`);
    }
    
    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }
    
    window.history.pushState({}, document.title, url);
}

function generatePaginationLinks(totalPages, currentPage, currentFilter) {
    const paginationContainer = document.getElementById('pagination');
    let paginationHTML = '';
    
    // Previous link
    if (currentPage > 1) {
        paginationHTML += `<a href="#" onclick="filterAndPaginate('${currentFilter}', ${currentPage - 1})">&laquo; Prev</a>`;
    } else {
        paginationHTML += `<span class="disabled">&laquo; Prev</span>`;
    }
    
    // Page numbers
    const maxVisiblePages = 5; // Show up to 5 page links
    let startPage, endPage;
    
    if (totalPages <= maxVisiblePages) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
        const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
        
        if (currentPage <= maxPagesBeforeCurrent) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - maxVisiblePages + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
        paginationHTML += `<a href="#" onclick="filterAndPaginate('${currentFilter}', 1)">1</a>`;
        if (startPage > 2) {
            paginationHTML += `<span class="disabled">...</span>`;
        }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<span class="current">${i}</span>`;
        } else {
            paginationHTML += `<a href="#" onclick="filterAndPaginate('${currentFilter}', ${i})">${i}</a>`;
        }
    }
    
    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="disabled">...</span>`;
        }
        paginationHTML += `<a href="#" onclick="filterAndPaginate('${currentFilter}', ${totalPages})">${totalPages}</a>`;
    }
    
    // Next link
    if (currentPage < totalPages) {
        paginationHTML += `<a href="#" onclick="filterAndPaginate('${currentFilter}', ${currentPage + 1})">Next &raquo;</a>`;
    } else {
        paginationHTML += `<span class="disabled">Next &raquo;</span>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

function updateFilterStatus(category) {
    const filterStatus = document.getElementById('filterStatus');
    if (category === 'all') {
        filterStatus.style.display = 'none';
    } else {
        filterStatus.style.display = 'block';
        filterStatus.innerHTML = `Showing posts in <strong>${category}</strong> category. <a href="/home" onclick="filterAndPaginate('all', 1); return false;">Show All</a>`;
    }
}

// Handle browser back/forward navigation
window.addEventListener('popstate', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    const pageFromUrl = parseInt(urlParams.get('page')) || 1;
    
    currentFilter = categoryFromUrl || 'all';
    currentPage = pageFromUrl;
    
    fetchAndDisplayPosts();
});

document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);
