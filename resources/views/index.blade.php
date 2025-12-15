<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shelf Music Library</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>

<body>
  <header>
    <div class="logo">
      <a href="{{ route('index') }}" alt="Home">
        <img src="{{ asset('images/SHELF.png') }}" alt="Shelf Logo">
      </a>
      <h1>Shelf Music Library</h1>
    </div>

    <nav>
      <ul id="navbar" class="nav-links">
        <li><a href="{{ route('index') }}" class="active">Home</a></li>
        <li><a href="{{ route('library') }}">Library</a></li>
        <li><a href="{{ route('upload') }}">Upload</a></li>
        <li><a href="{{ route('profile') }}" id="profileLink">Profile</a></li>
        <li><a href="{{ route('auth') }}">User</a></li>
        <li><a href="{{ route('contact') }}">Contact</a></li>
        <li><a href="{{ route('cart') }}" id="cartLink">Cart(<span id="cartCount">0</span>)</a></li>
      </ul>
    </nav>
  </header>

  <main class="options">
    <h1>Welcome to Shelf Music Library!</h1>
    <h2>Your new musical space where you can upload, download and listen to your favourite tracks.</h2> <br><br>

    <section class="search-section">
      <input type="text" id="homepageSearch" placeholder="Search for songs or artists...">
    </section>

    <!-- SUBS STATIC WITH DINAMIC ALBUMS/ LATESTS 

    <section class="featured-albums">
      <h2>Featured Albums</h2>

      <div class="album-grid">
          @forelse ($featured as $song)
              <div class="album" onclick="location.href='{{ route('library') }}'">
                  <img src="{{ asset('storage/' . $song->cover_image) }}" alt="Album cover">

                  <p>{{ $song->title }}</p>
                  <p style="font-size: .8em; opacity:.7;">{{ $song->artist }}</p>
              </div>
          @empty
              <p style="text-align:center;">No songs uploaded yet.</p>
          @endforelse
      </div>
    </section>

    -->

  <section class="featured-albums">
  <h2>Featured Songs</h2>

  <div class="album-grid">

    @if(isset($featured) && count($featured) > 0)
      @foreach($featured as $song)
        <div class="album featured-song" data-id="{{ $song->id }}">
          @if($song->cover_image && file_exists(public_path('storage/' . $song->cover_image)))
            <img src="{{ asset('storage/' . $song->cover_image) }}" alt="{{ $song->title }}">
          @else
            <img src="{{ asset('images/default-album.png') }}" alt="{{ $song->title }}">
          @endif

          <p><strong>{{ $song->title }}</strong></p>
          <p style="font-size: 0.8em; opacity: 0.8">{{ $song->artist }}</p>
        </div>
      @endforeach

    @else
      <!-- Static fallback albums -->
      <div class="album featured-song" data-id="1">
        <img src="{{ asset('images/FrankSinatra.png') }}">
        <p>Where are You? - Frank Sinatra</p>
      </div>

      <div class="album featured-song" data-id="2">
        <img src="{{ asset('images/Supertramp.png') }}">
        <p>Breakfast in America - Supertramp</p>
      </div>

      <div class="album featured-song" data-id="3">
        <img src="{{ asset('images/PinkFloyd.png') }}">
        <p>The Dark Side of the Moon - Pink Floyd</p>
      </div>

      <div class="album featured-song" data-id="4">
        <img src="{{ asset('images/LedZepellin.png') }}">
        <p>Led Zeppelin III - Led Zeppelin</p>
      </div>
    @endif

  </div>
</section>

</section>
    
    <section class="hero">
      <section class="container">
        <h2>Purchase and Upload your Favourite Music!</h2>
        <div class="cta-row">
          <a class="btn" href="{{ route('library') }}">Browse Library</a>
        </div> 
        <h2>Make yourself known</h2>
        <div class="cta-row">
          <a class="btn ghost" href="{{ route('upload') }}">Upload Song</a>
        </div>
      </section>
    </section>
  </main>

  <div class="global-player" id="player">
    <p id="nowPlaying">Now Playing: </p>
    <audio controls id="audioPlayer">
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