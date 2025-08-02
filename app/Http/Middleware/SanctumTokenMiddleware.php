<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SanctumTokenMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if Authorization header is missing
        if (!$request->hasHeader('Authorization')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authentication token is required.',
                'error' => 'No authorization header provided',
                'code' => 'MISSING_TOKEN'
            ], 401);
        }

        // Check if Bearer token format is correct
        $authHeader = $request->header('Authorization');
        if (!str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid authentication format.',
                'error' => 'Authorization header must start with "Bearer "',
                'code' => 'INVALID_FORMAT'
            ], 401);
        }

        // Extract token
        $token = str_replace('Bearer ', '', $authHeader);

        // Check if token is empty
        if (empty($token)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authentication token is required.',
                'error' => 'Token is empty',
                'code' => 'EMPTY_TOKEN'
            ], 401);
        }

        // Try to authenticate
        if (!Auth::guard('sanctum')->check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authentication failed.',
                'error' => 'Invalid or expired token',
                'code' => 'INVALID_TOKEN'
            ], 401);
        }

        return $next($request);
    }
}
