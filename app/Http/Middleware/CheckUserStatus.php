<?php

namespace App\Http\Middleware;

use App\Helpers\Helper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            if ($user->status === 'Inactive') {
                if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                    $user->currentAccessToken()->delete();
                }
                return Helper::jsonErrorResponse('Your account is inactive. Please contact support.', 403, []);
            }

            if ($user->status === 'Banned') {
                if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                    $user->currentAccessToken()->delete();
                }
                return Helper::jsonErrorResponse('Your account has been banned.', 403, []);
            }
        }

        return $next($request);
    }
}
