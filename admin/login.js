document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Mock authentication (replace with real backend in production)
    const users = JSON.parse(localStorage.getItem('users')) || [
        { username: 'admin', password: 'password123', role: 'admin' }
    ];
    if (users.some(user => user.username === username && user.password === password)) {
        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = '/admin/index.html';
    } else {
        const alert = document.getElementById('alert-danger');
        alert.textContent = 'Invalid username or password';
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 5000);
    }
});
