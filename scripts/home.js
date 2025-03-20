document.addEventListener("DOMContentLoaded", function () {
    // JSON ဖိုင်ကနေ ဒေတာကို ဆွဲယူခြင်း
    fetch('/page-detail.json')
        .then(response => {
            console.log("Response Status:", response.status); // Debugging
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Data:", data); // Debugging
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
