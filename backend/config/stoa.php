<?php

return [

    // Where `php artisan stoa:export` writes the static preview: the Vue
    // site's public/data. In Docker the site's public folder is mounted at
    // /site-public (see compose.yaml).
    'export_path' => env('STOA_EXPORT_PATH', base_path('../public/data')),

];
