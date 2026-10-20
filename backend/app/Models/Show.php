<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A programme: The Stoa Podcast, Chronos, Ledger and so on. */
class Show extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'host_ids' => 'array',
            'palette' => 'array',
            'slot' => 'array',
            'streamed_live' => 'boolean',
        ];
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class);
    }

    /** The fields the site reads, in its own naming. */
    public function toData(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'tagline' => $this->tagline,
            'access' => $this->access,
            'hostIds' => $this->host_ids,
            'palette' => $this->palette,
            // Only shows streamed live say so; recordings leave it out.
            ...($this->streamed_live ? ['streamedLive' => true] : []),
            'slot' => $this->slot,
            'unit' => $this->unit,
            'schedule' => $this->schedule,
        ];
    }
}
