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
            authorLink.textContent = page.admin; // JSON က "admin" ကို ထည့်သွင်းခြင်း

            // About Section
            document.querySelector(".about-section h2").textContent = page.about.title;
            document.querySelector(".about-section p").textContent = page.about.text;

            // Categories Widget (Aside)
            const categoriesList = document.querySelector("#categoriesList");
            categoriesList.innerHTML = "";
            page.categories.items.forEach(category => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = category.url;
                a.textContent = category.title;
                li.appendChild(a);
                categoriesList.appendChild(li);
            });

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
            document.title = page.title;
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            alert('ဒေတာကို ဆွဲယူရာမှာ အမှားအယွင်းရှိနေပါတယ်။');
        });
});
