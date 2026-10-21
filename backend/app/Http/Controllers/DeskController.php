<?php

namespace App\Http\Controllers;

use App\Desk\Desk;
use App\Jobs\SyncPlatform;
use App\Sources\SourceAdapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/** The content desk's API. Staff only (the "use-desk" gate). */
class DeskController extends Controller
{
    public function __construct(private Desk $desk) {}

    /** GET /api/desk?filter=&show=&page= */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('use-desk');
        $query = $request->validate([
            'filter' => ['nullable', 'string', 'regex:/^(all|problems|(rumble|odysee|bitchute|vod)-(pending|missing|failed))$/'],
            'show' => ['nullable', 'string', 'exists:shows,id'],
            'page' => ['integer', 'min:0'],
        ]);

        return response()->json([
            ...$this->desk->rows($query['filter'] ?? 'all', (int) ($query['page'] ?? 0), $query['show'] ?? null),
            'summary' => $this->desk->summary(),
            'runs' => $this->desk->runs(),
        ]);
    }

    /**
     * POST /api/desk/sync {platform?}: sync now, rather than waiting for the
     * hourly schedule. Reads the sample feeds in development.
     */
    public function sync(Request $request): JsonResponse
    {
        Gate::authorize('use-desk');
        $platform = $request->validate(['platform' => ['nullable', Rule::in(array_keys(SourceAdapter::all()))]])['platform'] ?? null;
        $fixtures = app()->environment(['local', 'testing']);
        $runs = [];
        foreach ($platform ? [$platform] : array_keys(SourceAdapter::all()) as $p) {
            $runs[] = app()->call([new SyncPlatform($p, $fixtures), 'handle'])->toData();
        }

        return response()->json(['runs' => $runs, 'summary' => $this->desk->summary()]);
    }
}
