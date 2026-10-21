<?php

namespace App\Providers;

use App\Discussion\Thread;
use App\Models\User;
use App\Policies\ThreadPolicy;
use Illuminate\Support\Facades\Gate;
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
    }
}
