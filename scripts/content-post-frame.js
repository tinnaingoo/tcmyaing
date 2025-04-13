const populatePost = () => {
    const postSection = document.querySelector("#postbody");

    if (!postSection) {
        console.error("Post section not found!");
        return;
    }

    const postContent = `
        
<section class="post-content">
    <div class="container">
        <div class="post-title-container">
        <h1 class="post-title" id="post-title">Title</h1>
        <p class="post-meta">By <a>tinnaingoo</a> • Date</p>
        </div>
        <div class="post-cover-image" id="post-cover-image">
            
        </div>

        <div class="post-text" id="post-text">
            
       </div>
    </div>
</section>

    `;

    postSection.innerHTML = postContent;
};
