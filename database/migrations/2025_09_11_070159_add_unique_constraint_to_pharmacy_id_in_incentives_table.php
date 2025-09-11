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
        Schema::table('incentives', function (Blueprint $table) {
            // Add unique constraint on pharmacy_id to enforce one-to-one relationship
            $table->unique('pharmacy_id', 'incentives_pharmacy_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incentives', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique('incentives_pharmacy_id_unique');
        });
    }
};