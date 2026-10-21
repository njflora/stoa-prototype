<?php

namespace App\Http\Controllers;

use App\Models\Episode;
use App\Models\EpisodeSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class WatchController extends Controller
{
    /**
     * GET /api/episodes/{id}/play: where to watch it. Someone who may not
     * watch gets `{ locked: true }` and no stream addresses at all.
     */
    public function play(Request $request, string $id): JsonResponse
    {
        $episode = Episode::findOrFail($id);
        if (Gate::forUser($request->user())->denies('watch', $episode)) {
            return response()->json(['locked' => true]);
        }

        return response()->json([
            'locked' => false,
            'sources' => EpisodeSource::where('episode_id', $episode->id)->get()->sortBy(fn ($s) => EpisodeSource::ORDER[$s->platform] ?? 9)->values()->map->toData()->all(),
        ]);
    }
}
