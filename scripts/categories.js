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
