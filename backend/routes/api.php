<?php

use App\Http\Controllers\CatalogueController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// The catalogue: read only, open to everyone. Members-only detail (comment
// threads, reading lists) arrives with access control in stage D.
Route::controller(CatalogueController::class)->group(function () {
    Route::get('/reference', 'reference');
    Route::get('/home', 'home');
    Route::get('/trending', 'trending');
    Route::get('/episodes', 'episodes');
    Route::get('/episodes/{id}', 'episode');
    Route::get('/articles', 'articles');
    Route::get('/articles/{id}', 'article');
    Route::get('/search-docs', 'searchDocs');
});
