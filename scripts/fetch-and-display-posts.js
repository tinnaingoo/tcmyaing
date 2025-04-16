let currentFilter = null;
let currentPage = 1;
const postsPerPage = 15; // Number of posts to show per page

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

    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    const pageFromUrl = parseInt(urlParams.get('page')) || 1;
    
    currentFilter = categoryFromUrl || 'all';
    currentPage = pageFromUrl;

    updateFilterStatus(currentFilter);

    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const allPosts = await response.json();

        // Filter posts if category is selected
        let filteredPosts = allPosts;
        if (currentFilter && currentFilter !== 'all') {
            filteredPosts = allPosts.filter(post => post.Category.includes(currentFilter));
        }

        // Calculate pagination
        const totalPosts = filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = Math.min(startIndex + postsPerPage, totalPosts);
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

        // Create pagination controls
        createPaginationControls(totalPosts, currentPage, totalPages, currentFilter);

        // Add event listeners to category tags
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const selectedCategory = this.getAttribute('data-category');
                if (currentFilter === selectedCategory) {
                    updateUrlAndReload('all', 1);
                } else {
                    updateUrlAndReload(selectedCategory, 1);
                }
            });
        });

        // Handle no results
        if (noResultsMessage) {
            noResultsMessage.style.display = paginatedPosts.length === 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error fetching or displaying posts:', error.message);
        loadingIndicator.style.display = 'none';
        postGrid.innerHTML = `<p>Sorry, something went wrong: ${error.message}</p>`;
        filterStatus.style.display = 'none';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
    }
}

function createPaginationControls(totalPosts, currentPage, totalPages, currentFilter) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    // Previous button
    const prevButton = document.createElement('a');
    prevButton.href = '#';
    prevButton.innerHTML = '&laquo;';
    prevButton.className = 'pagination-link';
    if (currentPage === 1) {
        prevButton.classList.add('disabled');
    } else {
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            updateUrlAndReload(currentFilter, currentPage - 1);
        });
    }
    paginationContainer.appendChild(prevButton);

    // Page numbers
    const maxVisiblePages = 5; // Show up to 5 page numbers
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

    // First page and ellipsis if needed
    if (startPage > 1) {
        const firstPageLink = createPageLink(1, currentPage, currentFilter);
        paginationContainer.appendChild(firstPageLink);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }

    // Page number links
    for (let i = startPage; i <= endPage; i++) {
        const pageLink = createPageLink(i, currentPage, currentFilter);
        paginationContainer.appendChild(pageLink);
    }

    // Last page and ellipsis if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        const lastPageLink = createPageLink(totalPages, currentPage, currentFilter);
        paginationContainer.appendChild(lastPageLink);
    }

    // Next button
    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.innerHTML = '&raquo;';
    nextButton.className = 'pagination-link';
    if (currentPage === totalPages) {
        nextButton.classList.add('disabled');
    } else {
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            updateUrlAndReload(currentFilter, currentPage + 1);
        });
    }
    paginationContainer.appendChild(nextButton);

    // Add to DOM
    const postGrid = document.getElementById('post-content-grid');
    postGrid.parentNode.insertBefore(paginationContainer, postGrid.nextSibling);
}

function createPageLink(pageNumber, currentPage, currentFilter) {
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.textContent = pageNumber;
    pageLink.className = 'pagination-link';
    
    if (pageNumber === currentPage) {
        pageLink.classList.add('active');
    } else {
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            updateUrlAndReload(currentFilter, pageNumber);
        });
    }
    
    return pageLink;
}

function updateUrlAndReload(category, page) {
    let newUrl = '/home';
    const params = new URLSearchParams();
    
    if (category && category !== 'all') {
        params.set('category', category);
    }
    
    if (page && page > 1) {
        params.set('page', page);
    }
    
    if (params.toString()) {
        newUrl += `?${params.toString()}`;
    }
    
    window.history.pushState({}, document.title, newUrl);
    fetchAndDisplayPosts();
}

function updateFilterStatus(category) {
    const filterStatus = document.getElementById('filterStatus');
    if (category === 'all') {
        filterStatus.style.display = 'none';
    } else {
        filterStatus.style.display = 'block';
        filterStatus.innerHTML = `Showing posts in <strong>${category}</strong> category. <a href="/home" id="showAllLink">Show All</a>`;
        
        // Add event listener to "Show All" link
        document.getElementById('showAllLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            updateUrlAndReload('all', 1);
        });
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    fetchAndDisplayPosts();
});

document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);
