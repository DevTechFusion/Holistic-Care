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
            // Drop the existing time_slot column
            $table->dropColumn('time_slot');
            
            // Add new time fields
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration')->comment('Duration in minutes');
            
            // Add indexes for better performance
            $table->index(['start_time', 'end_time']);
            $table->index('duration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Drop the new time fields
            $table->dropIndex(['start_time', 'end_time']);
            $table->dropIndex(['duration']);
            $table->dropColumn(['start_time', 'end_time', 'duration']);
            
            // Add back the original time_slot column
            $table->string('time_slot');
        });
    }
};
