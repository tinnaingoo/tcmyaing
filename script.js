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
            

            // Hero Section
            document.querySelector(".hero h2").textContent = page.hero.title;
            document.querySelector(".hero p").textContent = page.hero.subtitle;
            const heroBtn = document.querySelector(".hero .btn");
            heroBtn.textContent = page.hero.button.text;
            heroBtn.href = page.hero.button.url;

            
            // Title of the page
            document.title = page.title;
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            alert('ဒေတာကို ဆွဲယူရာမှာ အမှားအယွင်းရှိနေပါတယ်။');
        });
});
