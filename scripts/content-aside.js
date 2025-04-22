// Function to populate the Aside section
const populateAside = () => {
    // Get the aside section
    const asideSection = document.querySelector("#aside .container");

    // Check if the aside section exists
    if (!asideSection) {
        console.error("Aside section not found!");
        return;
    }

    // Define the content for the Aside section
    const asideContent = `

        <!-- Socials Widget -->
        <div class="widget-socials">
            <h4 class="widget-title">Keep up with Us</h4>
            <ul class="socials">
                <li>
                    <a class="social-facebook" href="https://www.facebook.com/tc.myaing/" title="facebook" target="_blank">
                        <i class="fab fa-facebook-f"></i>
                        <span class="socials__text">Facebook</span>
                    </a>
                </li>
                <li>
                    <a class="social-telegram" href="https://t.me/tcmyaing" title="telegram" target="_blank">
                        <i class="fab fa-telegram"></i>
                        <span class="socials__text">Telegram</span>
                    </a>
                </li>
                <li>
                    <a class="social-youtube" href="https://www.youtube.com/@tcmyaing" title="youtube" target="_blank">
                        <i class="fab fa-youtube"></i>
                        <span class="socials__text">YouTube</span>
                    </a>
                </li>
            </ul>
        </div>
        
        <!-- Latest Posts Widget -->
        <div class="widget-latest-posts">
            <h4 class="widget-title">Latest Posts</h4>
            <ul class="latest-posts" id="latestPostsList">
                <!-- JavaScript ကနေ dynamically ထည့်ပေးမယ် -->
            </ul>
        </div>

        <!-- Categories Widget -->
        <div class="widget-categories">
            <h4 class="widget-title">Categories</h4>
            <ul class="categories" id="categoriesList">
                <!-- JavaScript ကနေ dynamically ထည့်ပေးမယ် -->
            </ul>
        </div>

        




        <!-- Ad Widget -->
        <style type="text/css">
            @import url("/css/ad.css");
        </style>
    `;

    // Insert the content into the aside section
    asideSection.innerHTML = asideContent;
};

// latest-posts.js
async function updateLatestPosts() {
    try {
        const response = await fetch('/home/post-data.json');
        const postsData = await response.json();

        postsData.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        const latestPosts = postsData.slice(0, 10);
        const latestPostsList = document.getElementById('latestPostsList');

        latestPostsList.innerHTML = '';

        latestPosts.forEach(post => {
            const li = document.createElement('li');
            // Marker အနေနဲ့ • ကို ထည့်မယ်
            li.innerHTML = `<span class="marker">• </span><a href="${post.PostUrl}.html" title="${post.title}">${post.title}</a>`;
            latestPostsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching latest posts:', error);
    }
}

document.addEventListener('DOMContentLoaded', updateLatestPosts);

// Call the function to populate the aside section on page load
document.addEventListener("DOMContentLoaded", populateAside);


//Categories
async function loadCategories() {
    try {
        const response = await fetch('/home/post-data.json');
        const postsData = await response.json();

        const categoryCounts = {};
        postsData.forEach(post => {
            post.Category.forEach(cat => {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        });

        const categories = Object.keys(categoryCounts);
        const categoriesList = document.getElementById('categoriesList');

        categories.forEach(category => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="/home/?category=${encodeURIComponent(category)}">${category} (${categoryCounts[category]})</a>`;
            categoriesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadCategories);


// /scripts/search.js
async function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('sbutton');
    const searchIcon = document.getElementById('searchIcon');
    const searchContainer = document.getElementById('searchContainer');
    const searchResults = document.getElementById('searchResults');
    const headerLogo = document.getElementById('headerLogo');
    const searchBox = document.querySelector('.search');
    

    let postsData = [];
    let isSearchActive = false;

    // JSON ကနေ ဒေတာကို တစ်ခါတည်း ဖတ်ထားမယ်
    try {
        const response = await fetch('/home/post-data.json');
        postsData = await response.json();
    } catch (error) {
        console.error('Error loading post data:', error);
    }

    // Mobile မှာ Search Button ကို toggle လုပ်မယ်
    searchButton.addEventListener('click', () => {
        if (!isSearchActive) {
            // Search ကို ဖွင့်မယ်
            searchBox.classList.add('active');            
            headerLogo.style.display = 'none'; // Logo ပျောက်ဖို့ သေချာအောင်
            searchContainer.style.display = 'flex'; // Search container ပေါ်ဖို့
            searchIcon.classList.remove('fa-search');
            searchIcon.classList.add('fa-close');
            searchInput.focus();
            isSearchActive = true;
        } else {
            // Search ကို ပိတ်မယ်
            searchBox.classList.remove('active');            
            headerLogo.style.display = 'block'; // Logo ပြန်ပေါ်ဖို့
            searchContainer.style.display = 'none'; // Search container ပျောက်ဖို့
            searchIcon.classList.remove('fa-close');
            searchIcon.classList.add('fa-search');
            searchInput.value = ''; // Input ကို clear လုပ်မယ်
            searchResults.style.display = 'none'; // Dropdown ပျောက်မယ်
            isSearchActive = false;
        }
    });

    // Search input မှာ ရိုက်တိုင်း ရှာမယ်
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (query.length > 0) {
            const results = postsData.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.Description.toLowerCase().includes(query)
            );

            if (results.length > 0) {
                results.forEach(post => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';
                    resultItem.innerHTML = `<a href="${post.PostUrl}.html">${post.title}</a>`;
                    searchResults.appendChild(resultItem);
                });
            } else {
                searchResults.innerHTML = '<div class="no-results">No results found</div>';
            }
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    });

    // Search bar အပြင်ဘက် နှိပ်ရင် dropdown ဖွက်မယ်
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !searchButton.contains(e.target)) {
            searchResults.style.display = 'none';
            if (window.innerWidth <= 768 && isSearchActive) {
                searchBox.classList.remove('active');
                headerLogo.style.display = 'block';
                searchContainer.style.display = 'none';
                searchIcon.classList.remove('fa-close');
                searchIcon.classList.add('fa-search');
                searchInput.value = '';
                isSearchActive = false;
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', initSearch);

