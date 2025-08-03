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
            // Add foreign key constraint to existing agent_id column
            $table->foreign('agent_id')->references('id')->on('users')->onDelete('cascade');

            // Add index for better performance
            $table->index(['agent_id']);
        });

        Schema::table('reports', function (Blueprint $table) {
            // Drop the generated_by string column
            $table->dropColumn('generated_by');

            // Add generated_by_id foreign key
            $table->foreignId('generated_by_id')->nullable()->constrained('users')->onDelete('set null');

            // Add index for better performance
            $table->index(['generated_by_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Drop the foreign key and index
            $table->dropForeign(['agent_id']);
            $table->dropIndex(['agent_id']);
        });

        Schema::table('reports', function (Blueprint $table) {
            // Drop the foreign key and index
            $table->dropForeign(['generated_by_id']);
            $table->dropIndex(['generated_by_id']);
            $table->dropColumn('generated_by_id');

            // Add back the generated_by string column
            $table->string('generated_by')->nullable();
        });
    }
};
