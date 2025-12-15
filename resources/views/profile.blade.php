<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile - Shelf</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>

<body>
    <header>
        <div class="logo">
            <a href="{{ route('index') }}">
                <img src="{{ asset('images/SHELF.png') }}" alt="Shelf Logo">
            </a>
            <h1>Shelf Music Library</h1>
        </div>

        <nav>
            <ul id="navbar" class="nav-links">
                <li><a href="{{ route('index') }}">Home</a></li>
                <li><a href="{{ route('library') }}">Library</a></li>
                <li><a href="{{ route('upload') }}">Upload</a></li>
                <li><a href="{{ route('profile') }}" class="active">Profile</a></li>
                <li><a href="{{ route('auth') }}">User</a></li>
                <li><a href="{{ route('contact') }}">Contact</a></li>
                <li><a href="{{ route('cart') }}">Cart(<span id="cartCount">0</span>)</a></li>
            </ul>
        </nav>
    </header>

    <main class="container">
        <section class="card">
            <h2>Your Profile</h2>
            <div id="profileArea">
                <p style="text-align:center;color:#aaa;">Loading profile...</p>
            </div>
            <div class="form-actions">
                <button id="logoutBtn" class="btn ghost" style="display:none;">Log out</button>
            </div>
        </section>
    </main>

    <div class="global-player" id="player">
        <p id="nowPlaying">Select song to play</p>
        <audio controls id="audioPlayer">
            <source id="audioSource" src="" type="audio/mpeg">
        </audio>
    </div>

    <footer>
        <p>&copy; <span id="copyYear">2025</span> Shelf Music Library Online</p>
    </footer>

    <script src="{{ asset('js/script.js') }}"></script>
</body>
</html>