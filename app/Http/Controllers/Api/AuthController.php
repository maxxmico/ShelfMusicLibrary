<?php

namespace App\Http\Controllers\Api;
                                // \AuthController *? NO

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller {
    
    public function register(Request $request){
        
        // VALIDATE the incoming data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // CREATE the user in the database
        
    /*
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),  // Encrypt password!
            'role' => 'user',  // Default role
        ]);
    */
        $user = User::create([
            'name' => $validated['name'],
            'email'=> $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // CREATE auth. token
        $token = $user->createToken('auth_token')->plainTextToken;

        // RETURN user and token data to FRONTEND
        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
            'token' => $token,
        ], 201);

    }

    // for LOGIN
    public function login(Request $request) {

        // VALIDATE input
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // FIND user by email
        $user = User::where('email', $validated['email'])->first();

        // CHECK IF user exists & password (hash) is correct
        if (!$user || !Hash::check($validated['password'], $user->password)) {
         
        /*
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        */
            return response()->json(['message'=>'The provided credentials are incorrect.'], 401);
        }

        // CREATE new token for auth user
        $token = $user->createToken('auth_token')->plainTextToken;

        // RETURN user and token data to FRONTEND
        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    // for LOGOUT
    public function logout(Request $request) {

        // DELETE current token from database
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    // RETURN currently auth user info
    public function user(Request $request) {
        return response()->json($request->user());
    }
    
}
