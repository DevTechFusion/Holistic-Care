<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, migrate existing procedure_id data to the pivot table
        DB::statement('
            INSERT INTO appointment_procedures (appointment_id, procedure_id, created_at, updated_at)
            SELECT id, procedure_id, created_at, updated_at
            FROM appointments
            WHERE procedure_id IS NOT NULL
        ');

        // Now make procedure_id nullable in appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('procedure_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore procedure_id from pivot table (take the first procedure for each appointment)
        DB::statement('
            UPDATE appointments a
            SET procedure_id = (
                SELECT ap.procedure_id 
                FROM appointment_procedures ap 
                WHERE ap.appointment_id = a.id 
                ORDER BY ap.id 
                LIMIT 1
            )
            WHERE EXISTS (
                SELECT 1 FROM appointment_procedures ap 
                WHERE ap.appointment_id = a.id
            )
        ');

        // Make procedure_id not nullable again
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('procedure_id')->nullable(false)->change();
        });

        // Clear the pivot table
        DB::table('appointment_procedures')->truncate();
    }
};