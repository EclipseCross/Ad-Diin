<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAiMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('diin_ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('diin_ai_conversations')->onDelete('cascade');
            $table->string('role', 20);
            $table->longText('content');
            $table->json('sources')->nullable();
            $table->timestamps();
            $table->index(['conversation_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('diin_ai_messages');
    }
}
