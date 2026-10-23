<?php

namespace App\Search;

use App\Catalogue\Catalogue;
use App\Models\Article;
use App\Models\Contributor;
use App\Models\Episode;
use App\Models\Series;
use App\Models\Show;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * Search across episodes, series, shows, contributors and articles, with
 * Laravel Scout and Meilisearch. The answer has the same shape as the
 * site's in-browser search (src/api/search.ts), so the search panel works
 * the same either way. Meilisearch forgives typos and matches the start of
 * words; every word must match, as in the browser.
 */
class SiteSearch
{
    /** Each kind, its model, and how many results to return. */
    private const KINDS = [
        'episode' => [Episode::class, 50],
        'series' => [Series::class, 10],
        'show' => [Show::class, 10],
        'host' => [Contributor::class, 10],
        'article' => [Article::class, 20],
    ];

    public function search(string $query): array
    {
        $groups = [];
        $counts = [];
        $total = 0;
        $took = 0;
        foreach (self::KINDS as $kind => [$model, $limit]) {
            if (config('scout.driver') === 'meilisearch') {
                $raw = $model::search($query, fn ($index, string $q, array $options) => $index->search($q, [
                    ...$options,
                    'limit' => $limit,
                    'matchingStrategy' => 'all',
                    'showMatchesPosition' => true,
                ]))->raw();
                $hits = $raw['hits'];
                $counts[$kind] = $raw['estimatedTotalHits'] ?? count($hits);
                $took += $raw['processingTimeMs'] ?? 0;
            } else {
                // Tests use Scout's simple in-memory driver, which has no raw answer.
                $hits = $model::search($query)->take($limit)->get()->map(fn (Model $m) => $m->toSearchableArray())->all();
                $counts[$kind] = count($hits);
            }
            $groups[$kind] = array_map(fn (array $hit) => $this->hit($kind, $hit), $hits);
            $total += $counts[$kind];
        }

        // Each group returns its best matches; counts say how many matched in all.
        return ['query' => $query, 'total' => $total, 'tookMs' => $took, 'groups' => $groups, 'counts' => $counts];
    }

    /**
     * One result, in the shape the search panel reads.
     *
     * @param  key-of<self::KINDS>  $kind
     */
    private function hit(string $kind, array $doc): array
    {
        $id = (string) ($doc['id'] ?? $doc['slug']);

        return array_filter([
            'kind' => $kind,
            'id' => $id,
            'title' => $doc['title'],
            'to' => match ($kind) {
                // The series comes from the episode's record, not guessed from its text (review note 10).
                'episode' => $doc['seriesSlug'] ? "/watch/{$id}?series={$doc['seriesSlug']}" : "/watch/{$id}",
                'series' => "/series/{$id}",
                'show' => "/shows/{$id}",
                'host' => "/contributors/{$id}",
                'article' => "/articles/{$id}",
            },
            'showId' => $doc['showId'] ?? null,
            'publishedAt' => isset($doc['published_ts']) ? Catalogue::iso(CarbonImmutable::createFromTimestampUTC($doc['published_ts'])) : null,
            'access' => $doc['access'] ?? null,
            'edition' => ($doc['edition'] ?? false) ?: null,
            'seriesName' => $doc['seriesName'] ?? ($kind === 'series' ? $doc['title'] : null),
            'hostIds' => $doc['hostIds'] ?? null,
            'category' => $doc['category'] ?? null,
            'terms' => $this->terms($doc),
        ], fn ($value) => $value !== null);
    }

    /** The words that matched in the title, for highlighting. */
    private function terms(array $doc): array
    {
        $title = $doc['title'];
        $terms = [];
        foreach ($doc['_matchesPosition']['title'] ?? [] as $match) {
            $terms[] = mb_strtolower(substr($title, $match['start'], $match['length']));
        }

        return array_values(array_unique($terms));
    }
}
