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
