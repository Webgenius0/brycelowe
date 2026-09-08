<?php

if (! function_exists('hasRouteAccess')) {
    function hasRouteAccess(string $routeName): bool
    {
        $user = auth()->user();

        if (! $user) {
            return false;
        }

        // Admin bypass
        if ($user->role === 'Admin') {
            return true;
        }

        $permissions = collect($user->permissions ?? [])
            ->pluck('route')
            ->flatten()
            ->toArray();

        return in_array($routeName, $permissions);
    }
}
