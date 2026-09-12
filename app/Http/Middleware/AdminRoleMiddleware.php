<?php

namespace App\Http\Middleware;

use App\Helpers\Helper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|null  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return Helper::jsonErrorResponse('Unauthenticated. Please log in to access this resource.', 401);
        }

        // Determine if user has any administrative privilege
        $allowedRoles = ! empty($roles) 
            ? array_map('strtoupper', $roles) 
            : ['SUPERADMIN', 'ADMIN'];

        $userRole = strtoupper((string) ($user->role ?? $user->external_user_role ?? ''));
        $isSuperUser = (bool) ($user->is_superuser ?? false);
        $isInternal = strtoupper((string) ($user->user_type ?? '')) === 'INTERNAL';

        $hasAccess = $isSuperUser 
            || ($userRole === 'SUPERADMIN') 
            || (in_array($userRole, $allowedRoles))
            || ($isInternal && (empty($roles) || in_array('ADMIN', $allowedRoles)));

        if (! $hasAccess) {
            return Helper::jsonErrorResponse('Unauthorized access. Administrator privileges required.', 403, [
                'required_roles' => $allowedRoles,
                'current_role' => $userRole ?: 'USER',
            ]);
        }

        return $next($request);
    }
}
