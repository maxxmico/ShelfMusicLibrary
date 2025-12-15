<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    public function show($id): View
    {
        $user = User::findOrFail($id);
        $subtitle = "- User: {$user->name}";
        $posts = $user->posts;
        return view('posts.index', ['posts' => $posts, 'subtitle' => $subtitle]);
    }
}
