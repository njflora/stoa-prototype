<?php

namespace App\Console\Commands;

use App\Catalogue\Catalogue;
use App\Models\Article;
use App\Models\Contributor;
use App\Models\Show;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Writes the static preview: every answer the API can give, as JSON files in
 * the site's public/data, so the site runs on GitHub Pages with no server.
 * Each file comes from the same Catalogue method as the matching endpoint.
 * The preview is a snapshot, and it cannot enforce access: anyone can read
 * every file. The live site uses the API.
 */
#[Signature('stoa:export {--to= : The folder to write to (default: STOA_EXPORT_PATH)}')]
#[Description('Write the static preview of the API to the site\'s public/data folder')]
class ExportStatic extends Command
{
    private string $out;

    private int $written = 0;

    public function handle(Catalogue $catalogue): int
    {
        $this->out = rtrim($this->option('to') ?: config('stoa.export_path'), '/');
        File::ensureDirectoryExists($this->out);
        File::cleanDirectory($this->out);

        // Reference data, loaded once when the site opens.
        $reference = $catalogue->reference();
        foreach (['meta', 'shows', 'hosts', 'series', 'live'] as $name) {
            $this->write("{$name}.json", $reference[$name]);
        }
        $this->write('home.json', $catalogue->home());
        $this->write('trending.json', $catalogue->trending());

        // Each show's episodes, for every filter its page offers: access
        // ("free" and "members" only where a show has both) and contributor
        // (only where a show has more than one).
        foreach (Show::orderBy('position')->get() as $show) {
            $hasBoth = $show->episodes()->free()->exists() && $show->episodes()->members()->exists();
            $hostIds = DB::table('contributor_episode')
                ->join('episodes', 'episodes.id', '=', 'contributor_episode.episode_id')
                ->where('show_id', $show->id)
                ->distinct()
                ->pluck('contributor_id');
            foreach ($hasBoth ? ['all', 'free', 'members'] : ['all'] as $access) {
                $base = $access === 'all' ? "episodes/{$show->id}" : "episodes/{$show->id}/{$access}";
                $this->episodeFolder($catalogue, $base, $show->id, $access);
                if ($hostIds->count() < 2) {
                    continue;
                }
                foreach ($hostIds as $hostId) {
                    $this->episodeFolder($catalogue, "{$base}/host-{$hostId}", $show->id, $access, $hostId);
                }
            }
        }

        // Each contributor's episodes across every show, for their profile page.
        foreach (Contributor::pluck('id') as $hostId) {
            $this->pages("episodes/by-host/{$hostId}", fn (int $page) => $catalogue->episodes(page: $page, hostId: $hostId));
        }

        // Articles: newest, popular in each period and controversial, for all
        // articles and each category; newest only for each author.
        $this->articleSorts($catalogue, 'all');
        foreach (Article::distinct()->pluck('category') as $category) {
            $this->articleSorts($catalogue, strtolower($category), $category);
        }
        foreach (Article::distinct()->pluck('author_id') as $authorId) {
            $this->pages("articles/pages/author-{$authorId}", fn (int $page) => $catalogue->articles($page, authorId: $authorId));
        }
        foreach (Article::pluck('id') as $id) {
            $this->write("articles/{$id}.json", $catalogue->article($id));
        }

        $this->write('search-docs.json', $catalogue->searchDocs());

        $this->info("Wrote {$this->written} files to {$this->out}");

        return self::SUCCESS;
    }

    /** Newest-first pages, and the popular list for each period. */
    private function episodeFolder(Catalogue $catalogue, string $folder, string $showId, string $access, ?string $hostId = null): void
    {
        $this->pages($folder, fn (int $page) => $catalogue->episodes($showId, $page, $access, $hostId));
        foreach (array_keys(Catalogue::PERIODS) as $period) {
            $this->write("{$folder}/popular/{$period}.json", $catalogue->episodes($showId, 0, $access, $hostId, 'popular', $period));
        }
    }

    private function articleSorts(Catalogue $catalogue, string $folder, ?string $category = null): void
    {
        $base = "articles/pages/{$folder}";
        $this->pages($base, fn (int $page) => $catalogue->articles($page, $category));
        foreach (array_keys(Catalogue::ARTICLE_PERIODS) as $period) {
            $this->pages("{$base}/popular-{$period}", fn (int $page) => $catalogue->articles($page, $category, sort: 'popular', period: $period));
        }
        $this->pages("{$base}/controversial", fn (int $page) => $catalogue->articles($page, $category, sort: 'controversial'));
    }

    /** Writes page 0, then the rest of the pages it says there are. */
    private function pages(string $folder, callable $pageOf): void
    {
        $first = $pageOf(0);
        $this->write("{$folder}/0.json", $first);
        for ($page = 1; $page < $first['pageCount']; $page++) {
            $this->write("{$folder}/{$page}.json", $pageOf($page));
        }
    }

    private function write(string $path, mixed $data): void
    {
        $file = "{$this->out}/{$path}";
        File::ensureDirectoryExists(dirname($file));
        File::put($file, json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        $this->written++;
    }
}
