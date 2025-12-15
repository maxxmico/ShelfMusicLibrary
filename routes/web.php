<?php

use Illuminate\Support\Facades\Route;
use App\Models\Song;


// Nav. though the pages (blade.php files) 


/*
    Route::get('/', function () {
        return view('index');
    })->name('index');

*/
    Route::get('/', function () {
        $featured = Song::latest()->take(10)->get();
        return view('index', compact('featured'));
    })->name('index');


    
    Route::get('/auth', function () {
        return view('auth');
    })->name('auth');

    Route::get('/cart', function () {
        return view('cart');
    })->name('cart');

    Route::get('/contact', function () {
        return view('contact');
    })->name('contact');

    Route::get('/library', function () {
        return view('library');
    })->name('library');

    Route::get('/profile', function () {
        return view('profile');
    })->name('profile');

    Route::get('/upload', function () {
        return view('upload');
    })->name('upload');

//-----------------------------------------------------

    Route::get('/admin', function () {
        return view('admin');
    });


/*
Route::get('/about', function () {
    return view('about'); 
})->name('about');
*/

/*

// By default, the route middleware that are assigned to each route will not be displayed in the route:list output; 
// however, you can instruct Laravel to display the route middleware and middleware group names by adding the -v option to the command:
// php artisan route:list -v (or -vv; Expand middleware groups)

// User type 1 (Public routes; read-only)
Route::get('/library', [AlbumController::class, 'index'])->name('library');
Route::get('/albums/{album}', [AlbumController::class, 'show'])->name('albums.show');

// User type 2 (Log-in: can upload, and edit own)
Route::middleware(['auth'])->group(function () {
    Route::get('/upload', [AlbumController::class, 'create'])->name('upload');
    Route::post('/albums', [AlbumController::class, 'store'])->name('albums.store');
    Route::get('/albums/{album}/edit', [AlbumController::class, 'edit'])->name('albums.edit');
    Route::put('/albums/{album}', [AlbumController::class, 'update'])->name('albums.update');
    Route::delete('/albums/{album}', [AlbumController::class, 'destroy'])->name('albums.destroy');

// Wishlist
Route::post('/wishlist/{album}', [AlbumController::class, 'addToWishlist'])->name('wishlist.add');
});

// User type 3 (ADMIN: manage all)
Route::middleware(['admin'])->group(function () {
    Route::get('/admin/albums', [AlbumController::class, 'adminIndex'])->name('admin.albums');
});

//-----------------------------------------------------

*/