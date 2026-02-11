<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil</title>
    <link rel="stylesheet" href="css/profile.css">
</head>
<body>
    <!-- Back Button -->
    <button id="backButton" class="back-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </button>

    <!-- Profile Header -->
    <div class="profile-header">
        <div class="profile-avatar">
            <img id="userAvatar" src="" alt="Profile Picture">
        </div>
        <div class="profile-info">
            <h1 id="userName" class="username">Loading...</h1>
            <p id="userEmail" class="email">Loading...</p>
        </div>
    </div>

    <!-- Ratings Section -->
    <div class="ratings-section">
        <h2 class="section-title">Ratingmu</h2>
        <div id="ratingsContainer" class="ratings-container">
            <!-- Ratings will be loaded here -->
            <div class="loading">Memuat rating...</div>
        </div>
    </div>

    <script type="module" src="js/profile.js"></script>
</body>
</html>