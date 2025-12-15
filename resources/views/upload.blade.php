<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload - Shelf</title>
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
        <li><a href="{{ route('upload') }}" class="active">Upload</a></li>
        <li><a href="{{ route('profile') }}">Profile</a></li>
        <li><a href="{{ route('auth') }}">User</a></li>
        <li><a href="{{ route('contact') }}">Contact</a></li>
        <li><a href="{{ route('cart') }}">Cart(<span id="cartCount">0</span>)</a></li>
      </ul>
    </nav>
  </header>

  <main class="upload">
    <h2>Upload a Song ⬆️</h2>
    <p>Share your tracks with the Shelf community - Upload MP3 or WAV files below.</p>

    <form id="uploadForm" method="POST" novalidate enctype="multipart/form-data" autocomplete="off">
      <label for="coverImage">Album Cover (optional)</label>
      <input
        class="selectFile"
        type="file"
        id="coverImage"
        name="cover_image"
        accept="image/*"
      >

      <label for="songFile">Audio File (max 10 MB)</label>
      <input
        class="selectFile"
        type="file"
        id="songFile"
        name="audio_file"
        accept="audio/mpeg, audio/wav, audio/ogg"
        required
      >

      <label for="songTitle">Title</label>
      <input
        type="text"
        id="songTitle"
        name="title"
        placeholder="Enter song title"
        required
        minlength="2"
        maxlength="100"
      >

      <label for="songArtist">Artist</label>
      <input
        type="text"
        id="songArtist"
        name="artist"
        placeholder="Enter artist name"
        required
        minlength="2"
        maxlength="100"
      >

      <label for="songAlbum">Album (optional)</label>
      <input
        type="text"
        id="songAlbum"
        name="album"
        placeholder="Enter album name"
        maxlength="255"
      >

      <label for="songYear">Year (optional)</label>
      <input
        type="number"
        id="songYear"
        name="year"
        placeholder="e.g. 2019"
        min="1900"
        max="2025"
      >

      <label for="songGenre">Genre</label>
      <select class="select" id="songGenre" name="genre" required>
        <option value="">Select genre</option>
        <option value="Pop">Pop</option>
        <option value="Rock">Rock</option>
        <option value="Electronic">Electronic</option>
        <option value="Jazz">Jazz</option>
        <option value="Classical">Classical</option>
        <option value="Hip-Hop">Hip-Hop</option>
      </select>

      <button class="btn" type="submit">Upload</button>
      <div id="uploadMsg" aria-live="polite" style="display:none;margin-top:10px;"></div>
    </form>
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
