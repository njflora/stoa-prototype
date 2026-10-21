<?php

namespace App\Models;

use App\Catalogue\Catalogue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One episode, whichever platforms it is published on. Its id is
 * "{show}-{seq}", where seq counts up from the show's first episode, so ids
 * never change as new episodes arrive.
 */
class Episode extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $guarded = [];

    /** What every list of cards needs loaded alongside the episode. */
    public const CARD_RELATIONS = ['contributors', 'series'];

    protected function casts(): array
    {
        return [
            'topics' => 'array',
            'published_at' => 'datetime',
            'live' => 'boolean',
            'edition' => 'boolean',
        ];
    }

    public function show(): BelongsTo
    {
        return $this->belongsTo(Show::class);
    }

    /** Where it is published: one row per platform. */
    public function sources(): HasMany
    {
        return $this->hasMany(EpisodeSource::class);
    }

    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class, 'series_slug');
    }

    /** The people on the episode, in the order they are credited. */
    public function contributors(): BelongsToMany
    {
        return $this->belongsToMany(Contributor::class)->withPivot('position')->orderByPivot('position');
    }

    /** "Free to watch": free episodes and free previews. */
    public function scopeFree(Builder $query): void
    {
        $query->where('access', '!=', 'premium');
    }

    /** Members only. */
    public function scopeMembers(Builder $query): void
    {
        $query->where('access', 'premium');
    }

    public function scopeWithHost(Builder $query, string $hostId): void
    {
        $query->whereHas('contributors', fn (Builder $q) => $q->where('contributors.id', $hostId));
    }

    public function scopeNewest(Builder $query): void
    {
        // Within a show, seq breaks a tie on the date.
        $query->orderByDesc('published_at')->orderByDesc('seq')->orderBy('id');
    }

    /**
     * The JSON card the site reads. Fields an episode does not have are left
     * out rather than sent as null: daily editions have no number or title
     * (they are titled by date), and only series episodes have a series.
     */
    public function toCard(): array
    {
        return array_filter([
            'id' => $this->id,
            'showId' => $this->show_id,
            'edition' => $this->edition ?: null,
            'number' => $this->number,
            'title' => $this->title,
            'series' => $this->series_slug ? [
                'name' => $this->series->name,
                'part' => $this->series_part,
                'of' => $this->series_of,
            ] : null,
            'topics' => $this->topics,
            'hostIds' => $this->contributors->pluck('id')->all(),
            'publishedAt' => Catalogue::iso($this->published_at),
            'durationMin' => $this->duration_min,
            'access' => $this->access,
            'live' => $this->live,
            'views' => $this->views,
            'comments' => $this->comments_count,
        ], fn ($value) => $value !== null);
    }
}
