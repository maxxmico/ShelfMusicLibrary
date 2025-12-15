<?php

// after: PS C:\Users\mling\Desktop\WET\test> php artisan db:seed

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Song;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    
    // Seed the application's database
    public function run(): void {

        // User::factory(10)->create();

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@musiclibrary.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Create regular user
        $user = User::firstOrCreate(
            ['email' => 'user@musiclibrary.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );


        // Create some sample songs
        $songs = [
            [
                'title' => 'The Night We Called It a Day',
                'artist' => 'Frank Sinatra',
                'album' => 'Where Are You?',
                'genre' => 'Jazz',
                'duration' => 201,
                'year' => 1957,
                'cover_image' => 'covers/franksinatra.png',
                'audio_file' => 'audio/FrankSinatra-TheNightWeCalledItADay.mp3',
            ],
            [
                'title' => 'Breathe (In the Air)',
                'artist' => 'Pink Floyd',
                'album' => 'The Dark Side of the Moon',
                'genre' => 'Rock',
                'duration' => 163,
                'year' => 1973,
                'cover_image' => 'covers/pinkfloyd.png',
                'audio_file' => 'audio/PinkFloyd-Breathe(InTheAir).mp3',
            ],
            [
                'title' => 'Where Are You?',
                'artist' => 'Frank Sinatra',
                'album' => 'Where Are You?',
                'genre' => 'Jazz',
                'duration' => 195,
                'year' => 1957,
                'cover_image' => 'covers/franksinatra.png',
                'audio_file' => 'audio/FrankSinatra-WhereAreYou.mp3',
            ],
            [
                'title' => 'Bohemian Rhapsody',
                'artist' => 'Queen',
                'album' => 'A Night at the Opera',
                'genre' => 'Rock',
                'duration' => 354,
                'year' => 1975,
                'cover_image' => 'covers/anightattheopera.jpg',
                'audio_file' => 'audio/Queen–BohemianRhapsody.mp3',
            ],
            [
                'title' => 'Speak To Me',
                'artist' => 'Pink Floyd',
                'album' => 'The Dark Side of the Moon',
                'genre' => 'Rock',
                'duration' => 71,
                'year' => 1973,
                'cover_image' => 'covers/pinkfloyd.png',
                'audio_file' => 'audio/PinkFloyd-SpeakToMe.mp3',
            ],
            [
                'title' => 'Imagine',
                'artist' => 'John Lennon',
                'album' => 'Imagine',
                'genre' => 'Pop',
                'duration' => 183,
                'year' => 1971,
                'cover_image' => 'covers/imagineJohnLennon.jpg',
                'audio_file' => 'audio/JohnLennon-Imagine.mp3',
            ],
            [
                'title' => 'Hotel California',
                'artist' => 'Eagles',
                'album' => 'Hotel California',
                'genre' => 'Rock',
                'duration' => 391,
                'year' => 1976,
                'cover_image' => 'covers/hotelcalifornia.jpg',
                'audio_file' => 'audio/Eagles-HotelCalifornia.mp3',
            ],
            [
                'title' => 'Stairway to Heaven',
                'artist' => 'Led Zeppelin',
                'album' => 'Led Zeppelin IV',
                'genre' => 'Rock',
                'duration' => 482,
                'year' => 1971,
            ],
            [
                'title' => 'Billie Jean',
                'artist' => 'Michael Jackson',
                'album' => 'Thriller',
                'genre' => 'Pop',
                'duration' => 294,
                'year' => 1982,
                'cover_image' => 'covers/MichaelJackson.png',
                'audio_file' => 'audio/MichaelJackson-BillieJean.mp3',
            ],
            [
                'title' => 'Smells Like Teen Spirit',
                'artist' => 'Nirvana',
                'album' => 'Nevermind',
                'genre' => 'Rock',
                'duration' => 301,
                'year' => 1991,
            ],
        ];

        foreach ($songs as $songData) {
            Song::firstOrCreate(
                ['title' => $songData['title']],
                array_merge($songData, ['uploaded_by' => $admin->id])
            );
        }
        
/*
        Song::firstOrCreate(

            ['title' => 'The Night We Called It a Day'],
            [
                'artist' => 'Frank Sinatra',
                'album' => 'Where Are You?',
                'genre' => 'Jazz',
                'duration' => 201,
                'year' => 1957,
                'cover_image' => 'covers/franksinatra.png',
                'uploaded_by' => $admin->id,
            ]
        );

        Song::firstOrCreate(
            ['title' => 'Where Are You?'],
            [
                'artist' => 'Frank Sinatra',
                'album' => 'Where Are You?',
                'genre' => 'Jazz',
                'duration' => 195,
                'year' => 1957,
                'cover_image' => 'covers/franksinatra.png',
                'uploaded_by' => $admin->id,
            ]
        );
        
        Song::firstOrCreate(
            ['title' => 'Breathe (In the Air)'],
            [
                'artist' => 'Pink Floyd',
                'album' => 'The Dark Side of the Moon',
                'genre' => 'Rock',
                'duration' => 163,
                'year' => 1973,
                'cover_image' => 'covers/pinkfloyd.png',
                'uploaded_by' => $admin->id,
            ]
        );

        Song::firstOrCreate(
            ['title' => 'Speak To Me'],
            [
                'artist' => 'Pink Floyd',
                'album' => 'The Dark Side of the Moon',
                'genre' => 'Rock',
                'duration' => 71,
                'year' => 1973,
                'cover_image' => 'covers/pinkfloyd.png',
                'uploaded_by' => $admin->id,
            ]
        );
*/


    }
}

