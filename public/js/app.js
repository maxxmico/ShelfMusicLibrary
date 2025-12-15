const API_URL = 'http://localhost:8000/api';
let authToken = localStorage.getItem('authToken');

const api = {
  
    setToken(token) {
        authToken = token;
        localStorage.setItem('authToken', token);
    },

    clearToken() {
        authToken = null;
        localStorage.removeItem('authToken');
    },

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }

        return response.json();
    },

    // Auth
    async login(email, password) {
        const data = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        return data.user;
    },

    async register(name, email, password, password_confirmation) {
        const data = await this.request('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, password_confirmation }),
        });
        this.setToken(data.token);
        return data.user;
    },

    async logout() {
        await this.request('/logout', { method: 'POST' });
        this.clearToken();
    },

    async getCurrentUser() {
        return this.request('/user');
    },

    // Songs
    async getSongs(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/songs?${query}`);
    },

    async getSong(id) {
        return this.request(`/songs/${id}`);
    },

    async createSong(formData) {
        return this.request('/songs', {
            method: 'POST',
            headers: {},
            body: formData,
        });
    },

    async updateSong(id, data) {
        return this.request(`/songs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteSong(id) {
        return this.request(`/songs/${id}`, {
            method: 'DELETE',
        });
    },

    // Playlists
    async getPlaylists() {
        return this.request('/playlists');
    },

    async createPlaylist(data) {
        return this.request('/playlists', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async addSongToPlaylist(playlistId, songId) {
        return this.request(`/playlists/${playlistId}/songs`, {
            method: 'POST',
            body: JSON.stringify({ song_id: songId }),
        });
    },
};


//----------------------- AUDIO --------------------------


const playButtons = document.querySelectorAll('.play-btn');
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById("audioSource");
const nowPlaying = document.getElementById('nowPlaying');
const nowPlayingImg = document.getElementById('nowPlayingImg');


const $ = sel => document.querySelector(sel);
const qs = sel => Array.from(document.querySelectorAll(sel));

const Storage = {
  getUsers() {
    try { return JSON.parse(localStorage.getItem('ml_users') || '{}'); } catch(e){ return {}; }
  },
  saveUsers(u) { localStorage.setItem('ml_users', JSON.stringify(u)); },

  getSession() {
    try { return JSON.parse(sessionStorage.getItem('ml_session') || 'null'); } catch(e){ return null; }
  },
  setSession(s) { sessionStorage.setItem('ml_session', JSON.stringify(s)); },
  clearSession() { sessionStorage.removeItem('ml_session'); },

  getSongs() {
    try { return JSON.parse(localStorage.getItem('ml_songs') || '[]'); } catch(e){ return []; }
  },
  saveSongs(a) { localStorage.setItem('ml_songs', JSON.stringify(a)); },

  getCart() {
    try { return JSON.parse(localStorage.getItem('ml_cart') || '[]'); } catch(e){ return []; }
  },
  saveCart(c) {
    localStorage.setItem('ml_cart', JSON.stringify(c));
    updateCartCount();
  }
};

if (playButtons) {
  playButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const songTitle = btn.parentElement.dataset.title;
      nowPlaying.textContent = `Playing: ${songTitle}`;
      audioPlayer.src = `songs/${songTitle}.mp3`;
      audioPlayer.play();
    });
  });
}

function playSong(filePath, title) {
  const player = document.getElementById("audioPlayer");
  const nowPlaying = document.getElementById("nowPlaying");

  player.src = filePath;
  nowPlaying.textContent = "Now Playing: " + title;
  player.play();
}

const searchBar = document.getElementById('searchBar');
if (searchBar) {
  searchBar.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
      const query = encodeURIComponent(e.target.value);
      window.location.href = `library.html?search=${query}`;
    }
  });
}


window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get("search");

  if (searchTerm) {
    const searchBar = document.getElementById("searchBar");
    if (searchBar) {
      searchBar.value = searchTerm;

      if (typeof filterSongs === "function") {
        filterSongs(searchTerm);
      } else {
        searchBar.dispatchEvent(new Event("input"));
      }
    }
  }
});

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('formStatus').textContent = '¡Message Sent! Await for an answer.';
    form.reset();
  });
}


// helper for the .global-player class; CSS

if (!audioPlayer || !nowPlaying) {
  console.warn("Global player not found on this page.");
}

/*

function setNowPlaying(title, artist='', dataURL=''){
  const np = $('#nowPlaying');
  if(np) np.textContent = title ? `Now Playing: ${title}${artist ? ' — ' + artist : ''}` : 'Select a song to play';
  const player = $('#audioPlayer');
  if(player) {
    if (dataURL) {
      player.src = dataURL;
    }
  }
}

*/

function setNowPlaying(title, artist = '', dataURL = '') {
  const np = document.getElementById("nowPlaying");
  const player = document.getElementById("audioPlayer");
  const source = document.getElementById("audioSource");

  if (!player || !source) {
    console.warn("Global audio player missing.");
    return;
  }

  np.textContent = `Now Playing: ${title}${artist ? " — " + artist : ""}`;

  // Set the file
  source.src = dataURL;
  player.load();
  player.play();
}


function playSong(fileUrl, title, artist = "") {
  if (!audioPlayer || !audioSource) return;

  audioSource.src = fileUrl;
  audioPlayer.load();       // tells <audio> that the source changed
  audioPlayer.play();       // start playback

  nowPlaying.textContent = `Now Playing: ${title}${artist ? " — " + artist : ""}`;
}

function attachSongPlayEvents() {
  const buttons = document.querySelectorAll(".play-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".song");

      if (!parent) return;

      const fileUrl = parent.dataset.url;
      const title = parent.dataset.title || "Unknown Title";
      const artist = parent.dataset.artist || "";

      playSong(fileUrl, title, artist);
    });
  });
}

if (path === "library.html") {
  setTimeout(attachSongPlayEvents, 100); 
}

function showMsg(el, msg, type='ok'){
  if(!el) return;
  el.textContent = msg;
  el.style.color = (type === 'ok') ? 'green' : 'crimson';
}

function escapeHtml(s=''){ 
  return String(s).replace(/[&<>\"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[c]); 
}

// SHA-256 helper (Web Crypto) 
async function sha256Hex(text){
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// Authentication
function initAuth(){
  const loginForm = $('#loginForm');
  const registerForm = $('#registerForm');
  const authMsg = $('#authMsg');

  if (registerForm){
    registerForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const name = ($('#regName') && $('#regName').value.trim()) || '';
      const email = ($('#regEmail') && $('#regEmail').value.trim().toLowerCase()) || '';
      const pw = ($('#regPassword') && $('#regPassword').value) || '';
      if(!name || !email || !pw) return showMsg(authMsg, 'Please complete all fields', 'error');
      if (pw.length < 8) return showMsg(authMsg, 'Password must be at least 8 characters', 'error');
      if (!/[0-9]/.test(pw) || !/[!@#$%^&*()_\-+=]/.test(pw)) return showMsg(authMsg, 'Password must include a number and special character', 'error');
      const users = Storage.getUsers();
      if (users[email]) return showMsg(authMsg, 'User already exists', 'error');
      const hashed = await sha256Hex(pw + email);
      users[email] = { name, email, pw: hashed, created: Date.now() };
      Storage.saveUsers(users);
      showMsg(authMsg, 'Registration successful — you may login now', 'ok');
      registerForm.reset();
    });
  }

  if (loginForm){
    loginForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const email = ($('#loginEmail') && $('#loginEmail').value.trim().toLowerCase()) || '';
      const pw = ($('#loginPassword') && $('#loginPassword').value) || '';
      const authMsgLocal = authMsg || $('#loginForm [type="submit"]');
      const users = Storage.getUsers();
      if (!users[email]) return showMsg(authMsgLocal, 'No user with that email', 'error');
      const hashed = await sha256Hex(pw + email);
      if (hashed !== users[email].pw) return showMsg(authMsgLocal, 'Incorrect password', 'error');
      Storage.setSession({ email, loggedAt: Date.now() });
      showMsg(authMsgLocal, 'Logged in — redirecting to profile', 'ok');
      setTimeout(()=> location.href = 'profile.html', 700);
    });
  }
}

// Uploading
function initUpload(){
  const form = $('#uploadForm');
  const fileInput = $('#songFile');
  const msg = $('#uploadMsg');
  if (!form || !fileInput) return;

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const file = fileInput.files && fileInput.files[0];
    if (!file) return showMsg(msg, 'Choose a file first', 'error');
    const mimeOk = /audio\/(mpeg|wav)/i.test(file.type);
    const extOk = /\.(mp3|wav)$/i.test(file.name);
    if (!mimeOk && !extOk) return showMsg(msg, 'Only MP3 or WAV files allowed', 'error');
    if (file.size > 20 * 1024 * 1024) return showMsg(msg, 'File too large (max 20MB)', 'error');

    const title = ($('#songTitle') && $('#songTitle').value.trim()) || file.name;
    const artist = ($('#songArtist') && $('#songArtist').value.trim()) || 'Unknown';
    const genre = ($('#songGenre') && $('#songGenre').value) || 'Unspecified';

    const reader = new FileReader();
    reader.onload = function(ev){
      const dataURL = ev.target.result;
      const song = {
        id: 's_' + Date.now(),
        title, artist, genre, type: file.type || '', size: file.size, dataURL
      };
      const songs = Storage.getSongs();
      songs.unshift(song);
      Storage.saveSongs(songs);
      showMsg(msg, 'Upload complete', 'ok');
      form.reset();
      // if library present, re-render
      if (typeof renderLibrary === 'function') renderLibrary();
    };
    reader.onerror = ()=> showMsg(msg, 'Failed to read file', 'error');
    reader.readAsDataURL(file);
  });
}

// Library 
let renderLibrary = null;
function initLibrary(){
  const lib = $('#libraryGrid');
  const tpl = document.getElementById('songTemplate');
  const search = $('#searchInput');
  const genre = $('#genreFilter');
  if (!lib || !tpl) return;

  function render(filterText='', genreFilter=''){
    lib.innerHTML = '';
    const songs = Storage.getSongs();
    const filtered = songs.filter(s=>{
      const txt = (s.title + ' ' + s.artist + ' ' + (s.genre||'')).toLowerCase();
      if (genreFilter && genreFilter !== '') {
        if ((s.genre||'').toLowerCase() !== genreFilter.toLowerCase()) return false;
      }
      return txt.includes((filterText||'').toLowerCase());
    });
    if (!filtered.length) {
      const p = document.createElement('p'); p.className='muted'; p.textContent='No songs found'; lib.appendChild(p); return;
    }
    filtered.forEach(s=>{
      const node = tpl.content.cloneNode(true);
      const titleEl = node.querySelector('.song-title');
      const artistEl = node.querySelector('.song-artist');
      const genreEl = node.querySelector('.song-genre');
      const durationEl = node.querySelector('.song-duration');
      const audioEl = node.querySelector('.song-player');
      const addBtn = node.querySelector('.add-cart');

      if (titleEl) titleEl.textContent = s.title;
      if (artistEl) artistEl.textContent = s.artist;
      if (genreEl) genreEl.textContent = s.genre || '—';
      if (durationEl) durationEl.textContent = s.size ? (s.size/1024/1024).toFixed(2) + ' MB' : '';
      if (audioEl) audioEl.src = s.dataURL || '';

      if (addBtn) addBtn.addEventListener('click', ()=> addToCart(s.id));
      // clicking title plays in global player
      if (titleEl) titleEl.addEventListener('click', ()=> { setNowPlaying(s.title, s.artist, s.dataURL); $('#audioPlayer') && $('#audioPlayer').play(); });

      lib.appendChild(node);
    });
  }

  renderLibrary = render;
  if (search) search.addEventListener('input', ()=> render(search.value, genre ? genre.value : ''));
  if (genre) genre.addEventListener('change', ()=> render(search ? search.value : '', genre.value));
  // prefill from query string
  const params = new URLSearchParams(window.location.search);
  const q = params.get('search');
  const g = params.get('genre');
  if (q && search){ search.value = q; }
  if (g && genre){ genre.value = g; }
  render(search ? search.value : '', genre ? genre.value : '');
}

// Cart
function updateCartCount(){
  const c = Storage.getCart().length;
  qs('#cartCount, #cartCount2').forEach(el => { if (el) el.textContent = c; });
  
}

function attachCartLinks(){
  qs('#cartLink, #cartLink2').forEach(el => {
    if(!el) return;
    el.addEventListener('click', e=>{ e.preventDefault(); showCartModal(); });
  });
}
// Cart helper
function renderCartArea(container){
  const cart = Storage.getCart();
  if (!container) return;
  if (!cart.length){
    container.innerHTML = '<p class="muted">Your basket is empty.</p>';
    return;
  }
  container.innerHTML = '<ul>' + cart.map(it=>`<li class="cart-item"><div class="cart-info"><strong>${escapeHtml(it.title)}</strong><span>${escapeHtml(it.artist)}</span></div></li>`).join('') + '</ul>';
}
//cart helper
function addToCart(songId){
  const songs = Storage.getSongs();
  const s = songs.find(x=>x.id===songId);
  if(!s) { alert('Song not found'); return; }
  const cart = Storage.getCart();
  cart.push({ id: s.id, title: s.title, artist: s.artist });
  Storage.saveCart(cart);
  updateCartCount();
  alert('Added to basket');
}

// Porfile
function initProfile(){
  const area = $('#profileArea');
  const logoutBtn = $('#logoutBtn');
  if (!area) return;
  const session = Storage.getSession();
  if (!session) {
    area.innerHTML = '<p>You are not logged in. <a href="auth.html">Login or register</a></p>';
    if (logoutBtn) logoutBtn.style.display='none';
    return;
  }
  const users = Storage.getUsers();
  const u = users[session.email];
  if (!u) { area.innerHTML = '<p>User not found.</p>'; return; }
  area.innerHTML = `<p><strong>Name:</strong> ${escapeHtml(u.name)}</p><p><strong>Email:</strong> ${escapeHtml(u.email)}</p><p><strong>Member since:</strong> ${new Date(u.created).toLocaleString()}</p>`;
  if (logoutBtn) logoutBtn.addEventListener('click', ()=> { Storage.clearSession(); location.href = 'index.html'; });
}

function attachPlayButtons(){
  qs('.play-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const p = btn.closest('.song') || btn.parentElement;
      const title = p && p.dataset && p.dataset.title || btn.dataset.title || '';
      const songs = Storage.getSongs();
      const s = songs.find(x=>x.title === title) || songs[0];
      if(s) { 
        setNowPlaying(s.title, s.artist, s.dataURL); 
        const player = $('#audioPlayer'); 
        if (player) player.play(); 
      }
    });
  });
}

// Initialization
(function boot(){
  qs('#copyYear,#copyYear2,#copyYear3,#copyYear4').forEach(el => { if(el) el.textContent = new Date().getFullYear(); }); // set page copy years if elements exist
  attachCartLinks();
  updateCartCount();
  attachPlayButtons();

  const path = window.location.pathname.split('/').pop(); // Route by name of file

  if (path === 'auth.html') initAuth();
  if (path === 'upload.html') initUpload();
  if (path === 'library.html') initLibrary();
  if (path === 'profile.html') initProfile();

  // If cart page loads, check for #cartArea and render there
  const cartArea = document.getElementById('cartArea');
  if (cartArea) renderCartArea(cartArea);
})();
