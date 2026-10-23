<?php

namespace App\Http\Controllers;

use App\Catalogue\Catalogue;
use App\Discussion\Discussions;
use App\Discussion\Thread;
use App\Models\Comment;
use App\Models\ForumTopic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/** Comments, votes, reading lists and forum topics, each behind ThreadPolicy. */
class DiscussionController extends Controller
{
    public function __construct(private Discussions $discussions, private Catalogue $catalogue) {}

    /** GET /api/threads/{type}/{id}: the comments, or `{ locked, count }` for a non-member. */
    public function show(Request $request, string $type, string $id): JsonResponse
    {
        return response()->json($this->discussions->thread($this->find($type, $id), $request->user()));
    }

    /** POST /api/threads/{type}/{id}/comments {text, parentId?} */
    public function store(Request $request, string $type, string $id): JsonResponse
    {
        $thread = $this->find($type, $id);
        Gate::authorize('post', $thread);
        $input = $request->validate([
            'text' => ['required', 'string', 'max:2000'],
            // Replies go to a top-level comment in the same thread: one level deep.
            'parentId' => ['nullable', Rule::exists('comments', 'id')->where('thread', $thread->key())->whereNull('parent_id')],
        ]);

        $comment = Comment::create([
            'thread' => $thread->key(),
            'parent_id' => $input['parentId'] ?? null,
            'user_id' => $this->signedIn($request)->id,
            'body' => trim($input['text']),
            'posted_at' => $this->catalogue->postingTime(),
        ]);

        return response()->json($comment->load('user')->toData($request->user()), 201);
    }

    /** POST /api/comments/{id}/vote {direction: up|down|null}. The same direction again removes it. */
    public function vote(Request $request, Comment $comment): JsonResponse
    {
        Gate::authorize('post', $this->find(...explode(':', $comment->thread, 2)));
        $direction = $request->validate(['direction' => ['nullable', Rule::in(['up', 'down'])]])['direction'] ?? null;
        $user = $this->signedIn($request);

        DB::transaction(function () use ($comment, $user, $direction) {
            $votes = DB::table('comment_votes')->where(['user_id' => $user->id, 'comment_id' => $comment->id]);
            $previous = $votes->value('direction');
            if ($previous === $direction) {
                return;
            }
            if ($previous) {
                $comment->decrement($previous === 'up' ? 'likes' : 'dislikes');
                $votes->delete();
            }
            if ($direction) {
                $comment->increment($direction === 'up' ? 'likes' : 'dislikes');
                DB::table('comment_votes')->insert(['user_id' => $user->id, 'comment_id' => $comment->id, 'direction' => $direction]);
            }
        });
        $comment->refresh();

        return response()->json(['likes' => $comment->likes, 'dislikes' => $comment->dislikes, 'myVote' => $direction]);
    }

    /** GET /api/reading-lists/{type}/{id}: the sources, or `{ locked, count }` for a non-member. */
    public function readingList(Request $request, string $type, string $id): JsonResponse
    {
        abort_unless(in_array($type, ['episode', 'live'], true), 404);

        return response()->json($this->discussions->readingList($this->find($type, $id), $request->user()));
    }

    /** GET /api/forums/{community}/{forum}/topics: topics people have started, newest first. */
    public function topics(Request $request, string $community, string $forum): JsonResponse
    {
        $thread = $this->find('forum', "{$community}/{$forum}");
        Gate::authorize('read', $thread);

        return response()->json(
            ForumTopic::where('forum', $thread->id)->with('user')->latest()->limit(50)->get()
                ->map(fn (ForumTopic $topic) => $this->topic($topic))->all(),
        );
    }

    /** POST /api/forums/{community}/{forum}/topics {title} */
    public function startTopic(Request $request, string $community, string $forum): JsonResponse
    {
        $thread = $this->find('forum', "{$community}/{$forum}");
        Gate::authorize('post', $thread);
        $title = $request->validate(['title' => ['required', 'string', 'max:200']])['title'];
        $topic = ForumTopic::create(['forum' => $thread->id, 'user_id' => $this->signedIn($request)->id, 'title' => trim($title)]);

        return response()->json($this->topic($topic->load('user')), 201);
    }

    private function find(string $type, string $id): Thread
    {
        return Thread::find($type, $id) ?? abort(404);
    }

    /**
     * @return array<string, mixed>
     */
    private function topic(ForumTopic $topic): array
    {
        // Laravel sets created_at on every insert; the column allows null only
        // because timestamps() does, so the fallback is never expected.
        $createdAt = $topic->created_at ?? now();

        return ['title' => $topic->title, 'by' => $topic->user->name, 'replies' => 0, 'createdAt' => Catalogue::iso($createdAt)];
    }
}
