const populateFooter = () => {
    const footerSection = document.querySelector("#footer .container");

    if (!footerSection) {
        console.error("Footer section not found!");
        return;
    }

    const footerContent = `
        <p>&copy; 2025 Tech with TCM. All rights reserved.</p>
    `;

    footerSection.innerHTML = footerContent;
};

document.addEventListener("DOMContentLoaded", populateFooter);
