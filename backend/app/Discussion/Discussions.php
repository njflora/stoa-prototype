<?php

namespace App\Discussion;

use App\Models\Comment;
use App\Models\ReadingListItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Threads and reading lists as one person may see them. Someone who may not
 * read gets `{ locked: true, count }` and nothing else: no text, no names.
 * The API answers for whoever is signed in. The static export answers as a
 * member, and the site gates it in the browser (the preview cannot check).
 *
 * Each method takes many threads at once and answers them in a few
 * queries, so a page of 50 episodes costs the same as one.
 */
class Discussions
{
    /**
     * @return array<string, mixed>
     */
    public function thread(Thread $thread, ?User $viewer): array
    {
        return $this->threads([$thread], $viewer)[$thread->key()];
    }

    /**
     * @return array<string, mixed>
     */
    public function readingList(Thread $thread, ?User $viewer): array
    {
        return $this->readingLists([$thread], $viewer)[$thread->key()];
    }

    /**
     * @param  Thread[]  $threads
     * @return array<string, array> by thread key ("episode:chronos-12")
     * @return array<string, array<string, mixed>>
     */
    public function threads(array $threads, ?User $viewer): array
    {
        $gate = Gate::forUser($viewer);
        $keys = array_map(fn (Thread $t) => $t->key(), $threads);
        $counts = Comment::whereIn('thread', $keys)->groupBy('thread')->selectRaw('thread, count(*) as total')->pluck('total', 'thread');
        $readable = array_values(array_map(fn (Thread $t) => $t->key(), array_filter($threads, fn (Thread $t) => $gate->allows('read', $t))));

        $comments = $readable
            ? Comment::whereIn('thread', $readable)->whereNull('parent_id')->with(['user', 'replies.user'])->orderByDesc('posted_at')->get()->groupBy('thread')
            : collect();
        $myVotes = $viewer && $readable
            ? DB::table('comment_votes')
                ->join('comments', 'comments.id', '=', 'comment_votes.comment_id')
                ->where('comment_votes.user_id', $viewer->id)
                ->whereIn('comments.thread', $readable)
                ->pluck('comment_votes.direction', 'comment_votes.comment_id')
                ->all()
            : [];

        $answers = [];
        foreach ($threads as $thread) {
            $key = $thread->key();
            $count = (int) ($counts[$key] ?? 0);
            $answers[$key] = in_array($key, $readable, true)
                ? [
                    'locked' => false,
                    'open' => $thread->open,
                    'count' => $count,
                    'canPost' => $gate->allows('post', $thread),
                    'comments' => ($comments[$key] ?? collect())->map(fn (Comment $c) => $c->toData($viewer, $myVotes))->values()->all(),
                ]
                : ['locked' => true, 'open' => $thread->open, 'count' => $count];
        }

        return $answers;
    }

    /**
     * Episodes' and the live show's reading lists, behind the same rule as their discussion.
     *
     * @param  Thread[]  $threads
     * @return array<string, array> by thread key
     * @return array<string, array<string, mixed>>
     */
    public function readingLists(array $threads, ?User $viewer): array
    {
        $gate = Gate::forUser($viewer);
        $items = ReadingListItem::whereIn('list', array_map(fn (Thread $t) => $t->key(), $threads))
            ->orderBy('position')
            ->get()
            ->groupBy('list');

        $answers = [];
        foreach ($threads as $thread) {
            $list = $items[$thread->key()] ?? collect();
            $answers[$thread->key()] = $gate->allows('read', $thread)
                ? ['locked' => false, 'open' => $thread->open, 'count' => $list->count(), 'items' => $list->map->toData()->values()->all()]
                : ['locked' => true, 'open' => $thread->open, 'count' => $list->count()];
        }

        return $answers;
    }
}
