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
        Schema::table('complaints', function (Blueprint $table) {
            // Who submitted the complaint (manager)
            $table->foreignId('submitted_by')->after('id')->constrained('users');

            // Where the mistake happened (e.g., Whatsapp, Insta, etc.)
            $table->string('platform')->nullable()->after('complaint_type_id')->index();

            // When it occurred (used for dashboard grouping)
            $table->dateTime('occurred_at')->nullable()->after('platform')->index();

            // Helpful composite indexes for dashboard filters
            $table->index(['agent_id', 'occurred_at']);
            $table->index(['doctor_id', 'occurred_at']);
            $table->index(['complaint_type_id', 'occurred_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropForeign(['submitted_by']);
            $table->dropColumn('submitted_by');

            $table->dropIndex(['platform']);
            $table->dropColumn('platform');

            $table->dropIndex(['occurred_at']);
            $table->dropColumn('occurred_at');

            $table->dropIndex(['agent_id', 'occurred_at']);
            $table->dropIndex(['doctor_id', 'occurred_at']);
            $table->dropIndex(['complaint_type_id', 'occurred_at']);
        });
    }
};


