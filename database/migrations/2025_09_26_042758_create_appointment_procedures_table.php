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
        Schema::create('appointment_procedures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');
            $table->foreignId('procedure_id')->constrained('procedures')->onDelete('cascade');
            $table->timestamps();

            // Unique constraint to prevent duplicate appointment-procedure combinations
            $table->unique(['appointment_id', 'procedure_id']);

            // Indexes for better performance
            $table->index(['appointment_id', 'procedure_id']);
            $table->index(['procedure_id', 'appointment_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_procedures');
    }
};