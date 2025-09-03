<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-csv', [App\Http\Controllers\TestController::class, 'csvTest']);

// Note: All API routes including authentication are in routes/api.php
// This is the correct setup for separate frontend (React) and backend (Laravel) servers
