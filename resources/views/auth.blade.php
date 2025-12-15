<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign In / Register - Shelf</title>
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
  </header>

  <div class="top-left">
    <a href="{{ route('index') }}">
      <button class="btn">Go Back</button>
    </a>
  </div>

  <main class="auth-page">
    <section class="card auth-card">
      <h2>Sign in</h2>
      <form id="loginForm" novalidate>
        <label for="loginEmail">Email</label>
        <input id="loginEmail" type="email" required /><br>

        <label for="loginPassword">Password</label>
        <input id="loginPassword" type="password" required /><br><br>

        <div class="form-actions">
          <button class="btn" type="submit">Log in</button>
        </div> <br>
      </form>

      <hr />

      <h2>Create account</h2>
      <form id="registerForm" novalidate>
        <label for="regName">Name</label>
        <input id="regName" type="text" required /><br>

        <label for="regEmail">Email</label>
        <input id="regEmail" type="email" required /><br>

        <label for="regPassword">Password</label>
        <input id="regPassword" type="password" minlength="8" required />
        <small id="pwHelp">Minimum 8 characters</small><br><br>

        <div class="form-actions">
          <button class="btn" type="submit">Register</button>
        </div><br>
      </form>

      <div id="authMsg" aria-live="polite" style="display:none;margin-top:10px;"></div>
    </section>
  </main>

  <script src="{{ asset('js/script.js') }}"></script>
</body>
</html>