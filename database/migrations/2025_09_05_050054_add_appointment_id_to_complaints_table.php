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
        Schema::table('complaints', function (Blueprint $table) {
            // Add appointment_id foreign key to establish one-to-one relationship
            $table->foreignId('appointment_id')->nullable()->after('id')->constrained('appointments')->onDelete('cascade');
            
            // Add index for better performance
            $table->index('appointment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropForeign(['appointment_id']);
            $table->dropIndex(['appointment_id']);
            $table->dropColumn('appointment_id');
        });
    }
};