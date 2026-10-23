<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A topic started in a community forum, such as "philosophy-circle/ethics".
 *
 * @property-read User $user Required: user_id is a non-null foreign key.
 */
class ForumTopic extends Model
{
    protected $fillable = ['forum', 'user_id', 'title'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
