<?php

namespace App\Models;

use App\Catalogue\Catalogue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** One comment in a thread, or a reply to one. Threads are one level deep. */
class Comment extends Model
{
    public $timestamps = false;

    // Set by the comment form: never likes or dislikes, which only votes change.
    protected $fillable = ['thread', 'parent_id', 'user_id', 'body', 'posted_at'];

    protected function casts(): array
    {
        return ['posted_at' => 'datetime'];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Comment, $this>
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->orderBy('posted_at');
    }

    /**
     * The shape the site reads. `myVote` and `mine` are for the person
     * asking, from the votes passed in.
     *
     * @param  array<int, string>  $myVotes  comment id => "up" or "down"
     * @return array<string, mixed>
     */
    public function toData(?User $viewer, array $myVotes = []): array
    {
        return array_filter([
            'id' => (string) $this->id,
            'user' => $this->user->name,
            'tier' => $this->user->badge(),
            'postedAt' => Catalogue::iso($this->posted_at),
            'text' => $this->body,
            'likes' => $this->likes,
            'dislikes' => $this->dislikes,
            'replies' => $this->relationLoaded('replies')
                ? $this->replies->map(fn (Comment $reply) => $reply->toData($viewer, $myVotes))->all()
                : [],
            'mine' => $viewer && $viewer->id === $this->user_id ? true : null,
            'myVote' => $myVotes[$this->id] ?? null,
        ], fn ($value) => $value !== null);
    }
}
