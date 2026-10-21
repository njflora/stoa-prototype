<?php

return [

    // Where `php artisan stoa:export` writes the static preview: the Vue
    // site's public/data. In Docker the site's public folder is mounted at
    // /site-public (see compose.yaml).
    'export_path' => env('STOA_EXPORT_PATH', base_path('../public/data')),

    /*
    | Who may read and post where (a design decision). Casual spaces are open to
    | every account; heated or specialist ones are for members, which keeps
    | them civil. Members, and staff, may post everywhere.
    |
    | On these shows, anyone can read the discussion and the reading list,
    | and any account can post. On every other show both are members only.
    | Articles and the live show are always open.
    */
    'open_shows' => ['stoa-podcast', 'morning-brief'],

    // Community forums and who may post in each: "all" accounts or "members".
    'forums' => [
        'philosophy-circle/general-discussion' => 'all',
        'philosophy-circle/ethics' => 'members',
    ],

    // The recorded sample feeds the platform sync reads with --fixtures
    // (written by scripts/data/generate.mjs).
    'fixtures_path' => base_path('tests/fixtures/feeds'),

    // Communities an account can join.
    'communities' => ['philosophy-circle'],

];
