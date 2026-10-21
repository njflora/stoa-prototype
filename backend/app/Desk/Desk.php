<?php

namespace App\Desk;

use App\Catalogue\Catalogue;
use App\Models\Episode;
use App\Models\EpisodeSource;
use App\Models\IngestRun;
use Illuminate\Database\Eloquent\Builder;

/**
 * The content desk: every episode with the state of its link on each
 * platform, for staff. The API and the static export both read from here.
 */
class Desk
{
    public const PAGE_SIZE = 50;

    public const PLATFORMS = ['rumble', 'odysee', 'bitchute', 'vod'];

    /** Anything not linked needs a look. */
    public const PROBLEMS = ['pending', 'missing', 'failed'];

    /**
     * A page of episodes, newest first. `filter` is "all", "problems" (any
     * link not linked), or "{platform}-{status}", such as "bitchute-missing".
     */
    public function rows(string $filter = 'all', int $page = 0, ?string $showId = null): array
    {
        $query = Episode::query()
            ->when($showId, fn (Builder $q) => $q->where('show_id', $showId))
            ->when($filter === 'problems', fn (Builder $q) => $q->whereHas('sources', fn (Builder $s) => $s->whereIn('status', self::PROBLEMS)))
            ->when(str_contains($filter, '-'), function (Builder $q) use ($filter) {
                [$platform, $status] = explode('-', $filter, 2);
                $q->whereHas('sources', fn (Builder $s) => $s->where(['platform' => $platform, 'status' => $status]));
            });
        $total = $query->count();
        $episodes = $query->newest()->offset($page * self::PAGE_SIZE)->limit(self::PAGE_SIZE)->with('sources')->get();

        return [
            'page' => $page,
            'pageCount' => max(1, (int) ceil($total / self::PAGE_SIZE)),
            'total' => $total,
            'items' => $episodes->map(fn (Episode $e) => [
                'id' => $e->id,
                'showId' => $e->show_id,
                'title' => $e->title,
                'edition' => $e->edition ?: null,
                'publishedAt' => Catalogue::iso($e->published_at),
                'access' => $e->access,
                'sources' => $e->sources->sortBy(fn (EpisodeSource $s) => EpisodeSource::ORDER[$s->platform] ?? 9)->values()->map->toData()->all(),
            ])->all(),
        ];
    }

    /** How many links each platform has in each state. */
    public function summary(): array
    {
        $counts = EpisodeSource::selectRaw('platform, status, count(*) as total')->groupBy('platform', 'status')->get();
        $summary = [];
        foreach (self::PLATFORMS as $platform) {
            foreach (['linked', ...self::PROBLEMS] as $status) {
                $summary[$platform][$status] = (int) ($counts->first(fn ($c) => $c->platform === $platform && $c->status === $status)?->total ?? 0);
            }
        }

        return $summary;
    }

    /** The latest syncs, newest first. */
    public function runs(int $limit = 12): array
    {
        return IngestRun::orderByDesc('id')->limit($limit)->get()->map->toData()->all();
    }

    /** Every filter worth a stored page in the static preview: all, problems, and each platform's problems that occur. */
    public function filters(): array
    {
        $filters = ['all', 'problems'];
        foreach ($this->summary() as $platform => $states) {
            foreach (self::PROBLEMS as $status) {
                if ($states[$status] > 0) {
                    $filters[] = "{$platform}-{$status}";
                }
            }
        }

        return $filters;
    }
}
