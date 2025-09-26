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
        Schema::table('appointments', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['procedure_id']);
            
            // Drop the procedure_id column
            $table->dropColumn('procedure_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Add the procedure_id column back
            $table->foreignId('procedure_id')->nullable()->constrained('procedures')->onDelete('cascade');
        });
    }
};