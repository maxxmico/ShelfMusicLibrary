<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Song extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'artist',
        'album',
        'genre',
        'duration',      //  allow mass assignment
        'year',
        'cover_image',
        'audio_file',
        'uploaded_by',
    ];

    protected $casts = [
        'duration' => 'integer',  //  keep type clean
        'year' => 'integer',
    ];

    // Relationships
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function playlists()
    {
        return $this->belongsToMany(Playlist::class)->withPivot('order')->withTimestamps();
    }
}
