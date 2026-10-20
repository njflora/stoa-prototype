<?php

namespace App\Http\Controllers;

use App\Catalogue\Catalogue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** The read API for the catalogue. Each method hands one question to the Catalogue. */
class CatalogueController extends Controller
{
    public function __construct(private Catalogue $catalogue) {}

    public function reference(): JsonResponse
    {
        return response()->json($this->catalogue->reference());
    }

    public function home(): JsonResponse
    {
        return response()->json($this->catalogue->home());
    }

    public function trending(): JsonResponse
    {
        return response()->json($this->catalogue->trending());
    }

    /** GET /api/episodes?show=&access=&host=&sort=&period=&page= */
    public function episodes(Request $request): JsonResponse
    {
        $query = $request->validate([
            'show' => ['nullable', 'string', 'exists:shows,id'],
            'host' => ['nullable', 'string', 'exists:contributors,id'],
            'access' => [Rule::in(['all', 'free', 'members'])],
            'sort' => [Rule::in(['newest', 'oldest', 'popular'])],
            'period' => [Rule::in(array_keys(Catalogue::PERIODS))],
            'page' => ['integer', 'min:0'],
        ]);

        return response()->json($this->catalogue->episodes(
            showId: $query['show'] ?? null,
            page: (int) ($query['page'] ?? 0),
            access: $query['access'] ?? 'all',
            hostId: $query['host'] ?? null,
            sort: $query['sort'] ?? 'newest',
            period: $query['period'] ?? 'month',
        ));
    }

    public function episode(string $id): JsonResponse
    {
        return response()->json($this->catalogue->episode($id) ?? abort(404));
    }

    /** GET /api/articles?category=&author=&sort=&period=&page= */
    public function articles(Request $request): JsonResponse
    {
        $query = $request->validate([
            'category' => ['nullable', 'string'],
            'author' => ['nullable', 'string', 'exists:contributors,id'],
            'sort' => [Rule::in(['newest', 'popular', 'controversial'])],
            'period' => [Rule::in(array_keys(Catalogue::ARTICLE_PERIODS))],
            'page' => ['integer', 'min:0'],
        ]);

        return response()->json($this->catalogue->articles(
            page: (int) ($query['page'] ?? 0),
            category: $query['category'] ?? null,
            authorId: $query['author'] ?? null,
            sort: $query['sort'] ?? 'newest',
            period: $query['period'] ?? 'month',
        ));
    }

    public function article(string $id): JsonResponse
    {
        return response()->json($this->catalogue->article($id) ?? abort(404));
    }

    public function searchDocs(): JsonResponse
    {
        return response()->json($this->catalogue->searchDocs());
    }
}
