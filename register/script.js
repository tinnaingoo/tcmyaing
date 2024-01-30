function addData() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const newData = { "username": username, "password": password };

    // GitHub API URL for updating the file
    const apiUrl = 'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPOSITORY/contents/json/credentials.json';

    // GitHub personal access token
    const token = 'YOUR_PERSONAL_ACCESS_TOKEN';

    // Fetch options
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    // Fetch current file content
    fetch(apiUrl, options)
        .then(response => response.json())
        .then(data => {
            const content = JSON.parse(atob(data.content));
            content.push(newData);

            const updateOptions = {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Add new data',
                    content: btoa(JSON.stringify(content)),
                    sha: data.sha,
                }),
            };

            // Update the file content
            return fetch(apiUrl, updateOptions);
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data added successfully:', data);
        })
        .catch(error => console.error('Error:', error));
}
