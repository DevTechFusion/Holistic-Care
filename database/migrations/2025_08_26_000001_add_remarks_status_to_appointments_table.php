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
            if (!Schema::hasColumn('appointments', 'remarks_1_id')) {
                $table->foreignId('remarks_1_id')->nullable()->constrained('remarks_1')->onDelete('set null');
            }
            if (!Schema::hasColumn('appointments', 'remarks_2_id')) {
                $table->foreignId('remarks_2_id')->nullable()->constrained('remarks_2')->onDelete('set null');
            }
            if (!Schema::hasColumn('appointments', 'status_id')) {
                $table->foreignId('status_id')->nullable()->constrained('statuses')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            if (Schema::hasColumn('appointments', 'remarks_1_id')) {
                $table->dropForeign(['remarks_1_id']);
                $table->dropColumn('remarks_1_id');
            }
            if (Schema::hasColumn('appointments', 'remarks_2_id')) {
                $table->dropForeign(['remarks_2_id']);
                $table->dropColumn('remarks_2_id');
            }
            if (Schema::hasColumn('appointments', 'status_id')) {
                $table->dropForeign(['status_id']);
                $table->dropColumn('status_id');
            }
        });
    }
};


