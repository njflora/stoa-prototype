<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

/** A run of episodes told in parts, such as "The Fall of the Republic". */
class Series extends Model
{
    use Searchable;

    protected $table = 'series';

    protected $primaryKey = 'slug';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    // Filled by the seeder, never from a request: nothing is mass-assignable.
    protected $guarded = ['*'];

    public function toSearchableArray(): array
    {
        $first = $this->episodes()->with('contributors')->first();

        return [
            'slug' => $this->slug,
            'title' => $this->name,
            'show' => $this->show->name,
            'hosts' => $first?->contributors->pluck('name')->implode(' ') ?? '',
            'text' => $this->description,
            'showId' => $this->show_id,
        ];
    }

    public function show(): BelongsTo
    {
        return $this->belongsTo(Show::class);
    }

    /** The parts, first to last. */
    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class, 'series_slug')->orderBy('series_part');
    }
}
