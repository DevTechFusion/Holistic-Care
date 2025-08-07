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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();

            // Personal Details
            $table->string('name');
            $table->string('phone_number');

            // Professional Details
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');

            // Availability (JSON field to store availability for each day)
            $table->json('availability')->nullable();

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index(['name', 'phone_number']);
            $table->index('department_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
