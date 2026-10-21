<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sign-in by session cookie for the site's own pages (Sanctum's SPA
        // mode), with CSRF protection on every change.
        $middleware->statefulApi();
        // Every API route counts towards the "api" rate limit (AppServiceProvider).
        $middleware->throttleApi();
        // The API has no login page to send guests to: they get a 401.
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*') ? null : '/sign-in');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
