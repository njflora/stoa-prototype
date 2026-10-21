<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Contributor;
use App\Models\Episode;
use App\Models\Series;
use App\Models\Show;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('stoa:index')]
#[Description('Rebuild the search index from the database (Meilisearch)')]
class IndexSearch extends Command
{
    public function handle(): int
    {
        // The settings first (fields, ranking), then every record, a chunk at a time.
        $this->call('scout:sync-index-settings');
        foreach ([Episode::class, Article::class, Series::class, Show::class, Contributor::class] as $model) {
            $this->call('scout:flush', ['model' => $model]);
            $this->call('scout:import', ['model' => $model, '--chunk' => 500]);
        }

        return self::SUCCESS;
    }
}
