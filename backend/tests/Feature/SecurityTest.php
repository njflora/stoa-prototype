<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Eloquent\MassAssignmentException;
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

    public function test_all_kinds_of_change_share_one_budget(): void
    {
        // Mixing kinds of change does not get round the limit.
        $user = User::factory()->create();
        $community = config('stoa.communities')[0];

        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($user)->postJson("/api/communities/{$community}")->assertOk();
            $this->actingAs($user)->deleteJson("/api/communities/{$community}")->assertOk();
        }
        $this->actingAs($user)->postJson('/api/purchases', ['episodeId' => 'any'])->assertTooManyRequests();
    }

    public function test_every_api_request_counts_towards_300_a_minute_per_visitor(): void
    {
        for ($i = 0; $i < 300; $i++) {
            $this->getJson('/api/me')->assertOk();
        }
        $this->getJson('/api/me')->assertTooManyRequests();

        // A visitor from another address has their own count.
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9'])->getJson('/api/me')->assertOk();
    }

    public function test_answers_say_how_many_requests_are_left(): void
    {
        $this->getJson('/api/me')
            ->assertHeader('X-RateLimit-Limit', '300')
            ->assertHeader('X-RateLimit-Remaining', '299');
    }

    public function test_tier_and_staff_cannot_be_mass_assigned(): void
    {
        // Outside production, trying is an error, so the mistake shows up in tests.
        $this->expectException(MassAssignmentException::class);
        (new User)->fill(['name' => 'someone', 'tier' => 'gold', 'is_staff' => true]);
    }

    public function test_api_answers_carry_the_security_headers(): void
    {
        $this->getJson('/api/me')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");

        // Errors carry them too.
        $this->getJson('/api/episodes/no-such-episode')->assertNotFound()->assertHeader('X-Content-Type-Options', 'nosniff');
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
