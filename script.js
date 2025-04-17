document.addEventListener("DOMContentLoaded", function () {
    fetch('/page-detail.json')
        .then(response => response.json())
        .then(data => {
            const page = data.page;
            
            // Update hero section with JSON data
            document.querySelector(".hero-title").textContent = page.hero.title || "Devkit.";
            document.querySelector(".hero-subtitle").textContent = page.hero.subtitle || "Welcome to Devkit.\nDevelop anything.";
            document.querySelector(".hero-description").textContent = page.hero.description || "Build a beautiful, modern website with flexible components built from scratch.";
            
            // Keep your existing header updates
            document.querySelector(".logo img").src = page.header.logo.src;
            document.querySelector(".logo img").alt = page.header.logo.alt;
            document.title = page.title;
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback content
            document.querySelector(".hero-title").textContent = "Devkit.";
            document.querySelector(".hero-subtitle").textContent = "Welcome to Devkit.\nDevelop anything.";
            document.querySelector(".hero-description").textContent = "Build a beautiful, modern website with flexible components built from scratch.";
        });
});
