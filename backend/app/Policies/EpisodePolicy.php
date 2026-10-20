<?php

namespace App\Policies;

use App\Models\Episode;
use App\Models\User;

class EpisodePolicy
{
    /**
     * Free episodes and free previews are for everyone. Members' episodes
     * are for members, and for a free account that bought that one episode.
     * Without this, the episode's stream sources are not sent at all.
     */
    public function watch(?User $user, Episode $episode): bool
    {
        return $episode->access !== 'premium'
            || (bool) $user?->isMember()
            || (bool) $user?->owns($episode);
    }
}
