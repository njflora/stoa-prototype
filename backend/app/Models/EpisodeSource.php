<?php

namespace App\Models;

use App\Catalogue\Catalogue;
use Illuminate\Database\Eloquent\Model;

/** One platform an episode is published on: Rumble, Odysee, BitChute or VOD. */
class EpisodeSource extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['synced_at' => 'datetime'];
    }

    public function toData(): array
    {
        return array_filter([
            'platform' => $this->platform,
            'externalId' => $this->external_id,
            'embedUrl' => $this->embed_url,
            'status' => $this->status,
            'syncedAt' => $this->synced_at ? Catalogue::iso($this->synced_at) : null,
        ], fn ($value) => $value !== null);
    }
}
