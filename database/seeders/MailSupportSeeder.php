<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\ProspectEmail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MailSupportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Default Quick Templates
        $defaultTemplates = [
            [
                'title' => 'Follow up - Requested Info',
                'subject' => 'Information you requested regarding {Company Name}',
                'body' => "Hi {First Name},\n\nI wanted to follow up on the information you requested during our recent conversation. Please review the details below, and let me know if you have any questions or if you'd like to schedule a quick call.\n\nBest regards,\nPitchProX Team",
                'category' => 'Follow Up',
                'is_system' => true,
            ],
            [
                'title' => 'Market Update',
                'subject' => 'Latest Market Update & Insights for your area',
                'body' => "Hi {First Name},\n\nI hope you're doing well. I wanted to share our latest market update with key pricing trends and sales data in your target region. Let me know if you'd like a custom valuation report for {Property Address}.\n\nBest regards,\nPitchProX Team",
                'category' => 'Marketing',
                'is_system' => true,
            ],
            [
                'title' => 'Check-in',
                'subject' => 'Checking in regarding {Company Name}',
                'body' => "Hi {First Name},\n\nJust checking in to see if you had any more questions or if there is anything else I can help you with this week. Looking forward to hearing your thoughts.\n\nBest regards,\nPitchProX Team",
                'category' => 'General',
                'is_system' => true,
            ],
            [
                'title' => 'Thank You',
                'subject' => 'Thank you for your time today!',
                'body' => "Hi {First Name},\n\nThank you for taking the time to speak with me earlier today. It was great learning more about your goals at {Company Name}. I look forward to our next steps.\n\nBest regards,\nPitchProX Team",
                'category' => 'General',
                'is_system' => true,
            ],
        ];

        foreach ($defaultTemplates as $template) {
            EmailTemplate::updateOrCreate(
                ['title' => $template['title']],
                $template
            );
        }

        // 2. Sample Recent Emails (Matching the visual mockup in screenshot)
        $adminUser = User::first();
        $userId = $adminUser ? $adminUser->id : null;

        $recentEmails = [
            [
                'user_id' => $userId,
                'to' => 'sarah.johnson@email.com',
                'subject' => 'Follow up on your home sale',
                'message' => 'Hi Sarah, following up regarding the home valuation and potential listing schedule.',
                'status' => 'Sent',
                'is_tracked' => true,
                'sent_at' => Carbon::now()->subHours(2)->subMinutes(15),
            ],
            [
                'user_id' => $userId,
                'to' => 'mike.thompson@email.com',
                'subject' => 'Market update for your area',
                'message' => 'Hi Mike, here is the latest neighborhood comparative market analysis.',
                'status' => 'Opened',
                'is_tracked' => true,
                'opened_at' => Carbon::now()->subHours(4),
                'sent_at' => Carbon::now()->subHours(5),
            ],
            [
                'user_id' => $userId,
                'to' => 'linda.perez@email.com',
                'subject' => 'Information you requested',
                'message' => 'Hi Linda, attaching the requested contract breakdown and seller disclosures.',
                'status' => 'Sent',
                'is_tracked' => true,
                'sent_at' => Carbon::yesterday()->setHour(14)->setMinute(20),
            ],
            [
                'user_id' => $userId,
                'to' => 'robert.davis@email.com',
                'subject' => 'Checking in',
                'message' => 'Hi Robert, checking in on the financing status for the new listing.',
                'status' => 'Draft',
                'is_tracked' => false,
                'created_at' => Carbon::yesterday()->setHour(16)->setMinute(10),
            ],
            [
                'user_id' => $userId,
                'to' => 'jennifer.wilson@email.com',
                'subject' => 'Home valuation follow up',
                'message' => 'Hi Jennifer, thank you for providing the property specs. Here is the valuation report.',
                'status' => 'Opened',
                'is_tracked' => true,
                'opened_at' => Carbon::now()->subDays(4),
                'sent_at' => Carbon::now()->subDays(5),
            ],
        ];

        foreach ($recentEmails as $email) {
            ProspectEmail::create($email);
        }
    }
}
