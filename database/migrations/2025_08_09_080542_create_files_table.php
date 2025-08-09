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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Original filename
            $table->string('filename'); // Stored filename (with hash)
            $table->string('path'); // Storage path
            $table->string('disk')->default('public'); // Storage disk
            $table->string('mime_type');
            $table->unsignedBigInteger('size'); // File size in bytes
            $table->string('type')->default('attachment'); // profile_picture, attachment, document, etc.
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->nullableMorphs('fileable'); // Polymorphic relationship
            $table->json('metadata')->nullable(); // Additional file metadata
            $table->boolean('is_public')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['type', 'uploaded_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
