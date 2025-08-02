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
        Schema::create('doctor_procedure', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->foreignId('procedure_id')->constrained('procedures')->onDelete('cascade');
            $table->timestamps();

            // Unique constraint to prevent duplicate doctor-procedure combinations
            $table->unique(['doctor_id', 'procedure_id']);

            // Indexes for better performance
            $table->index(['doctor_id', 'procedure_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_procedure');
    }
};
