// Function to populate the Aside section
const populateAside = () => {
    // Get the aside section
    const asideSection = document.querySelector("#aside .container");

    // Check if the aside section exists
    if (!asideSection) {
        console.error("Aside section not found!");
        return;
    }

    // Define the content for the Aside section
    const asideContent = `
        <!-- Latest Posts Widget -->
        <div class="widget-latest-posts">
            <h4 class="widget-title">Latest Posts</h4>
            <ul class="latest-posts" id="latestPostsList">
                <!-- JavaScript ကနေ dynamically ထည့်ပေးမယ် -->
            </ul>
        </div>

        <!-- Categories Widget -->
        <div class="widget-categories">
            <h4 class="widget-title">Categories</h4>
            <ul class="categories" id="categoriesList">
                <!-- JavaScript ကနေ dynamically ထည့်ပေးမယ် -->
            </ul>
        </div>

        <!-- Socials Widget -->
        <div class="widget-socials">
            <h4 class="widget-title">Keep up with Us</h4>
            <ul class="socials">
                <li>
                    <a class="social-facebook" href="https://www.facebook.com/tc.myaing/" title="facebook" target="_blank">
                        <i class="fab fa-facebook-f"></i>
                        <span class="socials__text">Facebook</span>
                    </a>
                </li>
                <li>
                    <a class="social-telegram" href="https://t.me/tcmyaing" title="telegram" target="_blank">
                        <i class="fab fa-telegram"></i>
                        <span class="socials__text">Telegram</span>
                    </a>
                </li>
                <li>
                    <a class="social-youtube" href="https://www.youtube.com/@tcmyaing" title="youtube" target="_blank">
                        <i class="fab fa-youtube"></i>
                        <span class="socials__text">YouTube</span>
                    </a>
                </li>
            </ul>
        </div>

        <div class="widget-clock">
    <h4 class="widget-title">မြန်မာစံတော်ချိန်</h4>
    <div id="digitalClock" style="text-align: center; font-size: 1.2rem; margin-bottom: 10px;"></div>
    <div class="clock">
        <label style="--i: 1"><span>၁</span></label>
        <label style="--i: 2"><span>၂</span></label>
        <label style="--i: 3"><span>၃</span></label>
        <label style="--i: 4"><span>၄</span></label>
        <label style="--i: 5"><span>၅</span></label>
        <label style="--i: 6"><span>၆</span></label>
        <label style="--i: 7"><span>၇</span></label>
        <label style="--i: 8"><span>၈</span></label>
        <label style="--i: 9"><span>၉</span></label>
        <label style="--i: 10"><span>၁၀</span></label>
        <label style="--i: 11"><span>၁၁</span></label>
        <label style="--i: 12"><span>၁၂</span></label>
        <div class="indicator">
            <span class="hand hour"></span>
            <span class="hand minute"></span>
            <span class="hand second"></span>
        </div>
    </div>
</div>
<script src="/scripts/clock.js"></script>

        <!-- Ad Widget -->
        <div class="widget-ad">
            <div class="ad-160x600">
                <p><b>ဤနေရာမှာ ကြော်ငြာပါ။</b></p>
                <p>320x50</p>
            </div>
        </div>
    `;

    // Insert the content into the aside section
    asideSection.innerHTML = asideContent;
};

// Call the function to populate the aside section on page load
document.addEventListener("DOMContentLoaded", populateAside);
