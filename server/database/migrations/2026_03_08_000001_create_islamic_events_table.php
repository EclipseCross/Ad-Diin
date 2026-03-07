<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('islamic_events')) {
            return;
        }

        Schema::create('islamic_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_name');
            $table->date('event_date');
            $table->string('hijri_date', 100);
            $table->string('hijri_month', 50);
            $table->unsignedTinyInteger('hijri_day');
            $table->enum('event_type', ['special', 'religious', 'festival', 'historical'])->default('religious');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('islamic_events');
    }
};
