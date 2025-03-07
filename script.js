// DOM ကို စတင်ချိတ်ဆက်တဲ့အခါ
document.addEventListener("DOMContentLoaded", function () {
    // JSON ဖိုင်ကနေ ဒေတာကို ဆွဲယူခြင်း
    fetch('/page-detail.json') // ဖိုင်လမ်းကြောင်းကို သင့်ဖိုင်နေရာအတိုင်း ပြင်ဆင်ပါ
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

            // Hero Section
            document.querySelector(".hero h2").textContent = page.hero.title;
            document.querySelector(".hero p").textContent = page.hero.subtitle;
            const heroBtn = document.querySelector(".hero .btn");
            heroBtn.textContent = page.hero.button.text;
            heroBtn.href = page.hero.button.url;

            // Categories Section
            const categoryGrid = document.querySelector(".category-grid");
            categoryGrid.innerHTML = ""; // ရှိပြီးသား အကြောင်းအရာကို ရှင်းလင်းပါ
            page.categories.items.forEach(category => {
                const article = document.createElement("article");
                article.classList.add("category-card");

                article.innerHTML = `
                    <div class="category-icon">
                        <i class="${category.icon} fa-3x"></i>
                    </div>
                    <h3>${category.title}</h3>
                    <p>${category.description}</p>
                    <a href="${category.url}" class="category-link">Learn More</a>
                `;
                categoryGrid.appendChild(article);
            });

            // About Section
            document.querySelector("#about h2").textContent = page.about.title;
            document.querySelector(".about-text p").textContent = page.about.text;
            const skillsList = document.querySelector(".about-skills ul");
            skillsList.innerHTML = "";
            page.about.skills.forEach(skill => {
                const li = document.createElement("li");
                li.textContent = skill;
                skillsList.appendChild(li);
            });
            const socialLinks = document.querySelector(".social-links");
            socialLinks.innerHTML = "";
            page.about.socialLinks.forEach(link => {
                const a = document.createElement("a");
                a.href = link.url;
                a.target = "_blank";
                a.classList.add("social-link");
                a.innerHTML = `<i class="${link.icon}"></i>`;
                socialLinks.appendChild(a);
            });

            // Contact Section
            document.querySelector(".contact-section h2").textContent = page.contact.title;
            document.querySelector(".contact-section p").textContent = page.contact.text;
            const contactLinks = document.querySelector(".contact-links");
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
