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
            // Remove report-specific fields from appointments table
            $table->dropForeign(['remarks_1_id']);
            $table->dropForeign(['remarks_2_id']);
            $table->dropForeign(['status_id']);

            $table->dropColumn([
                'amount',
                'payment_method',
                'remarks_1_id',
                'remarks_2_id',
                'status_id'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Add back the report-specific fields
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('payment_method')->nullable();
            $table->foreignId('remarks_1_id')->nullable()->constrained('remarks_1')->onDelete('set null');
            $table->foreignId('remarks_2_id')->nullable()->constrained('remarks_2')->onDelete('set null');
            $table->foreignId('status_id')->nullable()->constrained('statuses')->onDelete('set null');
        });
    }
};
