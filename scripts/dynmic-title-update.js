// ===== 6. Dynamic Title Update =====
// <h1> က စာသားကို <title> ထဲ ထည့်ဖို့
const postTitle = document.getElementById('post-title');
if (postTitle) {
    document.title = postTitle.textContent.trim() + " | TC-Myaing";
} else {
    console.error('Post title element not found');
}
