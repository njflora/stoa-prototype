<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\CatalogueController;
use App\Http\Controllers\DeskController;
use App\Http\Controllers\DiscussionController;
use App\Http\Controllers\WatchController;
use Illuminate\Support\Facades\Route;

// The catalogue: read only, open to everyone.
Route::controller(CatalogueController::class)->group(function () {
    Route::get('/reference', 'reference');
    Route::get('/home', 'home');
    Route::get('/trending', 'trending');
    Route::get('/episodes', 'episodes');
    Route::get('/episodes/{id}', 'episode');
    Route::get('/articles', 'articles');
    Route::get('/articles/{id}', 'article');
    Route::get('/search', 'search');
    // What the static preview's in-browser search indexes.
    Route::get('/search-docs', 'searchDocs');
});

// Reading is open to everyone, and each answer depends on who is asking:
// members' threads, reading lists and streams come back locked, with a
// count at most, for anyone who may not see them.
Route::get('/me', [AccountController::class, 'me']);
Route::post('/logout', [AccountController::class, 'logout']);
Route::get('/episodes/{id}/play', [WatchController::class, 'play']);
Route::controller(DiscussionController::class)->group(function () {
    Route::get('/threads/{type}/{id}', 'show');
    Route::get('/reading-lists/{type}/{id}', 'readingList');
    Route::get('/forums/{community}/{forum}/topics', 'topics');
});

// Changes need a signed-in account.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/threads/{type}/{id}/comments', [DiscussionController::class, 'store']);
    Route::post('/comments/{comment}/vote', [DiscussionController::class, 'vote']);
    Route::post('/forums/{community}/{forum}/topics', [DiscussionController::class, 'startTopic']);
    Route::post('/purchases', [AccountController::class, 'purchase']);
    Route::post('/communities/{community}', [AccountController::class, 'join']);
    Route::delete('/communities/{community}', [AccountController::class, 'leave']);

    // The content desk, for staff.
    Route::get('/desk', [DeskController::class, 'index']);
    Route::post('/desk/sync', [DeskController::class, 'sync']);
});

// The demo panel's "Viewing as": signs in as a seeded account with no
// password. Development and tests only: it does not exist in production.
if (app()->environment(['local', 'testing'])) {
    Route::post('/demo/login', [AccountController::class, 'demoLogin']);
}
