<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Laravel\Scout\Searchable;

/** A presenter, guest host or writer. The site calls them hosts. */
class Contributor extends Model
{
    use Searchable;

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $guarded = [];

    /**
     * What search indexes. Their shows are every show they appear on, not
     * only those they present regularly, so "Gary Forum" finds Gary
     * (review note 9).
     */
    public function toSearchableArray(): array
    {
        $shows = DB::table('contributor_episode')
            ->join('episodes', 'episodes.id', '=', 'contributor_episode.episode_id')
            ->join('shows', 'shows.id', '=', 'episodes.show_id')
            ->where('contributor_id', $this->id)
            ->distinct()
            ->pluck('shows.name');

        return [
            'id' => $this->id,
            'title' => $this->name,
            'show' => $shows->implode(' '),
            'hosts' => $this->name,
            'text' => $this->role,
            'hostIds' => [$this->id],
        ];
    }

    public function episodes(): BelongsToMany
    {
        return $this->belongsToMany(Episode::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }
}
