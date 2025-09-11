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
        Schema::table('pharmacy', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['agent_id']);
            
            // Make agent_id nullable
            $table->unsignedBigInteger('agent_id')->nullable()->change();
            
            // Re-add the foreign key constraint
            $table->foreign('agent_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacy', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['agent_id']);
            
            // Make agent_id not nullable
            $table->unsignedBigInteger('agent_id')->change();
            
            // Re-add the foreign key constraint
            $table->foreign('agent_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};