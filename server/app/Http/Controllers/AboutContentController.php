<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AboutContentController extends Controller
{
    private $storageFile;

    public function __construct()
    {
        $this->storageFile = storage_path('app/about-content.json');
    }

    private function defaultContent(): array
    {
        return [
            'heroBadge' => 'Welcome to',
            'heroTitle' => 'Ad-Diin Mosque',
            'heroDescription' => 'A spiritual home dedicated to worship, education, and community service. We strive to strengthen Islamic values and foster unity among Muslims in Dhaka.',
            'stats' => [
                ['value' => '5+', 'label' => 'Daily Prayers'],
                ['value' => '500+', 'label' => 'Community Members'],
                ['value' => '20+', 'label' => 'Monthly Programs'],
                ['value' => '10+', 'label' => 'Years Serving'],
            ],
            'missionTitle' => 'Our Mission',
            'missionDescription' => 'To establish a vibrant Islamic center that serves as a beacon of faith, knowledge, and compassion. We aim to provide a welcoming space for worship, learning, and community engagement while supporting those in need.',
            'visionTitle' => 'Our Vision',
            'visionDescription' => 'To be recognized as a leading Islamic institution that nurtures spiritual growth, promotes Islamic values, and creates positive change in our community through education, charity, and unity.',
            'valuesTitle' => 'Core Values',
            'valuesDescription' => 'The principles that guide everything we do at Ad-Diin Mosque',
            'values' => [
                ['title' => 'Knowledge', 'description' => 'We promote Islamic education and understanding through Quran classes and lectures.'],
                ['title' => 'Community', 'description' => 'Building a strong Muslim community through regular gatherings and support.'],
                ['title' => 'Compassion', 'description' => 'Serving those in need through charity, donations, and welfare programs.'],
                ['title' => 'Faith', 'description' => 'Encouraging spiritual growth and devotion through daily prayers and worship.'],
            ],
            'programsTitle' => 'Our Programs',
            'programsDescription' => '',
            'programs' => [
                ['title' => 'Daily Prayers & Jamaat', 'description' => 'Five daily prayers with congregation, Friday Jummah prayers, and special Taraweeh prayers during Ramadan.'],
                ['title' => 'Islamic Education', 'description' => 'Quran recitation classes, Hadith study circles, Arabic language courses, and youth Islamic education programs.'],
                ['title' => 'Community Events', 'description' => 'Eid celebrations, Milad-un-Nabi gatherings, Iftar programs during Ramadan, and regular community dinners.'],
                ['title' => 'Social Welfare', 'description' => 'Zakat distribution, food donations for the needy, support for orphans, and assistance for struggling families.'],
            ],
            'communityHeadsTitle' => 'Community Heads',
            'communityHeadsDescription' => 'Mojid community leadership members who guide and support the mosque community',
            'communityHeads' => [
                ['name' => 'Mojid Uddin', 'role' => 'Community Head', 'phone' => '+880 1000 000001'],
                ['name' => 'Abdul Karim', 'role' => 'Assistant Head', 'phone' => '+880 1000 000002'],
                ['name' => 'Nurul Islam', 'role' => 'Coordinator', 'phone' => '+880 1000 000003'],
            ],
            'ctaTitle' => 'Join Our Community',
            'ctaDescription' => "Whether you're new to the area or looking for a spiritual home, we welcome you with open arms.",
        ];
    }

    private function normalize(array $content): array
    {
        $default = $this->defaultContent();
        $merged = array_merge($default, $content);

        $merged['stats'] = is_array($content['stats'] ?? null) && count($content['stats']) > 0 ? array_values($content['stats']) : $default['stats'];
        $merged['values'] = is_array($content['values'] ?? null) && count($content['values']) > 0 ? array_values($content['values']) : $default['values'];
        $merged['programs'] = is_array($content['programs'] ?? null) && count($content['programs']) > 0 ? array_values($content['programs']) : $default['programs'];
        $merged['communityHeads'] = is_array($content['communityHeads'] ?? null) && count($content['communityHeads']) > 0 ? array_values($content['communityHeads']) : $default['communityHeads'];

        return $merged;
    }

    private function readContent(): array
    {
        if (!file_exists($this->storageFile)) {
            return $this->defaultContent();
        }

        $raw = file_get_contents($this->storageFile);
        $decoded = json_decode($raw ?: '', true);

        if (!is_array($decoded)) {
            return $this->defaultContent();
        }

        return $this->normalize($decoded);
    }

    private function writeContent(array $content): array
    {
        $normalized = $this->normalize($content);

        if (!is_dir(dirname($this->storageFile))) {
            mkdir(dirname($this->storageFile), 0775, true);
        }

        file_put_contents($this->storageFile, json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        return $normalized;
    }

    public function show()
    {
        return response()->json([
            'success' => true,
            'data' => $this->readContent(),
        ]);
    }

    public function update(Request $request)
    {
        $updated = $this->writeContent($request->all());

        return response()->json([
            'success' => true,
            'data' => $updated,
        ]);
    }
}