<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The protections around the API: rate limits on changes and search.
 */
class SecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_changes_are_limited_to_20_a_minute_per_account(): void
    {
        $user = User::factory()->create();
        $community = config('stoa.communities')[0];

        for ($i = 0; $i < 20; $i++) {
            $this->actingAs($user)->postJson("/api/communities/{$community}")->assertOk();
        }
        $this->actingAs($user)->postJson("/api/communities/{$community}")->assertTooManyRequests();

        // Another account has its own count.
        $this->actingAs(User::factory()->create())->postJson("/api/communities/{$community}")->assertOk();
    }

    public function test_search_is_limited_to_60_a_minute_per_visitor(): void
    {
        // An empty query is refused (422), but it still counts towards the limit.
        for ($i = 0; $i < 60; $i++) {
            $this->getJson('/api/search')->assertUnprocessable();
        }
        $this->getJson('/api/search')->assertTooManyRequests();
    }
}
