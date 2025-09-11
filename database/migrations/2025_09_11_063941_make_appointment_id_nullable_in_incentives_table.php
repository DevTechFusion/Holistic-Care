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
            // Drop the existing foreign key constraint
            $table->dropForeign(['appointment_id']);
            
            // Make appointment_id nullable
            $table->foreignId('appointment_id')->nullable()->change();
            
            // Re-add the foreign key constraint
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incentives', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['appointment_id']);
            
            // Make appointment_id not nullable
            $table->foreignId('appointment_id')->change();
            
            // Re-add the foreign key constraint
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
        });
    }
};
