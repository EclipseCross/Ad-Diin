<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMessageAttachments extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('messages')) {
            return;
        }

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

        Schema::table('messages', function (Blueprint $table) {
            // Also repair installations where the earlier deletion migration
            // was marked complete before all columns were added.
            if (!Schema::hasColumn('messages', 'deleted_for_everyone_at')) {
                $table->timestamp('deleted_for_everyone_at')->nullable();
            }
            if (!Schema::hasColumn('messages', 'deleted_for_user_at')) {
                $table->timestamp('deleted_for_user_at')->nullable();
            }
            if (!Schema::hasColumn('messages', 'deleted_for_admin_at')) {
                $table->timestamp('deleted_for_admin_at')->nullable();
            }
            if (!Schema::hasColumn('messages', 'image_url')) {
                $table->text('image_url')->nullable();
            }
            if (!Schema::hasColumn('messages', 'image_public_id')) {
                $table->string('image_public_id')->nullable();
            }
        });
    }

    public function down()
    {
        if (!Schema::hasTable('messages')) {
            return;
        }

        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'image_url')) {
                $table->dropColumn('image_url');
            }
            if (Schema::hasColumn('messages', 'image_public_id')) {
                $table->dropColumn('image_public_id');
            }
        });
    }
}
