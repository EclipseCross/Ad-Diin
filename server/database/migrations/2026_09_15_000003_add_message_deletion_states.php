<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMessageDeletionStates extends Migration
{
    public function up()
    {
        if (Schema::hasTable('conversations')) {
            Schema::table('conversations', function (Blueprint $table) {
                if (!Schema::hasColumn('conversations', 'deleted_for_user_at')) {
                    $table->timestamp('deleted_for_user_at')->nullable();
                }
                if (!Schema::hasColumn('conversations', 'deleted_for_admin_at')) {
                    $table->timestamp('deleted_for_admin_at')->nullable();
                }
            });
        }

        if (Schema::hasTable('messages')) {
            Schema::table('messages', function (Blueprint $table) {
                if (!Schema::hasColumn('messages', 'deleted_for_everyone_at')) {
                    $table->timestamp('deleted_for_everyone_at')->nullable();
                }
                if (!Schema::hasColumn('messages', 'deleted_for_sender_at')) {
                    $table->timestamp('deleted_for_sender_at')->nullable();
                }
                if (!Schema::hasColumn('messages', 'deleted_for_user_at')) {
                    $table->timestamp('deleted_for_user_at')->nullable();
                }
                if (!Schema::hasColumn('messages', 'deleted_for_admin_at')) {
                    $table->timestamp('deleted_for_admin_at')->nullable();
                }
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('conversations')) {
            Schema::table('conversations', function (Blueprint $table) {
                if (Schema::hasColumn('conversations', 'deleted_for_user_at')) {
                    $table->dropColumn('deleted_for_user_at');
                }
                if (Schema::hasColumn('conversations', 'deleted_for_admin_at')) {
                    $table->dropColumn('deleted_for_admin_at');
                }
            });
        }

        if (Schema::hasTable('messages')) {
            Schema::table('messages', function (Blueprint $table) {
                if (Schema::hasColumn('messages', 'deleted_for_everyone_at')) {
                    $table->dropColumn('deleted_for_everyone_at');
                }
                if (Schema::hasColumn('messages', 'deleted_for_sender_at')) {
                    $table->dropColumn('deleted_for_sender_at');
                }
                if (Schema::hasColumn('messages', 'deleted_for_user_at')) {
                    $table->dropColumn('deleted_for_user_at');
                }
                if (Schema::hasColumn('messages', 'deleted_for_admin_at')) {
                    $table->dropColumn('deleted_for_admin_at');
                }
            });
        }
    }
}
