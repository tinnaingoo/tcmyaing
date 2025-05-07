/* ======================
   CREATE POST FUNCTIONALITY
   ====================== */

const setupCreatePostTab = () => {
    const previewBtn = document.getElementById('previewBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    const copyPreviewBtn = document.getElementById('copyPreviewBtn');
    const tabs = document.querySelectorAll('.tab');
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Button events
    previewBtn.addEventListener('click', previewPost);
    clearBtn.addEventListener('click', clearForm);
    copyBtn.addEventListener('click', copyPostData);
    backToFormBtn.addEventListener('click', () => switchTab('form'));
    copyPreviewBtn.addEventListener('click', copyPostData);
};

const switchTab = (tabId) => {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    
    document.querySelectorAll('#create-post-tab .tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}-tab`);
    });
};

const previewPost = () => {
    const title = document.getElementById('post-title').value;
    const author = document.getElementById('post-author').value;
    const date = document.getElementById('post-date').value;
    const coverImage = document.getElementById('post-cover-image').value;
    const imageAlt = document.getElementById('post-image-alt').value;
    const content = document.getElementById('post-content').value;
    
    if (!title || !author || !date || !coverImage || !imageAlt || !content) {
        showAlert('ကျေးဇူးပြု၍ အကွက်အားလုံးကို ဖြည့်ပါ', 'danger');
        return;
    }
    
    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-meta').innerHTML = `ရေးသူ <a>${author}</a> • ${date}`;
    document.getElementById('preview-image').src = coverImage;
    document.getElementById('preview-image').alt = imageAlt;
    document.getElementById('preview-content').innerHTML = content;
    
    switchTab('preview');
    showAlert('ဆောင်းပါးအစမ်းမြင်ကွင်း အောင်မြင်စွာဖန်တီးပြီးပါပြီ', 'success');
};

const clearForm = () => {
    document.getElementById('post-form').reset();
    document.getElementById('post-date').value = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    showAlert('ဖောင်ကို ရှင်းလင်းပြီးပါပြီ', 'success');
};

const copyPostData = async () => {
    const formElements = document.getElementById('post-form').elements;
    const postData = {
        title: formElements['post-title'].value,
        author: formElements['post-author'].value,
        date: formElements['post-date'].value,
        coverImage: formElements['post-cover-image'].value,
        imageAlt: formElements['post-image-alt'].value,
        content: formElements['post-content'].value
    };
    
    if (Object.values(postData).some(value => !value)) {
        showAlert('ကျေးဇူးပြု၍ အကွက်အားလုံးကို ဖြည့်ပါ', 'danger');
        return;
    }
    
    const postDataString = `const postData = ${JSON.stringify(postData, null, 4)};\n\n// DOM content loaded\ndocument.addEventListener("DOMContentLoaded", () => {\n    // Set title\n    document.getElementById("post-title").textContent = postData.title;\n\n    // Set author and date\n    const postMeta = document.querySelector(".post-meta");\n    if (postMeta) {\n        postMeta.innerHTML = \`ရေးသူ <a>\${postData.author}</a> • \${postData.date}\`;\n    }\n\n    // Set cover image\n    const coverImageContainer = document.getElementById("post-cover-image");\n    if (coverImageContainer) {\n        coverImageContainer.innerHTML = \`<img src="\${postData.coverImage}" alt="\${postData.imageAlt}" />\`;\n    }\n\n    // Set post content\n    const postText = document.getElementById("post-text");\n    if (postText) {\n        postText.innerHTML = postData.content;\n    }\n});`;
    
    try {
        await navigator.clipboard.writeText(postDataString);
        showAlert('ဆောင်းပါးဒေတာများကို clipboard သို့ ကူးယူပြီးပါပြီ!', 'success');
    } catch (err) {
        showAlert('ကူးယူရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်: ' + err, 'danger');
    }
};
