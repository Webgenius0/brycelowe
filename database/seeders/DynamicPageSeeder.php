<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DynamicPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'page_title'    => 'Terms & Conditions',
                'page_subtitle' => 'Please read these terms carefully before using your Memoooxy membership.',
                'slug'          => 'terms-and-conditions',
                'page_content'  => '<h2>1. Acceptance of Terms</h2><p>By registering for or using a <strong>Memoooxy</strong> membership pass, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you may not use our services.</p><h2>2. Membership & Access</h2><p>Your Memoooxy membership grants you access to a curated network of partner attractions based on your selected pass tier (Basic or VIP Pro). Access is personal, non-transferable, and valid only for the registered account holder.</p><h2>3. Billing & Renewals</h2><p>Memberships are billed on a recurring monthly basis via <strong>Stripe</strong>. Your subscription automatically renews at the end of each billing cycle unless cancelled before the renewal date. You are responsible for ensuring your payment method remains valid.</p><h2>4. Cancellations & Refunds</h2><p>You may cancel your membership at any time from your account settings. Cancellations take effect at the end of your current billing period — you retain full access until then. Refunds are not issued for partial billing periods.</p><h2>5. Partner Attractions</h2><p>Memoooxy partners with independent venues and attractions. While we curate and verify all partners, we are not liable for the quality, safety, or availability of services provided by partner businesses. Partner listings and perks are subject to change.</p><h2>6. Intellectual Property</h2><p>All content, trademarks, and data on this platform, including text, graphics, logos, and software, are the property of Memoooxy and are protected by applicable intellectual property laws.</p><h2>7. Changes to Terms</h2><p>We reserve the right to modify these terms at any time. Continued use of the services after changes are posted constitutes your acceptance of the revised terms. We will notify members of material changes via email.</p><h2>8. Contact Us</h2><p>If you have any questions about these Terms and Conditions, please contact us through our <strong>Contact Us</strong> page or email us directly at support@memoooxy.com.</p>',
                'status'        => 'Active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'page_title'    => 'Privacy Policy',
                'page_subtitle' => 'Your privacy is important to us. Learn how Memoooxy collects and uses your data.',
                'slug'          => 'privacy-policy',
                'page_content'  => '<h2>1. Information We Collect</h2><p>We collect information you provide directly to us when you create an account, subscribe to a membership pass, or contact us for support. This may include your <strong>name, email address, phone number, and payment information</strong>.</p><h2>2. How We Use Your Information</h2><p>We use the information we collect to:</p><ul><li>Provide, maintain, and improve your Memoooxy membership experience</li><li>Process subscription payments via Stripe</li><li>Send transactional emails (receipts, renewal notices, and password resets)</li><li>Send promotional updates about new partner attractions (you can opt out at any time)</li><li>Comply with legal obligations</li></ul><h2>3. Sharing of Information</h2><p>We do not sell or rent your personal information to third parties. We may share your information with:</p><ul><li><strong>Payment processors</strong> (Stripe) to handle billing securely</li><li><strong>Partner attractions</strong> only to the extent necessary to validate your membership access</li><li><strong>Legal authorities</strong> if required by law</li></ul><h2>4. Cookies</h2><p>We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookies through your browser settings, though disabling them may affect certain features of the site.</p><h2>5. Data Security</h2><p>We implement <strong>industry-standard security measures</strong> including SSL encryption, tokenised payments via Stripe, and access controls to protect your personal information from unauthorised access, disclosure, or destruction.</p><h2>6. Your Rights</h2><p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us at privacy@memoooxy.com.</p><h2>7. Contact Us</h2><p>If you have any questions about this Privacy Policy, please reach out via our <strong>Contact Us</strong> page or email us at privacy@memoooxy.com.</p>',
                'status'        => 'Active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'page_title'    => 'Refund Policy',
                'page_subtitle' => 'Our commitment to fair and transparent refund procedures for Memoooxy members.',
                'slug'          => 'refund-policy',
                'page_content'  => '<h2>General Refund Policy</h2><p>At Memoooxy, we are committed to ensuring you have a great membership experience. We handle all refund requests fairly and on a case-by-case basis.</p><h2>Eligibility for Refunds</h2><p>You may be eligible for a refund if:</p><ul><li>You were charged incorrectly due to a <strong>billing error</strong></li><li>Your membership was <strong>not activated</strong> after a successful payment</li><li>A technical issue on our end prevented you from accessing partner attractions</li></ul><h2>Non-Refundable Items</h2><p>The following are generally <strong>not eligible</strong> for refunds:</p><ul><li>Partially used billing periods after cancellation</li><li>Memberships cancelled mid-cycle (access continues until the period ends)</li><li>Cases where you simply changed your mind after using the membership benefits</li></ul><h2>How to Request a Refund</h2><p>To request a refund, please contact our support team within <strong>7 days</strong> of the charge via our Contact Us page. Include your account email and a brief description of the issue. We will review and respond within <strong>3 business days</strong>.</p><h2>Processing Time</h2><p>Approved refunds are processed within <strong>5–10 business days</strong> to your original payment method via Stripe.</p><h2>Contact Us</h2><p>For any refund-related queries, please get in touch through the <strong>Contact Us</strong> page or email billing@memoooxy.com.</p>',
                'status'        => 'Active',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ];

        DB::table('dynamic_pages')->insert($pages);
    }
}
