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

            // About Section
            document.querySelector("#about h2").textContent = page.about.title;
            document.querySelector(".about-text p").textContent = page.about.text;
            // View More Button URL
            const viewMoreBtn = document.querySelector("#view-more-btn");
            if (viewMoreBtn && page.about["about-url"]) {
                viewMoreBtn.href = page.about["about-url"];
            }

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
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            alert('ဒေတာကို ဆွဲယူရာမှာ အမှားအယွင်းရှိနေပါတယ်။');
        });
});
