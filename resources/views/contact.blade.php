<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact - Shelf</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}"/>
</head>
<body>
  <header>
    <div class="logo">
      <a href="{{ route('index') }}" alt="Home">
        <img src="{{ asset('images/SHELF.png') }}" viewBox="0 0 16 16">
      </a>
      <h1>Shelf Music Library</h1>
    </div>

    <nav>
      <ul id="navbar" class="nav-links">
        <li><a href="{{ route('index') }}">Home</a></li>
        <li><a href="{{ route('library') }}">Library</a></li>
        <li><a href="{{ route('upload') }}">Upload</a></li>
        <li><a href="{{ route('profile') }}" id="profileLink">Profile</a></li>
        <li><a href="{{ route('auth') }}">User</a></li>
        <li><a href="{{ route('contact') }}" class="active">Contact</a></li>
        <li><a href="{{ route('cart') }}" id="cartLink">Cart(<span id="cartCount">0</span>)</a> </li>
      </ul>
    </nav>

  </header>

  <main class="contact">
    <h2>Contact Us</h2>
    <form id="contactForm">
      <label for="name">Name:</label>
      <input type="text" id="name" required>

      <label for="email">Email adress:</label>
      <input type="email" id="email" required>

      <label for="message">Message:</label>
      <textarea id="message" rows="5" required></textarea>

      <button type="submit" class="btn" onclick="myFunction()">Send</button>
    </form>
    <p id="formStatus"></p>
  </main>

  <div class="global-player" id="player">
    <p id="nowPlaying">Select  song to play</p>
    <audio controls id="audioPlayer">
      <source src="" type="audio/mpeg">
    </audio>
  </div>

  <footer>
    <p>© 2025 Shelf Music Library Online</p>
  </footer>

  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <script src="{{ asset('js/script.js') }}"></script>
  <noscript>Sorry, your browser does not support JavaScript!</noscript>
</body>
</html>
