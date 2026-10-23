<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route as RouteDefinition;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Who is signed in: what the API says about an account, signing out, and
 * the rule that every change needs a signed-in account.
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    /** Requests from the site itself, so Sanctum uses the session cookie. */
    private const FROM_THE_SITE = ['Referer' => 'http://localhost:5174/'];

    public function test_signed_out_the_account_is_empty(): void
    {
        $this->getJson('/api/me')
            ->assertOk()
            ->assertExactJson(['user' => null, 'purchases' => [], 'communities' => []]);
    }

    public function test_the_account_shows_its_name_and_tier_but_never_its_email_or_password(): void
    {
        // Read back from the database, as a real request would load it.
        $user = User::factory()->create(['name' => 'gold_gill', 'email' => 'gill@example.test', 'tier' => 'gold'])->fresh();
        $this->assertNotNull($user);

        $this->actingAs($user)->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.name', 'gold_gill')
            ->assertJsonPath('user.tier', 'gold')
            ->assertJsonPath('user.staff', false)
            ->assertJsonMissingPath('user.email')
            ->assertJsonMissingPath('user.password')
            ->assertDontSee('gill@example.test')
            ->assertDontSee($user->password, escape: false);
    }

    public function test_signing_out_ends_the_session(): void
    {
        User::factory()->create(['email' => 'demo-free@stoa.test']);
        $this->postJson('/api/demo/login', ['as' => 'free'], self::FROM_THE_SITE)->assertOk();
        $this->assertAuthenticated();

        $this->postJson('/api/logout', [], self::FROM_THE_SITE)->assertOk()->assertJsonPath('user', null);

        $this->assertGuest('web');
        $this->getJson('/api/me', self::FROM_THE_SITE)->assertJsonPath('user', null);
    }

    public function test_every_api_route_that_changes_something_needs_sign_in(): void
    {
        // Signing in and out are the only changes a visitor may make.
        $open = ['api/demo/login', 'api/logout'];
        $changes = collect(Route::getRoutes()->getRoutes())
            ->filter(fn (RouteDefinition $route) => str_starts_with($route->uri(), 'api/'))
            ->filter(fn (RouteDefinition $route) => array_diff($route->methods(), ['GET', 'HEAD']) !== [])
            ->reject(fn (RouteDefinition $route) => in_array($route->uri(), $open, true));

        $this->assertNotEmpty($changes);
        foreach ($changes as $route) {
            $this->assertContains('auth:sanctum', $route->gatherMiddleware(), "{$route->uri()} must require sign-in");
        }
    }

    /**
     * @return array<string, array{string, string}>
     */
    public static function changes(): array
    {
        return [
            'comment' => ['POST', '/api/threads/episode/chronos-1/comments'],
            'vote' => ['POST', '/api/comments/1/vote'],
            'forum topic' => ['POST', '/api/forums/philosophy-circle/general-discussion/topics'],
            'purchase' => ['POST', '/api/purchases'],
            'join a community' => ['POST', '/api/communities/philosophy-circle'],
            'leave a community' => ['DELETE', '/api/communities/philosophy-circle'],
            'resync from the desk' => ['POST', '/api/desk/sync'],
        ];
    }

    #[DataProvider('changes')]
    public function test_a_signed_out_visitor_cannot_make_a_change(string $method, string $uri): void
    {
        $this->json($method, $uri, ['text' => 'hello', 'episodeId' => 'chronos-1', 'title' => 'hello'])->assertUnauthorized();
    }
}
