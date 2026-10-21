<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** The next live broadcast, shown on the live page. */
class LiveEvent extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['host_ids' => 'array', 'sources' => 'array'];
    }

    public function toData(): array
    {
        return [
            'showId' => $this->show_id,
            'number' => $this->number,
            'title' => $this->title,
            'hostIds' => $this->host_ids,
            'viewers' => $this->viewers,
            'startHour' => $this->start_hour,
            // The live stream itself is free, so its sources go to everyone.
            'sources' => $this->sources ?? [],
        ];
    }
}
