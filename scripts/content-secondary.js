const populateSecondary = () => {
    const secondarySection = document.querySelector("#secondary .container");

    if (!secondarySection) {
        console.error("Secondary Content not found!");
        return;
    }

    const secondaryContent = `
    
        <section>
            <div class="container>
            <div class="widget-ad">
            <div class="ad-300x250">
                <p><b>ဤနေရာမှာ ကြော်ငြာပါ။</b></p>
                <p>320x50</p>
            </div>
            </div>    
            </div>
        </section>  

<section class="subscribe-section">
    <div class="container">
        <h2>Subscribe to My YouTube Channel</h2>
        <p>Stay updated with the latest tech tutorials, software reviews, and more from TC-Myaing!</p>
        <a href="https://www.youtube.com/@tcmyaing?sub_confirmation=1" target="_blank" class="subscribe-btn">
            <i class="fab fa-youtube"></i> Subscribe Now
        </a>
    </div>
</section>

<section id="videos" class="videos">
    <div class="container">
        <!-- Image Auto Slider -->
        <div class="slider">
            <div class="slider-box">
            <div class="slides" id="videoSlides">
                <!-- JavaScript ကနေ dynamically ထည့်ပေးမယ် -->
            </div>
            <button class="prev" onclick="prevSlide()">❮</button>
            <button class="next" onclick="nextSlide()">❯</button>
            </div>
        </div>
    </div>
</section>  

<section id="about" class="about">
    <div class="container">
        <h2></h2>
        <div class="about-content">
            <div class="about-text">
                <p></p>
            </div>
            <!-- View More Button -->
            <a id="view-more-btn" href="#" class="view-more-btn">View More</a>
        </div>
    </div>
</section>
    
<section class="contact-section">
    <div class="container">
        <h2></h2>
        <p></p>
        <div class="contact-links">
            <!-- Contact links will be dynamically inserted here -->
        </div>
    </div>
</section>

    `;

    secondarySection.innerHTML = secondaryContent;
};

document.addEventListener("DOMContentLoaded", populateSecondary);

// video-slider.js
async function loadVideoSlider() {
    try {
        const response = await fetch('/slider-data.json');
        const sliderData = await response.json();
        const slidesContainer = document.getElementById('videoSlides');
        slidesContainer.innerHTML = '';

        sliderData.forEach((slide, index) => {
            const slideElement = document.createElement('a');
            slideElement.href = slide.linkUrl;
            slideElement.target = '_blank';
            slideElement.className = 'slide';
            if (index === 0) slideElement.classList.add('active');
            slideElement.innerHTML = `
                <img src="${slide.imageUrl}" alt="${slide.caption}">
                <div class="caption">${slide.caption}</div>
            `;
            slidesContainer.appendChild(slideElement);
        });

        initializeSlider();
    } catch (error) {
        console.error('Error loading slider data:', error);
    }
}

function initializeSlider() {
    let currentIndex = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    if (totalSlides === 0) return;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    }

    // ပထမ slide ကို ပြမယ်
    showSlide(currentIndex);

    // Auto-slide အတွက် setInterval ထည့်မယ်
    const autoSlideInterval = setInterval(nextSlide, 30000); // ၅ စက္ကန့်ခြား ရွှေ့မယ်

    // Global ထဲကို function တွေ ထည့်မယ်၊ HTML onclick က ခေါ်လို့ရအောင်
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;

    // Optional: Mouse hover လုပ်ရင် auto-slide ရပ်ချင်ရင်
    const slider = document.querySelector('.slider');
    slider.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    slider.addEventListener('mouseleave', () => {
        // Mouse ထွက်သွားရင် auto-slide ပြန်စမယ်
        window.autoSlideInterval = setInterval(nextSlide, 5000);
    });
}

// စာမျက်နှာ load ဖြစ်တဲ့အခါ run မယ်
document.addEventListener('DOMContentLoaded', loadVideoSlider);
