const populateHeader = () => {
    const headerSection = document.querySelector("#header .header-box");

    if (!headerSection) {
        console.error("Header section not found!");
        return;
    }

    const headerContent = `
        <div class="logo" id="headerLogo">
            <img src="/images/logo-white.png" alt="Tech with TCM Logo">
        </div>

        <!-- Search Box -->
        <div class="search">
            <div class="search-container" id="searchContainer">
                <i class="fa fa-search"></i>
                <input type="text" id="searchInput" placeholder="Search..">
            </div>
            
            <div id="sbutton" class="sbutton">
                <i class="fa fa-search" id="searchIcon"></i>
            </div>
            <div id="searchResults" class="search-results"></div>
        </div>

        <!-- Hamburger Icon for Mobile -->
        <div class="hamburger" onclick="toggleMenu()">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
        </div>

        <!-- Navigation Menu -->
        <nav style="top: 60px;" id="navMenu">
            <ul>
                <!-- Navigation items will be dynamically inserted here -->
            </ul>
        </nav>
    `;

    headerSection.innerHTML = headerContent;
};

document.addEventListener("DOMContentLoaded", populateHeader);


// 2. Hamburger Menu Toggle
(function hamburgerMenu() {
    function toggleMenu() {
        const navMenu = document.getElementById("navMenu");
        const hamburger = document.querySelector(".hamburger");

        if (navMenu && hamburger) {
            navMenu.classList.toggle("active");
            hamburger.classList.toggle("active");
        }
    }

    // Expose toggleMenu globally if needed
    window.toggleMenu = toggleMenu;
})();

