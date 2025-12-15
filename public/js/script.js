// API Configuration
const API_URL = "/api";
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// API Helper Functions
const api = {
    setToken(token) {
        authToken = token;
        localStorage.setItem('authToken', token);
    },

    clearToken() {
        authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        currentUser = null;
    },

    async request(endpoint, options = {}) {
        const headers = {
            'Accept': 'application/json',
            ...options.headers,
        };

        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }else {
        headers['Content-Type'] = 'application/json';
        }

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                // Laravel validation error format (422):
                //{message: "...", errors {field: ["msg1", "msg2"]}}
                if (response.status === 422 && data && data.errors){
                    const flatErrors = Object.values(data.errors).flat();
                    throw new Error(flatErrors.join(' | '));
                }
                throw new Error(data.message || `Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth
    async register(name, email, password, password_confirmation) {
        const data = await this.request('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, password_confirmation }),
        });
        this.setToken(data.token);
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data;
    },

    async login(email, password) {
        const data = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data;
    },

    async logout() {
        try {
            await this.request('/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        this.clearToken();
    },

    async getCurrentUser() {
        if (!authToken) return null;
        try {
            const user = await this.request('/user');
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        } catch (e) {
            this.clearToken();
            return null;
        }
    },

    // Songs
    async getSongs(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/songs${query ? '?' + query : ''}`);
    },

    async getSong(id) {
        return this.request(`/songs/${id}`);
    },

    async createSong(formData) {
    const headers = {
        'Accept': 'application/json',
    };

    // IMPORTANT: do NOT set Content-Type for FormData
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}/songs`, {
        method: 'POST',
        headers,
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        // Laravel validation errors (422)
        if (response.status === 422 && data && data.errors) {
            const flat = Object.values(data.errors).flat();
            throw new Error(flat.join(' | '));
        }
        throw new Error(data.message || `Error: ${response.status}`);
    }

    return data;
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

    // Playlists (Cart functionality)
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

    async deletePlaylist(id) {
        return this.request(`/playlists/${id}`, {
            method: 'DELETE',
        });
    }
};

// Local Cart Storage (DMEO purposes)
const Cart = {
    getCart() {
        try {
            return JSON.parse(localStorage.getItem('ml_cart') || '[]');
        } catch (e) {
            return [];
        }
    },

    saveCart(cart) {
        localStorage.setItem('ml_cart', JSON.stringify(cart));
        updateCartCount();
    },

    addToCart(song) {
        const cart = this.getCart();
        cart.push({
            id: song.id,
            title: song.title,
            artist: song.artist
        });
        this.saveCart(cart);
    },

    clearCart() {
        this.saveCart([]);
    }
};

// UI Helper Functions
function showMsg(el, msg, type = 'ok') {
    if (!el) return;
    el.textContent = msg;
    el.style.color = (type === 'ok') ? 'green' : 'crimson';
    el.style.display = 'block';
}

/*
function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&',
        '<': '>',
        '"': '"',
        "'": '''
    })[c]);
}
*/

function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

function updateCartCount() {
    const count = Cart.getCart().length;
    document.querySelectorAll('#cartCount, #cartCount2').forEach(el => {
        if (el) el.textContent = count;
    });
}

// Audio Player Functions
function playSong(fileURL, title, artist = "") {
    const audioPlayer = document.getElementById("audioPlayer");
    const audioSource = document.getElementById("audioSource");
    const nowPlaying = document.getElementById("nowPlaying");

    if (!audioPlayer || !audioSource || !nowPlaying) return;

    audioSource.src = fileURL;
    audioPlayer.load();
    audioPlayer.play();
    nowPlaying.textContent = `Now Playing: ${title}${artist ? " — " + artist : ""}`;
}

const PlayerState = {
    save(song, currentTime, isPlaying) {
        const state = {
            title: song.title,
            artist: song.artist,
            url: song.url,
            currentTime: currentTime,
            isPlaying: isPlaying,
            timestamp: Date.now()
        };
        localStorage.setItem('playerState', JSON.stringify(state));
    },

    get() {
        try {
            const state = localStorage.getItem('playerState');
            if (!state) return null;
            
            const parsed = JSON.parse(state);
            // Clear state if older than 1 hour
            if (Date.now() - parsed.timestamp > 3600000) {
                this.clear();
                return null;
            }
            return parsed;
        } catch (e) {
            return null;
        }
    },

    clear() {
        localStorage.removeItem('playerState');
    }
};

// Update playSong function to save state
let playerUpdateInterval = null;

function playSong(fileURL, title, artist = "") {
    const audioPlayer = document.getElementById("audioPlayer");
    const audioSource = document.getElementById("audioSource");
    const nowPlaying = document.getElementById("nowPlaying");

    if (!audioPlayer || !audioSource || !nowPlaying) return;

    audioSource.src = fileURL;
    audioPlayer.load();
    audioPlayer.play();
    nowPlaying.textContent = `Now Playing: ${title}${artist ? " — " + artist : ""}`;

    // Save player state only on specific events
    const saveState = () => {
        PlayerState.save(
            { title, artist, url: fileURL },
            audioPlayer.currentTime,
            !audioPlayer.paused
        );
    };

    // Save state every 10 seconds while playing
    let saveInterval = setInterval(() => {
        if (!audioPlayer.paused) {
            saveState();
        }
    }, 10000);

    // Save on play/pause/seek
    audioPlayer.onplay = saveState;
    audioPlayer.onpause = saveState;
    audioPlayer.onseeked = saveState;
    
    // Clear on end
    audioPlayer.onended = () => {
        PlayerState.clear();
        clearInterval(saveInterval);
    };
}

// Restore player state on page load (SIMPLER VERSION)
function restorePlayerState() {
    const audioPlayer = document.getElementById("audioPlayer");
    const audioSource = document.getElementById("audioSource");
    const nowPlaying = document.getElementById("nowPlaying");

    if (!audioPlayer || !audioSource || !nowPlaying) return;

    const state = PlayerState.get();
    if (!state) return;

    // Set the source
    audioSource.src = state.url;
    nowPlaying.textContent = `Now Playing: ${state.title}${state.artist ? " — " + state.artist : ""}`;

    // Load and wait for metadata
    audioPlayer.load();
    
    audioPlayer.addEventListener('canplay', function restore() {
        // Set time after audio is ready
        if (state.currentTime && state.currentTime > 0) {
            audioPlayer.currentTime = state.currentTime;
        }
        
        // Auto-resume if it was playing
        if (state.isPlaying) {
            audioPlayer.play().catch(err => console.log('Autoplay blocked'));
        }
        
        // Remove this listener so it doesn't fire again
        audioPlayer.removeEventListener('canplay', restore);
    }, { once: true });

    // Set up state saving
    const saveState = () => {
        PlayerState.save(
            { title: state.title, artist: state.artist, url: state.url },
            audioPlayer.currentTime,
            !audioPlayer.paused
        );
    };

    let saveInterval = setInterval(() => {
        if (!audioPlayer.paused) saveState();
    }, 10000);

    audioPlayer.onplay = saveState;
    audioPlayer.onpause = saveState;
    audioPlayer.onseeked = saveState;
    audioPlayer.onended = () => {
        PlayerState.clear();
        clearInterval(saveInterval);
    };
}

// Authentication Functions
function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authMsg = document.getElementById('authMsg');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim().toLowerCase();
            const password = document.getElementById('regPassword').value;
            const password_confirmation = password; // Same as password

            if (!name || !email || !password) {
                return showMsg(authMsg, 'Please complete all fields', 'error');
            }

            if (password.length < 8) {
                return showMsg(authMsg, 'Password must be at least 8 characters', 'error');
            }

            try {
                await api.register(name, email, password, password_confirmation);
                showMsg(authMsg, 'Registration successful — redirecting to profile', 'ok');
                setTimeout(() => location.href = '/profile', 1000);
            } catch (error) {
                showMsg(authMsg, error.message || 'Registration failed', 'error');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;

            try {
                await api.login(email, password);
                showMsg(authMsg, 'Logged in — redirecting to profile', 'ok');
                setTimeout(() => location.href = '/profile', 1000);
            } catch (error) {
                showMsg(authMsg, error.message || 'Login failed', 'error');
            }
        });
    }
}

// Upload Functions
function initUpload() {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('songFile');
    const coverInput = document.getElementById('coverImage');
    const msg = document.getElementById('uploadMsg');

    if (!form || !fileInput) return;
    console.log('initUpload() active ✅');


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = fileInput.files && fileInput.files[0];
        if (!file) {
            return showMsg(msg, 'Choose an audio file first', 'error');
        }

        // Validate audio file
        const mimeOk = /audio\/(mpeg|wav)/i.test(file.type);
        const extOk = /\.(mp3|wav)$/i.test(file.name);
        if (!mimeOk && !extOk) {
            return showMsg(msg, 'Only MP3 or WAV files allowed', 'error');
        }
        if (file.size > 10 * 1024 * 1024) {
            return showMsg(msg, 'Audio file too large (max 10MB)', 'error');
        }

        // Validate cover image if provided
        const coverFile = coverInput && coverInput.files && coverInput.files[0];
        if (coverFile) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validImageTypes.includes(coverFile.type)) {
                return showMsg(msg, 'Cover image must be JPG or PNG', 'error');
            }
            if (coverFile.size > 2 * 1024 * 1024) {
                return showMsg(msg, 'Cover image too large (max 2MB)', 'error');
            }
        }

        // ===== NEW: Validate text fields (simple but solid) =====
        const titleEl = document.getElementById('songTitle');
        const artistEl = document.getElementById('songArtist');
        const albumEl = document.getElementById('songAlbum');
        const genreEl = document.getElementById('songGenre');
        const yearEl = document.getElementById('songYear');

        const title = titleEl ? titleEl.value.trim() : '';
        const artist = artistEl ? artistEl.value.trim() : '';
        const album = albumEl ? albumEl.value.trim() : '';
        const genre = genreEl ? genreEl.value : '';
        const yearRaw = yearEl ? yearEl.value.trim() : '';

        if (title.length < 2 || title.length > 100) {
            return showMsg(msg, 'Title must be 2–100 characters', 'error');
        }

        if (artist.length < 2 || artist.length > 100) {
            return showMsg(msg, 'Artist must be 2–100 characters', 'error');
        }

        if (!genre) {
            return showMsg(msg, 'Please select a genre', 'error');
        }

        const currentYear = new Date().getFullYear();
        if (yearRaw) {
            const y = Number(yearRaw);
            if (!Number.isInteger(y) || y < 1900 || y > currentYear) {
                return showMsg(msg, `Year must be between 1900 and ${currentYear}`, 'error');
            }
        }
        // =======================================================

        // Create FormData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('artist', artist);
        if (album) formData.append('album', album);
        formData.append('genre', genre);
        if (yearRaw) formData.append('year', yearRaw);
        formData.append('duration', 180); // Default duration
        formData.append('audio_file', file);

        // Add cover image if selected
        if (coverFile) {
            formData.append('cover_image', coverFile);
        }
        console.log('DEBUG title/artist:', { title, artist });
        console.log('DEBUG formData entries:', [...formData.entries()]);

        try {
            showMsg(msg, 'Uploading... Please wait', 'ok');
            console.log("DEBUG values:", { title, artist, album, genre, yearRaw });
            console.log("DEBUG formData:", [...formData.entries()]);
            console.log("FORMDATA ENTRIES:", [...formData.entries()]);

            await api.createSong(formData);
            showMsg(msg, '✅ Upload complete! Song added to library.', 'ok');
            form.reset();

            // Refresh library if on library page
            if (typeof renderLibrary === 'function') {
                setTimeout(() => renderLibrary(), 500);
            }

            // Redirect to library after 2 seconds
            setTimeout(() => {
                window.location.href = '/library';
            }, 2000);
        } catch (error) {
            showMsg(msg, '❌ ' + (error.message || 'Upload failed'), 'error');
        }
    });
}

// Library Functions
let renderLibrary = null;

function initLibrary() {
    const lib = document.getElementById('musicList');
    const search = document.getElementById('searchBar');

    if (!lib) return;

    async function render(searchQuery = '') {
        try {
            lib.innerHTML = '<p style="text-align:center;">Loading songs...</p>';

            const params = {};
            if (searchQuery) params.search = searchQuery;

            const response = await api.getSongs(params);
            const songs = response.data || response;

            lib.innerHTML = '';

            if (!songs || songs.length === 0) {
                lib.innerHTML = '<p class="muted" style="text-align:center;">No songs found</p>';
                return;
            }

            songs.forEach(song => {
                const songDiv = document.createElement('div');
                songDiv.className = 'song';
                songDiv.dataset.id = song.id;
                songDiv.dataset.title = song.title;
                songDiv.dataset.artist = song.artist;
                songDiv.dataset.url = song.audio_file ? `/storage/${song.audio_file}` : '';

                // Determine cover image
                let coverImage = '/images/default-album.png';
                if (song.cover_image) {
                    coverImage = `/storage/${song.cover_image}`;
                }

                songDiv.innerHTML = `
                    <img src="${coverImage}" alt="${escapeHtml(song.title)}" 
                         onload="this.style.opacity=1" 
                         style="opacity:0;transition:opacity 0.3s">
                    <h3>${escapeHtml(song.title)}</h3>
                    <p>Artist: ${escapeHtml(song.artist)}</p>
                    <p>Genre: ${escapeHtml(song.genre || '—')}</p>
                    <button class="play-btn">▶️ Play</button>
                    <button class="add-cart-btn" style="margin-top:5px;">+ Add to Cart</button>
                `;

                songDiv.addEventListener('click', () => openSongModal(song));

                // Play button
            /*
                const playBtn = songDiv.querySelector('.play-btn');
                playBtn.addEventListener('click', () => {
                    const url = songDiv.dataset.url;
                    if (url) {
                        playSong(url, song.title, song.artist);
                    } else {
                        alert('Audio file not available for this song');
                    }
                });
            */
                // Play button for updated playing bat
                const playBtn = songDiv.querySelector('.play-btn');
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent modal click
                    const url = songDiv.dataset.url;

                    if (!url) {
                        alert("Audio file not available for this song");
                        return;
                    }

                    playSong(url, song.title, song.artist);
                });

                // Add to cart button
                const cartBtn = songDiv.querySelector('.add-cart-btn');
                cartBtn.addEventListener('click', () => {
                    Cart.addToCart(song);
                    alert(`Added "${song.title}" to cart!`);
                });

                lib.appendChild(songDiv);
            });
        } catch (error) {
            console.error('Error loading library:', error);
            lib.innerHTML = '<p style="color:red;text-align:center;">Error loading songs. Please try again.</p>';
        }
    }

    renderLibrary = render;

    if (search) {
        search.addEventListener('input', () => render(search.value));
    }

    render();
}

// Song modal 
function openSongModal(song) {
    document.getElementById('modalCover').src =
        song.cover_image ? `/storage/${song.cover_image}` : '/images/default-album.png';

    document.getElementById('modalTitle').textContent = song.title;
    document.getElementById('modalArtist').textContent = song.artist;
    document.getElementById('modalAlbum').textContent = song.album ?? 'Unknown';
    document.getElementById('modalYear').textContent = song.year ?? 'Unknown';

    const playBtn = document.getElementById('modalPlayBtn');
        playBtn.onclick = () => {
            const url = song.audio_file ? `/storage/${song.audio_file}` : null;

            if (url) {
                playSong(url, song.title, song.artist);
            } else {
                alert("Audio file not available for this song");
            }
    };

    const cartBtn = document.getElementById('modalCartBtn');
    cartBtn.onclick = () => {
        Cart.addToCart(song);
        alert(`Added "${song.title}" to cart`);
    };

    document.getElementById('songModal').style.display = 'flex';

    // Delete song modal button (admin only)
    const delBtn = document.getElementById('modalDeleteBtn');
    if (
        currentUser &&
        (currentUser.role === "admin" || currentUser.id === song.uploaded_by)
    ) {
        delBtn.style.display = "block";   // show button

        delBtn.onclick = async () => {
            if (!confirm(`Delete "${song.title}"?`)) return;

            try {
                await api.deleteSong(song.id);
                alert("Song deleted.");
                document.getElementById('songModal').style.display = 'none';

                if (typeof renderLibrary === "function") {
                    renderLibrary();
                }
            } catch (err) {
                alert("Could not delete song");
                console.error(err);
            }
        };
    } else {
        delBtn.style.display = "none"; // hide for everyone else (guests, other users)
        delBtn.onclick = null;         // remove any previous handler
    }
}

// Close modal when clicking X
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.modal-close').onclick = () =>
        document.getElementById('songModal').style.display = 'none';

    // Close when clicking outside the modal
    document.getElementById('songModal').onclick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            document.getElementById('songModal').style.display = 'none';
        }
    };
});

// Modal in the indel
function initIndexModals() {
    const featured = document.querySelectorAll('.featured-song');

    featured.forEach(box => {
        box.addEventListener('click', async () => {
            const id = box.dataset.id;

            try {
                const song = await api.getSong(id);
                openSongModal(song);  // reuse the same modal
            } catch (e) {
                console.error("Error loading featured song", e);
            }
        });
    });
}

// Profile Functions
function initProfile() {
    const area = document.getElementById('profileArea');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!area) return;

    async function loadProfile() {
        try {
            const user = await api.getCurrentUser();

            if (!user) {
                area.innerHTML = '<p>You are not logged in. <a href="/auth">Login or register</a></p>';
                if (logoutBtn) logoutBtn.style.display = 'none';
                return;
            }

            // Format the date nicely
            const memberSince = new Date(user.created_at);
            const formattedDate = memberSince.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Create styled profile display
            area.innerHTML = `
                <div class="profile-info">
                    <div class="profile-field">
                        <label>Name:</label>
                        <span>${escapeHtml(user.name)}</span>
                    </div>
                    <div class="profile-field">
                        <label>Email:</label>
                        <span>${escapeHtml(user.email)}</span>
                    </div>
                    <div class="profile-field">
                        <label>Role:</label>
                        <span class="role-badge role-${user.role}">${escapeHtml(user.role)}</span>
                    </div>
                    <div class="profile-field">
                        <label>Member since:</label>
                        <span>${formattedDate}</span>
                    </div>
                </div>
            `;

            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
                logoutBtn.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to log out?')) {
                        await api.logout();
                        location.href = '/';
                    }
                });
            }
        } catch (error) {
            area.innerHTML = '<p style="color:red;">Error loading profile. Please try logging in again.</p>';
            if (logoutBtn) logoutBtn.style.display = 'none';
            console.error(error);
        }
    }

    loadProfile();
}

// Cart Functions
function renderCartArea(container) {
    if (!container) return;

    const cart = Cart.getCart();

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-cart">
                <p class="muted">🛒 Your basket is empty.</p>
                <p style="color: #aaa; margin-top: 10px;">Add some songs from the library!</p>
                <a href="/library" class="btn" style="margin-top: 20px;">Browse Library</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="cart-summary">
            <p><strong>Total items:</strong> <span class="cart-total">${cart.length}</span></p>
        </div>
        <ul class="cart-items">
            ${cart.map((item, index) => `
                <li class="cart-item">
                    <div class="cart-item-number">${index + 1}</div>
                    <div class="cart-info">
                        <strong class="cart-title">${escapeHtml(item.title)}</strong>
                        <span class="cart-artist">${escapeHtml(item.artist)}</span>
                    </div>
                    <button class="remove-item-btn" data-index="${index}" title="Remove from cart">
                        ✕
                    </button>
                </li>
            `).join('')}
        </ul>
    `;

    // Add remove functionality to each button
    container.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            const cart = Cart.getCart();
            const removedSong = cart[index];
            cart.splice(index, 1);
            Cart.saveCart(cart);
            renderCartArea(container);
            
            // Show notification
            showNotification(`Removed "${removedSong.title}" from cart`);
        });
    });
}

function initCart() {
    const cartArea = document.getElementById('cartArea');
    const clearBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartArea) {
        renderCartArea(cartArea);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const cart = Cart.getCart();
            if (cart.length === 0) {
                alert('Your basket is already empty!');
                return;
            }
            
            if (confirm('Clear all items from your basket?')) {
                Cart.clearCart();
                renderCartArea(cartArea);
                showNotification('Basket cleared!');
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = Cart.getCart();
            if (cart.length === 0) {
                alert('Your basket is empty! Add some songs first.');
                return;
            }
            
            alert(`Checkout demo:\n\nYou have ${cart.length} song(s) in your basket.\n\nTotal: $${(cart.length * 0.99).toFixed(2)}\n\n(Payment system not implemented)`);
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Contact Form
function initContact() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (status) {
                status.textContent = '¡Message Sent! Await for an answer.';
                status.style.color = 'green';
            }
            form.reset();
        });
    }
}

// Search functionality
function initSearch() {
    const searchBar = document.getElementById('searchBar');
    const homepageSearch = document.getElementById('homepageSearch');

    if (searchBar) {
        searchBar.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const query = encodeURIComponent(e.target.value.trim());
                if (query) {
                    window.location.href = `/library?search=${query}`;
                }
            }
        });
    }

    if (homepageSearch) {
        homepageSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim() !== '') {
                const query = encodeURIComponent(e.target.value.trim());
                window.location.href = `/library?search=${query}`;
            }
        });
    }

    // Handle search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');

    if (searchTerm && searchBar) {
        searchBar.value = searchTerm;
        if (typeof renderLibrary === 'function') {
            renderLibrary(searchTerm);
        }
    }
}

// Initialization
(function boot() {
    // Update copyright year
    document.querySelectorAll('#copyYear, #copyYear2, #copyYear3, #copyYear4').forEach(el => {
        if (el) el.textContent = new Date().getFullYear();
    });

    // Update cart count
    updateCartCount();
    // Keep audio player from previous pages
    restorePlayerState();

    // Load current user if token exists
    if (authToken) {
        api.getCurrentUser().catch(() => {
            // Token invalid, clear it
            api.clearToken();
        });
    }

    // Initialize based on current page
    const path = window.location.pathname;

    if (path === '/' || path === '/index') {
        initSearch();
        initIndexModals(); //Modal for index page
    } else if (path === '/auth') {
        initAuth();
    } else if (path === '/upload') {
        initUpload();
    } else if (path === '/library') {
        initLibrary();
        initSearch();
    } else if (path === '/profile') {
        initProfile();
    } else if (path === '/cart') {
        initCart();
    } else if (path === '/contact') {
        initContact();
    }
})();



/*

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

/*
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");

    if (window.scrollY > 20) {
        header.classList.add("small");
    } else {
        header.classList.remove("small");
    }
});


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
      //window.location.href = `library.blade.php?search=${query}`;
      window.location.href = `{{ route('library') }}?search=${encodeURIComponent(e.target.value.trim())}`;
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
  

function setNowPlaying(title, artist = '', dataURL = '') {
  const np = document.getElementById("nowPlaying");
  if(np) np.textContent = title ? `Now Playing: ${title}${artist ? ' — ' + artist : ''}` : 'Select a song to play';
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


function playSong(fileURL, title, artist = "") {
  if (!audioPlayer || !audioSource) return;

  audioSource.src = fileURL;
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

      const fileURL = parent.dataset.url;
      const title = parent.dataset.title || "Unknown Title";
      const artist = parent.dataset.artist || "";

      playSong(fileURL, title, artist);
    });
  });
}

if (path === "library.blade.php") {
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
      setTimeout(()=> location.href = 'profile.blade.php', 700);
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
    if (file.size > 40 * 1024 * 1024) return showMsg(msg, 'File too large (max 40MB)', 'error');

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
      //const songs = Storage.getSongs();   //for localStorage
      const songs = window.SHELF_SONGS || [];
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
    area.innerHTML = '<p>You are not logged in. <a href="auth.blade.php">Login or register</a></p>';
    if (logoutBtn) logoutBtn.style.display='none';
    return;
  }
  const users = Storage.getUsers();
  const u = users[session.email];
  if (!u) { area.innerHTML = '<p>User not found.</p>'; return; }
  area.innerHTML = `<p><strong>Name:</strong> ${escapeHtml(u.name)}</p><p><strong>Email:</strong> ${escapeHtml(u.email)}</p><p><strong>Member since:</strong> ${new Date(u.created).toLocaleString()}</p>`;
  if (logoutBtn) logoutBtn.addEventListener('click', ()=> { Storage.clearSession(); location.href = 'index.blade.php'; });
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

  if (path === 'auth.blade.php') initAuth();
  if (path === 'upload.blade.php') initUpload();
  if (path === 'library.blade.php') initLibrary();
  if (path === 'profile.blade.php') initProfile();

  // If cart page loads, check for #cartArea and render there
  const cartArea = document.getElementById('cartArea');
  if (cartArea) renderCartArea(cartArea);
})();
*/