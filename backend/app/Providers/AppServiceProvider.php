<?php

namespace App\Providers;

use App\Discussion\Thread;
use App\Models\User;
use App\Policies\ThreadPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Threads are not database models, so their policy is named here.
        // EpisodePolicy is found by its name.
        Gate::policy(Thread::class, ThreadPolicy::class);

        // The content desk is for staff.
        Gate::define('use-desk', fn (User $user) => $user->is_staff);

        // Rate limits, counted per account, or per address for guests.
        // Over the limit, the API answers 429 Too Many Requests.
        $who = fn (Request $request) => $request->user()?->id ?: $request->ip();
        // Every API request: generous, so browsing never meets it.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(300)->by($who($request)));
        // Search asks Meilisearch each time, so it has its own limit.
        RateLimiter::for('search', fn (Request $request) => Limit::perMinute(60)->by($who($request)));
        // Changes (comments, votes, topics, purchases): enough for a person, too few for a script.
        RateLimiter::for('writes', fn (Request $request) => Limit::perMinute(20)->by($who($request)));
    }
}
