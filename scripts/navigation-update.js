// ===== 4. Navigation Update =====
// Navigation link တွေကို JSON ကနေ update လုပ်ဖို့ function
async function updateNavigation() {
    try {
        const response = await fetch('/home/post-data.json');
        const postsData = await response.json();
        const currentTitle = document.getElementById('post-title').textContent.trim();
        const currentPost = postsData.find(post => post.title === currentTitle);

        if (currentPost) {
            const prevPostLink = document.getElementById('prevPostLink');
            const prevPostTitle = document.getElementById('prevPostTitle');
            if (currentPost['PrePost-Title'] && currentPost['PrePost-Url']) {
                prevPostLink.href = `/${currentPost['PrePost-Url']}.html`;
                prevPostTitle.textContent = currentPost['PrePost-Title'];
            } else {
                prevPostLink.parentElement.style.display = 'none';
            }

            const nextPostLink = document.getElementById('nextPostLink');
            const nextPostTitle = document.getElementById('nextPostTitle');
            if (currentPost['NextPost-Title'] && currentPost['NextPost-Url']) {
                nextPostLink.href = `/${currentPost['NextPost-Url']}.html`;
                nextPostTitle.textContent = currentPost['NextPost-Title'];
            } else {
                nextPostLink.parentElement.style.display = 'none';
            }
        } else {
            console.error('Current post not found in JSON data');
        }
    } catch (error) {
        console.error('Error fetching navigation data:', error);
    }
}

// ===== Run Navigation =====
// Navigation update ကို ခေါ်မယ်
updateNavigation();
