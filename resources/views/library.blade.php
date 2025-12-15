<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Library - Shelf</title>
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
        <li><a href="{{ route('library') }}" class="active">Library</a></li>
        <li><a href="{{ route('upload') }}">Upload</a></li>
        <li><a href="{{ route('profile') }}">Profile</a></li>
        <li><a href="{{ route('auth') }}">User</a></li>
        <li><a href="{{ route('contact') }}">Contact</a></li>
        <li><a href="{{ route('cart') }}">Cart(<span id="cartCount">0</span>)</a></li>
      </ul>
    </nav>
  </header>

  <main class="library">
    <h2>Our Library</h2>
    <h4>A compilation of the most popular tracks and emerging artists.</h4>
    
    <section class="search-section">
      <input type="text" id="searchBar" placeholder="Search a song title, artist, or genre...">
    </section>

    <div class="music-list" id="musicList">
      <!-- Songs will be loaded dynamically by script.js -->
      <p style="text-align:center;">Loading songs...</p>
    </div>
  </main>

  <div class="global-player" id="player">
    <p id="nowPlaying">Now Playing: </p>
    <audio id="audioPlayer" controls>
      <source id="audioSource" src="" type="audio/mpeg">
    </audio>
  </div>
    
  <footer>
    <p>&copy; <span id="copyYear">2025</span> Shelf Music Library Online</p>
  </footer>

  <!-- Modal for overlap songs details -->
  <div id="songModal" class="modal-overlay">
      <div class="modal-content">

          <span class="modal-close">&times;</span>

          <img id="modalCover" class="modal-cover" src="/images/default-album.png">

          <h2 id="modalTitle">Song Title</h2>
          <p><strong>Artist:</strong> <span id="modalArtist"></span></p>
          <p><strong>Album:</strong> <span id="modalAlbum"></span></p>
          <p><strong>Year:</strong> <span id="modalYear"></span></p>

          <button id="modalPlayBtn" class="modal-btn">▶️ Play Song</button>
          <button id="modalCartBtn" class="modal-btn">+ Add to Cart</button>
            <button id="modalDeleteBtn" class="modal-btn" style="background:#b30000;">🗑 Delete</button>  
      </div>
  </div>

  <script src="{{ asset('js/script.js') }}"></script>
</body>
</html>