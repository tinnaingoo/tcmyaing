/* ======================
   ALL POSTS FUNCTIONALITY
   ====================== */

const updateAllPostsPage = async () => {
    allPosts = await fetchPostData();
    displayPosts(allPosts);
    setupCategoryFilter();
    setupSearchFilter();
};

const fetchPostData = async () => {
    try {
        const response = await fetch('/home/post-data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        localStorage.setItem('postData', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error fetching post data:', error);
        showAlert('ဒေတာများကို ရယူရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်', 'danger');
        return JSON.parse(localStorage.getItem('postData')) || [];
    }
};

const displayPosts = (posts) => {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';
    
    posts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post.title}</td>
            <td>${post.Author}</td>
            <td>${post.Date}</td>
            <td>${post.Category.join(', ')}</td>
            <td>
                <button class="btn btn-small btn-primary edit-post-btn" data-id="${post.PostUrl}">Edit</button>
                <button class="btn btn-small btn-danger delete-post-btn" data-id="${post.PostUrl}">Delete</button>
            </td>
        `;
        postsList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.getAttribute('data-id');
            openEditDialog(postId);
        });
    });
    
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.getAttribute('data-id');
            confirmDeletePost(postId);
        });
    });
};

const setupCategoryFilter = () => {
    const categoryFilter = document.getElementById('category-filter');
    allCategories.clear();
    
    allPosts.forEach(post => post.Category.forEach(cat => allCategories.add(cat)));
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
};

const setupSearchFilter = () => {
    const searchInput = document.getElementById('post-search');
    const categoryFilter = document.getElementById('category-filter');
    
    searchInput.addEventListener('input', () => filterPosts());
    categoryFilter.addEventListener('change', () => filterPosts());
};

const filterPosts = () => {
    const searchTerm = document.getElementById('post-search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    const filtered = allPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                            post.Description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || post.Category.includes(category);
        return matchesSearch && matchesCategory;
    });
    
    displayPosts(filtered);
};

/* ======================
   EDIT POST DIALOG FUNCTIONALITY
   ====================== */

const setupEditPostDialog = () => {
    // Event listeners for dialog controls
    document.querySelector('.close-modal').addEventListener('click', closeEditDialog);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeEditDialog);
    document.getElementById('save-post-btn').addEventListener('click', saveEditedPost);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('edit-post-dialog')) {
            closeEditDialog();
        }
    });
};

const openEditDialog = (postUrl) => {
    const post = allPosts.find(p => p.PostUrl === postUrl);
    if (!post) {
        showAlert('Post not found!', 'danger');
        return;
    }
    
    currentEditingPost = post;
    
    // Populate form fields
    document.getElementById('edit-post-title').value = post.title;
    document.getElementById('edit-post-description').value = post.Description;
    document.getElementById('edit-post-image').value = post.ImageUrl;
    document.getElementById('edit-post-image-caption').value = post.ImageCaption;
    document.getElementById('edit-post-author').value = post.Author;
    document.getElementById('edit-post-date').value = post.Date;
    document.getElementById('edit-post-url').value = post.PostUrl;
    
    // Populate categories
    const categorySelect = document.getElementById('edit-post-category');
    categorySelect.innerHTML = '';
    
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        option.selected = post.Category.includes(cat);
        categorySelect.appendChild(option);
    });
    
    // Show the modal
    document.getElementById('edit-post-dialog').style.display = 'block';
};

const saveEditedPost = () => {
    const postIndex = allPosts.findIndex(p => p.PostUrl === currentEditingPost.PostUrl);
    if (postIndex === -1) {
        showAlert('Post not found in database!', 'danger');
        return;
    }
    
    // Get selected categories
    const categorySelect = document.getElementById('edit-post-category');
    const selectedCategories = Array.from(categorySelect.selectedOptions).map(opt => opt.value);
    
    // Update post data
    allPosts[postIndex] = {
        ...allPosts[postIndex],
        title: document.getElementById('edit-post-title').value,
        Category: selectedCategories,
        Description: document.getElementById('edit-post-description').value,
        ImageUrl: document.getElementById('edit-post-image').value,
        ImageCaption: document.getElementById('edit-post-image-caption').value,
        Author: document.getElementById('edit-post-author').value,
        Date: document.getElementById('edit-post-date').value,
        PostUrl: document.getElementById('edit-post-url').value
    };
    
    // Save back to localStorage
    localStorage.setItem('postData', JSON.stringify(allPosts));
    
    // Update UI
    displayPosts(allPosts);
    showAlert('Post updated successfully!', 'success');
    closeEditDialog();
};

const closeEditDialog = () => {
    document.getElementById('edit-post-dialog').style.display = 'none';
    currentEditingPost = null;
};

const confirmDeletePost = (postUrl) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        deletePost(postUrl);
    }
};

const deletePost = (postUrl) => {
    allPosts = allPosts.filter(post => post.PostUrl !== postUrl);
    localStorage.setItem('postData', JSON.stringify(allPosts));
    displayPosts(allPosts);
    showAlert('Post deleted successfully!', 'success');
};
