<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cart — Shelf</title>
  <link rel="stylesheet" href="{{ asset('css/style.css') }}"/>
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
        <li><a href="{{ route('profile') }}">Profile</a></li>
        <li><a href="{{ route('auth') }}">User</a></li>
        <li><a href="{{ route('contact') }}">Contact</a></li>
        <li><a href="{{ route('cart') }}" class="active">Cart(<span id="cartCount">0</span>)</a></li>
      </ul>
    </nav>
  </header>

  <main class="library">
    <h2>Your Basket</h2>
    <p>Review the songs you've added to your basket before checkout.</p>

    <div id="cartArea" class="cart-list"></div>

    <div class="form-actions" style="margin-top: 1.5rem;">
      <button id="checkoutBtn" class="btn">Checkout</button>
      <button id="clearCartBtn" class="btn ghost">Clear Basket</button>
    </div>
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