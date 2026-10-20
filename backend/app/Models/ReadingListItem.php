<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One source in a reading list: a book, article, report or data set. */
class ReadingListItem extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    public function toData(): array
    {
        return array_filter([
            'id' => (string) $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'source' => $this->source,
            'year' => $this->year,
            'at' => $this->at,
            'to' => $this->to,
        ], fn ($value) => $value !== null);
    }
}
