function addData() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const newData = { "username": username, "password": password };

    // GitHub API URL for updating the file
    const apiUrl = 'https://api.github.com/repos/tinnaingoo/tcmyaing/contents/json/credentials.json';

    // GitHub personal access token
    const token = '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';

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
        .then(response => {
            if (response.ok) {
                console.log('Data added successfully.');
            } else {
                console.error('Failed to add data. Status:', response.status);
            }
        })
        .catch(error => console.error('Error:', error));
}
