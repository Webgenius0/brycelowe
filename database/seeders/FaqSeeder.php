<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('faqs')->insert([
            [
                'serial' => 1,
                'question' => 'What is Memoooxy and how does it work?',
                'answer'   => '<p><strong>Memoooxy</strong> is a premium membership pass platform that gives subscribers exclusive access to top local attractions, restaurants, resorts, fitness centres, and more.</p><p>Here\'s how it works:</p><ul><li>Choose a <strong>membership pass</strong> (Basic or VIP Pro)</li><li>Use your digital pass at any <strong>partner attraction</strong></li><li>Earn <strong>reward points</strong> on every visit</li><li>Enjoy exclusive <strong>member-only discounts</strong> and perks</li></ul>',
                'status'   => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'serial' => 2,
                'question' => 'How do I activate my membership pass?',
                'answer'   => '<p>Activating your Memoooxy pass is simple and instant:</p><ol><li>Create or log in to your <strong>Memoooxy account</strong></li><li>Go to <strong>Membership</strong> and select your preferred pass</li><li>Complete payment via <strong>Stripe</strong> (card or saved method)</li><li>Your pass is <strong>instantly activated</strong> — no waiting, no printing</li></ol><p>Show your digital pass on your phone at any partner location and you\'re good to go!</p>',
                'status'   => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'serial' => 3,
                'question' => 'Which attractions are included in my pass?',
                'answer'   => '<p>The attractions available depend on your pass tier:</p><ul><li><strong>Basic Pass:</strong> Access to 3 curated partner attractions per billing cycle</li><li><strong>VIP Pro Pass:</strong> Unlimited access to <em>all</em> partner attractions including premium resorts, fine dining, spas, fitness centres, and nightlife venues</li></ul><p>Browse the full list of participating partners in the <strong>Attractions</strong> section of your dashboard after logging in.</p>',
                'status'   => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'serial' => 4,
                'question' => 'How do reward points work?',
                'answer'   => '<p>Every time you visit a partner attraction using your Memoooxy pass, you automatically earn <strong>reward points</strong>:</p><ul><li>Points are credited to your account after each <strong>verified visit</strong></li><li>VIP Pro members earn <strong>up to 3× more points</strong> per visit</li><li>Accumulated points can be <strong>redeemed for discounts</strong>, free entries, and exclusive rewards</li></ul><p>Track your points balance and redemption history in the <strong>My Rewards</strong> section of your profile.</p>',
                'status'   => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'serial' => 5,
                'question' => 'Can I cancel or upgrade my membership?',
                'answer'   => '<p>Yes! You have full flexibility with your Memoooxy membership:</p><ul><li><strong>Upgrade</strong> from Basic to VIP Pro at any time — your billing cycle adjusts automatically</li><li><strong>Cancel</strong> your membership from your Account Settings with one click</li><li>Cancellations take effect at the <strong>end of your current billing period</strong> — you keep access until then</li></ul><p>For any billing questions, please contact our support team through the <strong>Contact Us</strong> page.</p>',
                'status'   => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'serial' => 6,
                'question' => 'What payment methods are accepted?',
                'answer'   => '<p>Memoooxy uses <strong>Stripe</strong> for all payment processing, supporting:</p><ul><li>All major <strong>credit &amp; debit cards</strong> (Visa, Mastercard, Amex)</li><li><strong>Apple Pay</strong> and <strong>Google Pay</strong> on supported devices</li><li>Saved payment methods for <strong>seamless recurring billing</strong></li></ul><p>All transactions are <strong>encrypted and PCI-DSS compliant</strong>. We never store your full card details on our servers.</p>',
                'status'   => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
