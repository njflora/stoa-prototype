<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security headers on every response. The browser enforces them:
 *
 * - nosniff: a file is only ever treated as the type the server says.
 * - Referrer-Policy: other sites see only our domain, never the full address.
 * - Permissions-Policy: no camera, microphone or location, even if a script asks.
 * - Frames: no other site may show these pages inside its own.
 * - Over HTTPS, HSTS tells the browser to use HTTPS for a year.
 *
 * The API answers only JSON, so its Content Security Policy allows nothing
 * to load or run from it at all. The site's own policy is in index.html.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $headers = $response->headers;

        $headers->set('X-Content-Type-Options', 'nosniff');
        $headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $headers->set('X-Frame-Options', 'DENY');

        if ($request->is('api/*')) {
            $headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
        }
        if ($request->secure()) {
            $headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
