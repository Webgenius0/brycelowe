<?php

namespace Database\Seeders;

use App\Models\NotificationChannel;
use Illuminate\Database\Seeder;

class NotificationChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $channels = [
            [
                'title' => 'In-App Notifications',
                'description' => 'Receive real-time notifications directly within the app interface.',
                'logo' => null,
                'channel_type' => NotificationChannel::TYPE_IN_APP,
                'is_active' => true,
            ],
            [
                'title' => 'Call Reminders',
                'description' => 'Receive prompt reminders before scheduled calls and meetings.',
                'logo' => null,
                'channel_type' => NotificationChannel::TYPE_CALL_REMAINDER,
                'is_active' => true,
            ],
            [
                'title' => 'Follow-Up Reminders',
                'description' => 'Get alerts when it is time to follow up with prospect leads.',
                'logo' => null,
                'channel_type' => NotificationChannel::TYPE_FOLLOW_UP,
                'is_active' => true,
            ],
            [
                'title' => 'AI Insights',
                'description' => 'Receive AI performance analytics, coaching notes, and trust score insights.',
                'logo' => null,
                'channel_type' => NotificationChannel::TYPE_AI_INSIGHT,
                'is_active' => true,
            ],
            [
                'title' => 'Billing & Invoices',
                'description' => 'Stay updated on monthly statements, usage overages, and payment receipts.',
                'logo' => null,
                'channel_type' => NotificationChannel::TYPE_BILLING,
                'is_active' => true,
            ],
            [
                'title' => 'Product Updates',
                'description' => 'Be the first to learn about new platform features, updates, and releases.',
                'logo' => null,
                'channel_type' => NotificationChannel::TYPE_PRODUCT,
                'is_active' => true,
            ],
        ];

        foreach ($channels as $channel) {
            NotificationChannel::firstOrCreate(
                ['channel_type' => $channel['channel_type']],
                $channel
            );
        }
    }
}
