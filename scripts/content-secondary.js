const Secondary = () => {
    const secondarySection = document.querySelector("#content-secondary .content-secondary");

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

document.addEventListener("DOMContentLoaded", Secondary);
