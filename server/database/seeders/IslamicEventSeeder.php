<?php

namespace Database\Seeders;

use App\Models\IslamicEvent;
use Illuminate\Database\Seeder;

class IslamicEventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'event_name' => 'Shab e Meraj 2026',
                'event_date' => '2026-01-17',
                'hijri_date' => '27 Rajab 1447h',
                'hijri_month' => 'Rajab',
                'hijri_day' => 27,
                'event_type' => 'religious',
                'description' => 'Night of Ascension',
                'display_order' => 1,
            ],
            [
                'event_name' => 'Shab e Barat 2026',
                'event_date' => '2026-02-04',
                'hijri_date' => '15 Shaban 1447h',
                'hijri_month' => 'Shaban',
                'hijri_day' => 15,
                'event_type' => 'religious',
                'description' => 'Night of Forgiveness',
                'display_order' => 2,
            ],
            [
                'event_name' => 'Ramadan 2026',
                'event_date' => '2026-02-19',
                'hijri_date' => '1 Ramadan 1447h',
                'hijri_month' => 'Ramadan',
                'hijri_day' => 1,
                'event_type' => 'religious',
                'description' => 'First day of Ramadan',
                'display_order' => 3,
            ],
            [
                'event_name' => 'Laylat al Qadr 2026',
                'event_date' => '2026-03-17',
                'hijri_date' => '27 Ramadan 1447h',
                'hijri_month' => 'Ramadan',
                'hijri_day' => 27,
                'event_type' => 'special',
                'description' => 'Night of Power',
                'display_order' => 4,
            ],
            [
                'event_name' => 'Eid ul Fitr 2026',
                'event_date' => '2026-03-20',
                'hijri_date' => '1 Shawwal 1447h',
                'hijri_month' => 'Shawwal',
                'hijri_day' => 1,
                'event_type' => 'festival',
                'description' => 'Festival of Breaking Fast',
                'display_order' => 5,
            ],
            [
                'event_name' => 'Hajj 2026',
                'event_date' => '2026-05-24',
                'hijri_date' => '7 Dhul Hijjah 1447h',
                'hijri_month' => 'Dhul Hijjah',
                'hijri_day' => 7,
                'event_type' => 'religious',
                'description' => 'Day of Arafah',
                'display_order' => 6,
            ],
            [
                'event_name' => 'Eid al Adha 2026',
                'event_date' => '2026-05-27',
                'hijri_date' => '10 Dhul Hijjah 1447h',
                'hijri_month' => 'Dhul Hijjah',
                'hijri_day' => 10,
                'event_type' => 'festival',
                'description' => 'Festival of Sacrifice',
                'display_order' => 7,
            ],
            [
                'event_name' => 'Muharram 2026',
                'event_date' => '2026-06-16',
                'hijri_date' => '1 Muharram 1448h',
                'hijri_month' => 'Muharram',
                'hijri_day' => 1,
                'event_type' => 'religious',
                'description' => 'Islamic New Year',
                'display_order' => 8,
            ],
            [
                'event_name' => 'Ashura 2026',
                'event_date' => '2026-06-25',
                'hijri_date' => '10 Muharram 1448h',
                'hijri_month' => 'Muharram',
                'hijri_day' => 10,
                'event_type' => 'historical',
                'description' => 'Day of Ashura',
                'display_order' => 9,
            ],
            [
                'event_name' => '12 Rabi ul Awal 2026',
                'event_date' => '2026-08-25',
                'hijri_date' => '12 Rabi ul Awal 1448h',
                'hijri_month' => 'Rabi ul Awal',
                'hijri_day' => 12,
                'event_type' => 'festival',
                'description' => 'Birthday of Prophet Muhammad (PBUH)',
                'display_order' => 10,
            ],
        ];

        foreach ($events as $event) {
            IslamicEvent::updateOrCreate(
                ['event_name' => $event['event_name'], 'event_date' => $event['event_date']],
                $event
            );
        }
    }
}
