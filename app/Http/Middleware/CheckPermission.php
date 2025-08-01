<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  string|array  $permissions
     *
     * @throws \Spatie\Permission\Exceptions\UnauthorizedException
     */
    public function handle(Request $request, Closure $next, $permissions, ?string $module = null, ?string $guard = null): Response
    {
        $authGuard = app('auth')->guard($guard);

        if ($authGuard->guest()) {
            throw UnauthorizedException::notLoggedIn();
        }

        $requiredPermissions = is_array($permissions) ? $permissions : explode('|', $permissions);

        foreach ($requiredPermissions as $requiredPermission) {
            if ($this->hasPermission($authGuard, $requiredPermission, $module)) {
                return $next($request);
            }
        }

        throw UnauthorizedException::forPermissions($requiredPermissions);
    }

    /**
     * Check if the user has the given permission.
     */
    public function hasPermission(Guard $authGuard, string $permission, ?string $module): bool
    {
        $userPermissions = $authGuard->user()->getAllPermissions();

        foreach ($userPermissions as $userPermission) {
            if (
                $userPermission->name === $permission &&
                ($module === null || $userPermission->module === $module) &&
                (!property_exists($userPermission, 'account_type_id') || $userPermission->account_type_id === $authGuard->user()->account_type_id)
            ) {
                return true;
            }
        }

        return false;
    }
}
