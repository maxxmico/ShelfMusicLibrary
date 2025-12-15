<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Song;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SongController extends Controller
{
    // Display a listing of the resource.
    public function index(Request $request)
    {
        $query = Song::with('uploader');

        // Filtering
        if ($request->has('genre')) {
            $query->where('genre', $request->genre);
        }

        if ($request->has('artist')) {
            $query->where('artist', 'like', '%' . $request->artist . '%');
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('artist', 'like', '%' . $search . '%')
                  ->orWhere('album', 'like', '%' . $search . '%');
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $songs = $query->paginate(20);

        return response()->json($songs);
    }

    // Store a newly created resource in storage
    public function store(Request $request)
    {
        // Users & admins can add songs
        if (!$request->user() || $request->user()->isGuest()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // DEBUG (remove later)
        Log::info('STORE payload (except files):', $request->except(['audio_file', 'cover_image']));
        Log::info('STORE has title/artist:', [
            'title' => $request->input('title'),
            'artist' => $request->input('artist'),
        ]);

        $request->validate([
            'title' => 'required|string|min:2|max:255',
            'artist' => 'required|string|min:2|max:255',
            'album' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:100',
            'duration' => 'nullable|integer|min:1',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'cover_image' => 'nullable|image|max:2048',
            'audio_file' => 'required|file|mimes:mp3,wav,ogg|max:10240',
        ]);

        $data = $request->only([
            'title',
            'artist',
            'album',
            'genre',
            'year',
            'duration',
        ]);

        $data['uploaded_by'] = $request->user()->id;
        $data['duration'] = $request->input('duration', 180);

        // Handle file uploads
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }

        if ($request->hasFile('audio_file')) {
            $data['audio_file'] = $request->file('audio_file')->store('audio', 'public');
        }

        $song = Song::create($data);

        return response()->json($song->load('uploader'), 201);
    }

    // Display the specified resource.
    public function show(Song $song)
    {
        return response()->json($song->load('uploader'));
    }

    // Update the specified resource in storage
    public function update(Request $request, Song $song)
    {
        // ONLY admins/uploader that uploaded can update
        if (
            !$request->user()
            || (!$request->user()->isAdmin() && $song->uploaded_by !== $request->user()->id)
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|min:2|max:255',
            'artist' => 'sometimes|required|string|min:2|max:255',
            'album' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:100',
            'duration' => 'nullable|integer|min:1',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'cover_image' => 'nullable|image|max:2048',
        ]);

        $data = $request->except(['audio_file', 'uploaded_by']);

        if ($request->hasFile('cover_image')) {
            if ($song->cover_image) {
                Storage::disk('public')->delete($song->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }

        $song->update($data);

        return response()->json($song->load('uploader'));
    }

    public function destroy(Request $request, Song $song)
    {
        // allow: uploader OR admin
        if ($request->user()->role !== 'admin' && $request->user()->id !== $song->uploaded_by) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // delete cover file
        if ($song->cover_image && Storage::disk('public')->exists($song->cover_image)) {
            Storage::disk('public')->delete($song->cover_image);
        }

        // delete audio file
        if ($song->audio_file && Storage::disk('public')->exists($song->audio_file)) {
            Storage::disk('public')->delete($song->audio_file);
        }

        // delete DB record
        $song->delete();

        return response()->json(['message' => 'Song deleted successfully']);
    }
}

