<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Drop the unique constraint on name and guard_name
            $table->dropUnique(['name', 'guard_name']);
            
            // Add a unique constraint on name, guard_name, and module
            $table->unique(['name', 'guard_name', 'module'], 'permissions_name_guard_module_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Drop the new unique constraint
            $table->dropUnique('permissions_name_guard_module_unique');
            
            // Restore the original unique constraint
            $table->unique(['name', 'guard_name']);
        });
    }
};