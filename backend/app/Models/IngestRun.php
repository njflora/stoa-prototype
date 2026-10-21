<?php

namespace App\Models;

use App\Catalogue\Catalogue;
use Illuminate\Database\Eloquent\Model;

/** One sync with one platform. */
class IngestRun extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fixtures' => 'boolean',
            'notes' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function toData(): array
    {
        return [
            'id' => $this->id,
            'platform' => $this->platform,
            'fixtures' => $this->fixtures,
            'status' => $this->status,
            'fetched' => $this->fetched,
            'matched' => $this->matched,
            'linked' => $this->linked,
            'unmatched' => $this->unmatched,
            'notes' => $this->notes ?? [],
            'startedAt' => Catalogue::iso($this->started_at),
            'finishedAt' => $this->finished_at ? Catalogue::iso($this->finished_at) : null,
        ];
    }
}
