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

            

            // Footer
            document.querySelector("footer p").textContent = page.footer.text;

                    })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            alert('ဒေတာကို ဆွဲယူရာမှာ အမှားအယွင်းရှိနေပါတယ်။');
        });
});
