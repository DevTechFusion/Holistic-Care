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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            // Basic appointment details
            $table->date('date');
            $table->string('time_slot');
            $table->string('patient_name');
            $table->string('contact_number');
            $table->string('agent');
            $table->text('notes')->nullable();
            $table->string('mr_number')->nullable(); // Medical Record Number

            // Financial details
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('payment_method')->nullable();

            // Foreign key relationships
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->foreignId('procedure_id')->constrained('procedures')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->foreignId('source_id')->constrained('sources')->onDelete('cascade');
            $table->foreignId('remarks_1_id')->nullable()->constrained('remarks_1')->onDelete('set null');
            $table->foreignId('remarks_2_id')->nullable()->constrained('remarks_2')->onDelete('set null');
            $table->foreignId('status_id')->nullable()->constrained('statuses')->onDelete('set null');

            // Flag to distinguish between appointments and reports
            $table->boolean('is_report')->default(false);

            $table->timestamps();

            // Indexes for better performance
            $table->index(['date', 'is_report']);
            $table->index(['doctor_id', 'is_report']);
            $table->index(['department_id', 'is_report']);
            $table->index(['category_id', 'is_report']);
            $table->index(['status_id', 'is_report']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
