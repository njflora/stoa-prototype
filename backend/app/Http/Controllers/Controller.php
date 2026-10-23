<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * The signed-in account. Routes that use this sit behind auth:sanctum,
     * so there is always one. If a route ever loses that middleware, this
     * answers 401 instead of acting for nobody.
     */
    protected function signedIn(Request $request): User
    {
        return $request->user() ?? abort(401);
    }
}
