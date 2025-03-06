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
            li.innerHTML = `<span class="marker">• </span><a href="/${post.PostUrl}.html" title="${post.title}">${post.title}</a>`;
            latestPostsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching latest posts:', error);
    }
}

document.addEventListener('DOMContentLoaded', updateLatestPosts);
