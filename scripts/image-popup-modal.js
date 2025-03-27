// ===== 5. Image Popup Modal =====
// Modal နဲ့ image popup ကို control လုပ်ဖို့ logic
const imageModal = document.getElementById('myModal');
const img = document.getElementById('post-img');
const modalImg = document.getElementById('img01');
const closeBtn = document.querySelector('.close');

// Post ထဲက ပုံအားလုံးကို modal နဲ့ ချိတ်မယ်
document.querySelectorAll('.post-text img').forEach(img => {
    img.addEventListener('click', function() {
        imageModal.style.display = 'flex';
        modalImg.src = this.src;
    });
});

// Specific image ကို နှိပ်ရင် modal ဖွင့်မယ်
if (img) {
    img.addEventListener('click', function() {
        imageModal.style.display = 'block';
        modalImg.src = this.src;
    });
}

// Close button ကို နှိပ်ရင် modal ပိတ်မယ်
if (closeBtn) {
    closeBtn.addEventListener('click', function() {
        imageModal.style.display = 'none';
    });
}

// Modal ပြင်ပကို နှိပ်ရင် ပိတ်မယ်
window.addEventListener('click', function(event) {
    if (event.target === imageModal) {
        imageModal.style.display = 'none';
    }
});

// Esc key နှိပ်ရင် modal ပိတ်မယ်
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        imageModal.style.display = 'none';
    }
});

// Popup ပြင်ပကို နှိပ်ရင် ပိတ်ဖို့
document.addEventListener('click', (e) => {
    const filterPopup = document.getElementById('filterPopup');
    const filterButton = document.getElementById('filterButton');
    if (filterPopup && filterButton && !filterPopup.contains(e.target) && e.target !== filterButton) {
        filterPopup.style.display = 'none';
    }
});
