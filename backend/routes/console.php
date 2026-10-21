<?php

use App\Jobs\SyncPlatform;
use App\Sources\SourceAdapter;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Sync every platform's links each hour. In development the sync reads the
// recorded sample feeds, since the live feeds are not connected yet.
foreach (array_keys(SourceAdapter::all()) as $platform) {
    Schedule::job(new SyncPlatform($platform, fixtures: app()->environment('local')))->hourly();
}
