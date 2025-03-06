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
                    resultItem.innerHTML = `<a href="/${post.PostUrl}.html">${post.title}</a>`;
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
