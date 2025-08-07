<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Exceptions\TokenExpiredException;
use Laravel\Sanctum\Exceptions\TokenInvalidException;

class Authenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string[]  ...$guards
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$guards)
    {
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                // Check if Authorization header is missing
                if (!$request->hasHeader('Authorization')) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Authentication token is required.',
                        'error' => 'No authorization header provided'
                    ], 401);
                }

                // Check if Bearer token is missing
                $authHeader = $request->header('Authorization');
                if (!str_starts_with($authHeader, 'Bearer ')) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invalid authentication format.',
                        'error' => 'Authorization header must start with "Bearer "'
                    ], 401);
                }

                // Generic unauthenticated response
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authentication failed.',
                    'error' => 'Invalid or expired token'
                ], 401);
            }
            return redirect()->route('login');
        }
        return $next($request);
    }
}
