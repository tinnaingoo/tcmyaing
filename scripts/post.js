// DOM ကို စတင်ချိတ်ဆက်တဲ့အခါ
document.addEventListener("DOMContentLoaded", function () {
    // JSON ဖိုင်ကနေ ဒေတာကို ဆွဲယူခြင်း
    fetch('/page-detail.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const page = data.page;

            // Header (Logo and Navigation)
            document.querySelector(".logo img").src = page.header.logo.src;
            document.querySelector(".logo img").alt = page.header.logo.alt;
            const navMenu = document.querySelector("#navMenu ul");
            navMenu.innerHTML = "";
            page.header.nav.forEach(item => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = item.url;
                a.textContent = item.text;
                li.appendChild(a);
                navMenu.appendChild(li);
            });

            // Post Meta (Author ကို admin ကနေ ဆွဲထည့်ခြင်း)
            const postMeta = document.querySelector(".post-meta");
            const authorLink = postMeta.querySelector("a");
            authorLink.textContent = page.admin;

            // About Section
            document.querySelector(".about h2").textContent = page.about.title;
            document.querySelector(".about-text p").textContent = page.about.text;
             // View More Button URL
            const viewMoreBtn = document.querySelector("#view-more-btn");
            if (viewMoreBtn && page.about["about-url"]) {
                viewMoreBtn.href = page.about["about-url"];
            }

            // Categories Widget (Aside)
            //const categoriesList = document.querySelector("#categoriesList");
            //categoriesList.innerHTML = "";
            //page.categories.items.forEach(category => {
                //const li = document.createElement("li");
                //const a = document.createElement("a");
                //a.href = category.url;
                //a.textContent = category.title;
                //li.appendChild(a);
                //categoriesList.appendChild(li);
            //});

            // Contact Section
            document.querySelector(".contact-section h2").textContent = page.contact.title;
            document.querySelector(".contact-section p").textContent = page.contact.text;
            const contactLinks = document.querySelector(".contact-section .contact-links");
            contactLinks.innerHTML = "";
            page.contact.links.forEach(link => {
                const a = document.createElement("a");
                a.href = link.url;
                a.target = "_blank";
                a.classList.add("contact-link", link.platform);
                a.innerHTML = `
                    <i class="${link.icon}"></i>
                    <span>${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</span>
                `;
                contactLinks.appendChild(a);
            });

            // Footer
            document.querySelector("footer p").textContent = page.footer.text;

            // Title of the page
            //document.title = page.title;

            // Check for <img id="post-img"> in <div class="post-text">
            const postText = document.querySelector(".post-text");
            const hasPostImg = postText.querySelector("#post-img") !== null;

            // Get the modal element
            const modal = document.querySelector("#myModal");

            // Check if image-popup-modal.js script already exists
            let popupScript = document.querySelector('script[src="/scripts/image-popup-modal.js"]');

            if (hasPostImg) {
                // If <img id="post-img"> exists and script isn't added yet, add it
                if (!popupScript) {
                    popupScript = document.createElement("script");
                    popupScript.src = "/scripts/image-popup-modal.js";
                    modal.insertAdjacentElement("afterend", popupScript);
                }
            } else {
                // If <img id="post-img"> doesn't exist and script exists, remove it
                if (popupScript) {
                    popupScript.remove();
                }
            }
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            alert('ဒေတာကို ဆွဲယူရာမှာ အမှားအယွင်းရှိနေပါတယ်။');
        });
});

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.dark-mode-toggle i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}
