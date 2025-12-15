<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;


class PlaylistController extends Controller
{
    // Display a listing of the resource
    public function index(Request $request) {

        $query = Playlist::with('user', 'songs');

        // Guests & users see only public playlists + their own
        if (!$request->user() || !$request->user()->isAdmin()) {
            $query->where(function ($q) use ($request) {
                $q->where('is_public', true);
                if ($request->user()) {
                    $q->orWhere('user_id', $request->user()->id);
                }
            });
        }

        $playlists = $query->paginate(20);

        return response()->json($playlists);
    }

    // Store a newly created resource in storage.
    public function store(Request $request) {

        // Only logged-in users can create playlists
        if (!$request->user() || $request->user()->isGuest()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $playlist = Playlist::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_public' => $request->is_public ?? false,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($playlist->load('user', 'songs'), 201);
    }

    // Display the specified resource
    public function show(Request $request, Playlist $playlist) {

        // CHECK access permissions: if NOT public/uploader/admin -> DENY
        if (!$playlist->is_public && (!$request->user() || ($playlist->user_id !== $request->user()->id && !$request->user()->isAdmin()))) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        //                                                          -> SHOW PLAYLIST
        return response()->json($playlist->load('user', 'songs'));
    }

    // Update the specified resource in storage
    public function update(Request $request, string $id) {

        // ONLY owner/admin can update
        if (!$request->user() || ($playlist->user_id !== $request->user()->id && !$request->user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $playlist->update($request->only(['name', 'description', 'is_public']));

        return response()->json($playlist->load('user', 'songs'));
    }

    // Remove the specified resource from storage
    public function destroy(string $id) {

        // ONLY owner/admin can delete
        if (!$request->user() || ($playlist->user_id !== $request->user()->id && !$request->user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $playlist->delete();

        return response()->json(['message' => 'Playlist deleted successfully']);
    }

    // ADD songs to it
    public function addSong(Request $request, Playlist $playlist) {

        // ONLY ownER/admin can add songs
        if (!$request->user() || ($playlist->user_id !== $request->user()->id && !$request->user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'song_id' => 'required|exists:songs,id',
            'order' => 'nullable|integer|min:0',
        ]);

        $order = $request->order ?? $playlist->songs()->count();
        $playlist->songs()->attach($request->song_id, ['order' => $order]);

        return response()->json($playlist->load('songs'));
    }

    // DELETE songs from it
    public function removeSong(Request $request, Playlist $playlist, $songId) {

        // ONLY owner/admin can remove songs
        if (!$request->user() || ($playlist->user_id !== $request->user()->id && !$request->user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $playlist->songs()->detach($songId);

        return response()->json($playlist->load('songs'));
    }

}
