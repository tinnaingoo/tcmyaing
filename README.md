<div class="user-info">
                <span class="user-name" id="loggedInUser"></span>
</div>



<button class="menu-button" onclick="logout()">Logout</button>



    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Retrieve the logged-in username from sessionStorage
            const loggedInUser = sessionStorage.getItem('loggedInUser');

            // Display the username in the user-info section
            const loggedInUserElement = document.getElementById('loggedInUser');
            if (loggedInUser) {
                loggedInUserElement.textContent = `Logged in as: ${loggedInUser}`;
            }
        });

        function viewPost() {
            window.location.href = 'post.html';
        }

        function addData() {
            window.location.href = 'add_data.html';
        }

        function logout() {
            // Clear the sessionStorage and redirect to the login page
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    </script>


Check Login true
<script>
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('loggedIn');

  if (!isLoggedIn) {
    // If not logged in, redirect to the login page
    window.location.href = 'index.html';
  }
</script>
