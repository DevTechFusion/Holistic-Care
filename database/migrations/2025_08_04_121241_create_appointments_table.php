<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
{
    if (!Schema::hasTable('appointments')) {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('patient_name');
            $table->string('phone_no');
            $table->string('mr_number')->nullable();
            $table->string('category');
            $table->time('time');
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
            $table->foreignId('agent_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->foreignId('procedure_id')->constrained()->onDelete('cascade');
            $table->string('platform');
            $table->text('remarks_1')->nullable();
            $table->text('remarks_2')->nullable();
            $table->string('status');
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('mop');
            $table->timestamps();
        });
    }
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
