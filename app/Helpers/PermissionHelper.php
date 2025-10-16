<?php

namespace App\Helpers;

class PermissionHelper
{
    /**
     * Generate permission middleware for resource routes
     */
    public static function resourcePermissions(string $module): array
    {
        return [
            'index' => "check.permission:view,{$module}",
            'store' => "check.permission:create,{$module}",
            'show' => "check.permission:view,{$module}",
            'update' => "check.permission:edit,{$module}",
            'destroy' => "check.permission:delete,{$module}"
        ];
    }

    /**
     * Generate permission middleware for specific actions
     */
    public static function actionPermission(string $action, string $module): string
    {
        return "check.permission:{$action},{$module}";
    }

    /**
     * Generate multiple permission middleware for different actions
     */
    public static function multiplePermissions(array $actions, string $module): array
    {
        $permissions = [];
        foreach ($actions as $action) {
            $permissions[$action] = self::actionPermission($action, $module);
        }
        return $permissions;
    }
}
