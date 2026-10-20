<?php

namespace App\Policies;

use App\Discussion\Thread;
use App\Models\User;

/**
 * Who may read and post in a discussion. Open threads: anyone reads, any
 * account posts. Members-only threads: members (and staff) only, for
 * reading as well as posting, so the discussion never leaves the server
 * for anyone else. The same rule covers the reading list beside it.
 */
class ThreadPolicy
{
    public function read(?User $user, Thread $thread): bool
    {
        return $thread->open || (bool) $user?->isMember();
    }

    public function post(?User $user, Thread $thread): bool
    {
        return $user !== null && ($thread->open || $user->isMember());
    }
}
