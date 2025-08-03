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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();

            // Reference to the original appointment
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');

            // Report-specific fields
            $table->string('report_type')->default('appointment_summary'); // appointment_summary, daily_report, monthly_report, etc.
            $table->text('summary_data')->nullable(); // JSON data for report analytics
            $table->text('notes')->nullable(); // Additional report notes

            // Report metadata
            $table->string('generated_by')->nullable(); // Who generated the report
            $table->timestamp('generated_at')->useCurrent(); // When report was generated

            $table->timestamps();

            // Indexes for better performance
            $table->index(['appointment_id', 'report_type']);
            $table->index(['generated_at']);
            $table->index(['report_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
