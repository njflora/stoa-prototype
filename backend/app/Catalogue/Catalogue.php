<?php

namespace App\Catalogue;

use App\Models\Article;
use App\Models\Contributor;
use App\Models\Episode;
use App\Models\LiveEvent;
use App\Models\Series;
use App\Models\Show;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Every question the site asks about the catalogue, answered from the
 * database in the JSON shapes the site reads. The API controllers and the
 * static export (stoa:export) both call these methods, so the two can never
 * drift apart.
 */
class Catalogue
{
    public const PAGE_SIZE = 50;

    public const ARTICLE_PAGE_SIZE = 24;

    /** How far back "popular" looks, in days. Null is all time. */
    public const PERIODS = ['week' => 7, 'month' => 30, 'year' => 365, 'all' => null];

    public const ARTICLE_PERIODS = ['week' => 7, 'month' => 30, 'all' => null];

    /** "Controversial" only counts articles with this many votes and comments between them. */
    public const CONTROVERSIAL_MIN = 100;

    /** The homepage's opening picks: a show, and the kind of episode to take from it. */
    public const FEATURED = [
        ['stoa-podcast', null],
        ['chronos', 'premium'],
        ['conversations', null],
        ['statecraft', 'freemium'],
    ];

    private ?CarbonImmutable $now = null;

    /** Dates as the site reads them: "2026-10-19T12:00:00.000Z". */
    public static function iso(DateTimeInterface $date): string
    {
        return CarbonImmutable::instance($date)->utc()->format('Y-m-d\TH:i:s.v\Z');
    }

    /**
     * "Now", for periods like "this week". The demo catalogue was generated
     * on a fixed day, so it counts back from then. A live site would use now().
     */
    public function now(): CarbonImmutable
    {
        return $this->now ??= CarbonImmutable::parse(DB::table('catalogue_meta')->value('generated_at'), 'UTC');
    }

    /**
     * The time to stamp on something posted now. The site moves every date
     * in the snapshot forward by whole weeks to the present, so a new post
     * is stamped that many weeks earlier, and shows as "just now".
     */
    public function postingTime(): CarbonImmutable
    {
        $weeks = max(0, intdiv((int) $this->now()->diffInDays(CarbonImmutable::today(), absolute: false), 7));

        return CarbonImmutable::now()->subWeeks($weeks);
    }

    // ---------- reference data, loaded once when the site opens ----------

    public function meta(): array
    {
        return [
            'generatedAt' => self::iso($this->now()),
            'pageSize' => self::PAGE_SIZE,
            'total' => Episode::count(),
            'articleCount' => Article::count(),
        ];
    }

    /** Every show, with its counts and an episode anyone can watch. */
    public function shows(): array
    {
        $counts = Episode::query()
            ->select('show_id')
            ->selectRaw('count(*) as total')
            ->selectRaw("sum(case when access != 'premium' then 1 else 0 end) as free")
            ->groupBy('show_id')
            ->get()
            ->keyBy('show_id');

        return Show::orderBy('position')->get()->map(function (Show $show) use ($counts) {
            $total = (int) ($counts[$show->id]->total ?? 0);
            $free = (int) ($counts[$show->id]->free ?? 0);
            $preview = $this->latestOf($show->id, 'freemium') ?? $this->latestOf($show->id);

            return [
                ...$show->toData(),
                'episodeCount' => $total,
                'freeCount' => $free,
                'membersCount' => $total - $free,
                'pageCount' => (int) ceil($total / self::PAGE_SIZE),
                'freePreview' => $preview?->toCard(),
            ];
        })->all();
    }

    /** Every contributor, with the shows they appear on and how much they have made. */
    public function hosts(): array
    {
        $showOrder = Show::pluck('position', 'id');
        $showsByHost = DB::table('contributor_episode')
            ->join('episodes', 'episodes.id', '=', 'contributor_episode.episode_id')
            ->select('contributor_id', 'show_id')
            ->distinct()
            ->get()
            ->groupBy('contributor_id')
            ->map(fn ($rows) => $rows->pluck('show_id')->sortBy(fn ($id) => $showOrder[$id])->values()->all());
        $episodeCounts = DB::table('contributor_episode')->select('contributor_id')->selectRaw('count(*) as total')->groupBy('contributor_id')->pluck('total', 'contributor_id');
        $articleCounts = Article::select('author_id')->selectRaw('count(*) as total')->groupBy('author_id')->pluck('total', 'author_id');

        return Contributor::orderBy('position')->get()->map(fn (Contributor $host) => [
            'id' => $host->id,
            'name' => $host->name,
            'role' => $host->role,
            'bio' => $host->bio,
            'showIds' => $showsByHost[$host->id] ?? [],
            'episodeCount' => (int) ($episodeCounts[$host->id] ?? 0),
            'articleCount' => (int) ($articleCounts[$host->id] ?? 0),
        ])->all();
    }

    /** Every series, newest first, with its parts in order. */
    public function series(): array
    {
        return Series::orderBy('position')
            ->with(['episodes' => fn ($q) => $q->with(Episode::CARD_RELATIONS)])
            ->get()
            ->map(fn (Series $s) => [
                'name' => $s->name,
                'showId' => $s->show_id,
                'episodes' => $s->episodes->map->toCard()->all(),
                'slug' => $s->slug,
                'description' => $s->description,
                'totalMin' => (int) $s->episodes->sum('duration_min'),
            ])->all();
    }

    public function live(): ?array
    {
        return LiveEvent::first()?->toData();
    }

    /** Everything above in one response, for the site to load before it opens. */
    public function reference(): array
    {
        return [
            'meta' => $this->meta(),
            'shows' => $this->shows(),
            'hosts' => $this->hosts(),
            'series' => $this->series(),
            'live' => $this->live(),
        ];
    }

    // ---------- pages ----------

    /** Everything the homepage shows first, in one response. */
    public function home(): array
    {
        $shows = Show::orderBy('position')->get();

        return [
            'featured' => array_values(array_filter(array_map(
                fn (array $pick) => $this->latestOf(...$pick)?->toCard(),
                self::FEATURED,
            ))),
            // A way into each show: the newest episode of a free show, or a
            // members' show's newest free preview (or its first episode).
            'startHere' => $shows->map(fn (Show $show) => [
                'showId' => $show->id,
                'episode' => ($show->access === 'free'
                    ? $this->latestOf($show->id)
                    : ($this->latestOf($show->id, 'freemium') ?? $this->firstOf($show->id)))?->toCard(),
            ])->all(),
            'latest' => $this->cards(Episode::query()->newest()->limit(60)),
            'rows' => $shows->mapWithKeys(fn (Show $show) => [
                $show->id => $this->cards(Episode::where('show_id', $show->id)->newest()->limit(20)),
            ])->all(),
            'seriesSlugs' => Series::orderBy('position')->limit(12)->pluck('slug')->all(),
            'articles' => Article::orderByDesc('published_at')->limit(12)->get()->map->toCard()->all(),
        ];
    }

    /** The most-watched episodes of the last seven days, across every show. */
    public function trending(): array
    {
        return [
            'items' => $this->cards(
                Episode::where('published_at', '>=', $this->now()->subDays(7))
                    ->orderByDesc('views')->orderByDesc('published_at')
                    ->limit(20),
            ),
        ];
    }

    /**
     * A page of episodes, 50 at a time: one show's or one contributor's,
     * or both. "Popular" is the 50 most-watched within the period, on one page.
     *
     * @param  'all'|'free'|'members'  $access
     * @param  'newest'|'oldest'|'popular'  $sort
     */
    public function episodes(
        ?string $showId = null,
        int $page = 0,
        string $access = 'all',
        ?string $hostId = null,
        string $sort = 'newest',
        string $period = 'month',
    ): array {
        $query = Episode::query()
            ->when($showId, fn (Builder $q) => $q->where('show_id', $showId))
            ->when($access === 'free', fn (Builder $q) => $q->free())
            ->when($access === 'members', fn (Builder $q) => $q->members())
            ->when($hostId, fn (Builder $q) => $q->withHost($hostId));

        if ($sort === 'popular') {
            $days = self::PERIODS[$period];
            $items = $this->cards($query
                ->when($days, fn (Builder $q) => $q->where('published_at', '>=', $this->now()->subDays($days)))
                ->orderByDesc('views')->orderByDesc('published_at')
                ->limit(self::PAGE_SIZE));

            return ['page' => 0, 'pageCount' => 1, 'total' => count($items), 'items' => $items];
        }

        $total = $query->count();
        $sort === 'oldest' ? $query->orderBy('published_at')->orderBy('seq')->orderByDesc('id') : $query->newest();

        return [
            'page' => $page,
            'pageCount' => max(1, (int) ceil($total / self::PAGE_SIZE)),
            'total' => $total,
            'items' => $this->cards($query->offset($page * self::PAGE_SIZE)->limit(self::PAGE_SIZE)),
        ];
    }

    public function episode(string $id): ?array
    {
        return Episode::with(Episode::CARD_RELATIONS)->find($id)?->toCard();
    }

    /**
     * A page of articles, 24 at a time, for everything, one category or one
     * author. "Controversial" counts only pieces with enough engagement.
     *
     * @param  'newest'|'popular'|'controversial'  $sort
     */
    public function articles(
        int $page = 0,
        ?string $category = null,
        ?string $authorId = null,
        string $sort = 'newest',
        string $period = 'month',
    ): array {
        $query = Article::query()
            ->when($category, fn (Builder $q) => $q->where('category', $category))
            ->when($authorId, fn (Builder $q) => $q->where('author_id', $authorId));

        match ($sort) {
            'popular' => $query
                ->when(self::ARTICLE_PERIODS[$period], fn (Builder $q, int $days) => $q->where('published_at', '>=', $this->now()->subDays($days)))
                ->orderByDesc('views'),
            'controversial' => $query
                ->whereRaw('likes + dislikes + comments_count >= ?', [self::CONTROVERSIAL_MIN])
                ->orderByDesc('controversy'),
            default => null,
        };
        $query->orderByDesc('published_at');

        $total = $query->count();

        return [
            'page' => $page,
            'pageCount' => max(1, (int) ceil($total / self::ARTICLE_PAGE_SIZE)),
            'total' => $total,
            'items' => $query->offset($page * self::ARTICLE_PAGE_SIZE)->limit(self::ARTICLE_PAGE_SIZE)->get()->map->toCard()->all(),
        ];
    }

    public function article(string $id): ?array
    {
        return Article::find($id)?->toDetail();
    }

    /**
     * What search needs for each episode and article, with short keys to keep
     * it small. i: id, t: title (empty for daily editions), s: show (or an
     * article's category), h: hosts (or author), x: extra text (topics, series,
     * or a standfirst), d: date, a: access, e: daily edition, sl: series slug,
     * k: "a" for an article. The Laravel version searches with Meilisearch
     * instead (App\Search\SiteSearch); the static preview searches these.
     */
    public function searchDocs(): array
    {
        $episodes = Episode::query()->with(Episode::CARD_RELATIONS)->newest()->get()->map(fn (Episode $e) => [
            'i' => $e->id,
            't' => $e->title ?? '',
            's' => $e->show_id,
            'h' => $e->contributors->pluck('id')->all(),
            'x' => trim(implode(' ', [...($e->topics ?? []), $e->series?->name ?? ''])),
            'd' => self::iso($e->published_at),
            'a' => $e->access,
            ...($e->edition ? ['e' => 1] : []),
            ...($e->series_slug ? ['sl' => $e->series_slug] : []),
        ]);
        $articles = Article::orderByDesc('published_at')->get()->map(fn (Article $a) => [
            'i' => $a->id,
            't' => $a->title,
            's' => $a->category,
            'h' => [$a->author_id],
            'x' => $a->standfirst,
            'd' => self::iso($a->published_at),
            'a' => 'free',
            'k' => 'a',
        ]);

        return [...$episodes, ...$articles];
    }

    // ---------- helpers ----------

    /** The newest episode of a show, optionally of one kind of access. */
    private function latestOf(string $showId, ?string $access = null): ?Episode
    {
        return Episode::with(Episode::CARD_RELATIONS)
            ->where('show_id', $showId)
            ->when($access, fn (Builder $q) => $q->where('access', $access))
            ->newest()
            ->first();
    }

    private function firstOf(string $showId): ?Episode
    {
        return Episode::with(Episode::CARD_RELATIONS)->where('show_id', $showId)->orderBy('seq')->first();
    }

    /** Runs a query and turns each episode into its card. */
    private function cards(Builder $query): array
    {
        return $query->with(Episode::CARD_RELATIONS)->get()->map->toCard()->all();
    }
}
