document.addEventListener("DOMContentLoaded", function () {
    // JSON Fetch
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
            //const navMenu = document.querySelector("#navMenu ul");
            //navMenu.innerHTML = "";
            //page.header.nav.forEach(item => {
                //const li = document.createElement("li");
                //const a = document.createElement("a");
                //a.href = item.url;
                //a.textContent = item.text;
                //li.appendChild(a);
                //navMenu.appendChild(li);
            //});

            // Post Meta
            const postMeta = document.querySelector(".post-meta");
            const authorLink = postMeta.querySelector("a");
            authorLink.textContent = page.admin;

            // Footer
            document.querySelector("footer p").textContent = page.footer.text;

            // Check for <img id="post-img">
            const postText = document.querySelector(".post-text");
            const hasPostImg = postText.querySelector("#post-img") !== null;
            const modal = document.querySelector("#myModal");
            let popupScript = document.querySelector('script[src="/scripts/image-popup-modal.js"]');

            if (hasPostImg) {
                if (!popupScript) {
                    popupScript = document.createElement("script");
                    popupScript.src = "/scripts/image-popup-modal.js";
                    modal.insertAdjacentElement("afterend", popupScript);
                }
            } else {
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
