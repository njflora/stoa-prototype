<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A run of episodes told in parts, such as "The Fall of the Republic". */
class Series extends Model
{
    protected $table = 'series';

    protected $primaryKey = 'slug';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $guarded = [];

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
