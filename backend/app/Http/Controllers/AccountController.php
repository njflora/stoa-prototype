<?php

namespace App\Http\Controllers;

use App\Models\Episode;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Who is signed in, and what their account holds. */
class AccountController extends Controller
{
    /** The seeded demo accounts, by the demo panel's names for them. */
    public const DEMO_ACCOUNTS = [
        'free' => 'demo-free@stoa.test',
        'member' => 'demo-member@stoa.test',
        'staff' => 'demo-staff@stoa.test',
    ];

    /** GET /api/me: the signed-in account, its purchases and communities. Null when signed out. */
    public function me(Request $request): JsonResponse
    {
        return response()->json($this->account($request->user()));
    }

    /**
     * POST /api/demo/login {as: free|member|staff}. Signs in as a seeded demo
     * account, so no password is ever typed. Only exists in development.
     */
    public function demoLogin(Request $request): JsonResponse
    {
        $as = $request->validate(['as' => ['required', Rule::in(array_keys(self::DEMO_ACCOUNTS))]])['as'];
        $user = User::where('email', self::DEMO_ACCOUNTS[$as])->firstOrFail();
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json($this->account($user));
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json($this->account(null));
    }

    /** POST /api/purchases {episodeId}: buy one members' episode. No payment is taken in the demo. */
    public function purchase(Request $request): JsonResponse
    {
        $id = $request->validate(['episodeId' => ['required', 'string']])['episodeId'];
        $episode = Episode::where('access', 'premium')->findOrFail($id);
        Purchase::firstOrCreate(['user_id' => $request->user()->id, 'episode_id' => $episode->id]);

        return response()->json($this->account($request->user()), 201);
    }

    /** POST /api/communities/{id}: join a community, such as the Philosophy Circle. */
    public function join(Request $request, string $community): JsonResponse
    {
        abort_unless(in_array($community, config('stoa.communities'), true), 404);
        DB::table('community_members')->insertOrIgnore([
            'user_id' => $request->user()->id,
            'community_id' => $community,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json($this->account($request->user()));
    }

    /** DELETE /api/communities/{id}: leave it. */
    public function leave(Request $request, string $community): JsonResponse
    {
        DB::table('community_members')->where(['user_id' => $request->user()->id, 'community_id' => $community])->delete();

        return response()->json($this->account($request->user()));
    }

    private function account(?User $user): array
    {
        if (! $user) {
            return ['user' => null, 'purchases' => [], 'communities' => []];
        }

        return [
            'user' => [
                'name' => $user->name,
                'initials' => $this->initials($user->name),
                'tier' => $user->tier,
                'staff' => $user->is_staff,
            ],
            'purchases' => $user->purchases()->latest()->pluck('episode_id')->all(),
            'communities' => DB::table('community_members')->where('user_id', $user->id)->pluck('community_id')->all(),
        ];
    }

    /** "chris_m" becomes "CM", "GrumpyHistorian" becomes "GH". */
    private function initials(string $name): string
    {
        $words = preg_split('/[^A-Za-z]+|(?=[A-Z])/', $name, -1, PREG_SPLIT_NO_EMPTY);

        return strtoupper(implode('', array_map(fn ($word) => $word[0], array_slice($words, 0, 2))));
    }
}
