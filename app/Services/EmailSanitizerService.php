<?php

namespace App\Services;

class EmailSanitizerService
{
    /**
     * Exact blocked / dummy email addresses (case-insensitive).
     */
    protected static array $blockedEmails = [
        'user@user.com',
        'admin@admin.com',
        'user@gmail.com',
        'admin@gmail.com',
        'test@test.com',
        'test@gmail.com',
        'demo@gmail.com',
        'demo@demo.com',
        'sample@sample.com',
        'user@example.com',
        'admin@example.com',
        'test@example.com',
    ];

    /**
     * Blocked email domains (e.g., example.com, test.com, user.com).
     */
    protected static array $blockedDomains = [
        'example.com',
        'example.org',
        'example.net',
        'user.com',
        'admin.com',
        'test.com',
        'mailinator.com',
        'tempmail.com',
        '10minutemail.com',
        'yopmail.com',
    ];

    /**
     * Blocked patterns (regex).
     */
    protected static array $blockedPatterns = [
        '/^test[0-9]*@/i',
        '/^dummy[0-9]*@/i',
        '/^fake[0-9]*@/i',
        '/^sample[0-9]*@/i',
    ];

    /**
     * Check if a given email address is a dummy/test email that should never receive emails.
     */
    public static function isBlocked(string $email): bool
    {
        $email = strtolower(trim($email));

        if (empty($email)) {
            return true;
        }

        // 1. Exact match check
        if (in_array($email, static::$blockedEmails, true)) {
            return true;
        }

        // 2. Domain check
        $parts = explode('@', $email);
        if (count($parts) === 2) {
            $domain = $parts[1];
            if (in_array($domain, static::$blockedDomains, true)) {
                return true;
            }
        }

        // 3. Pattern check
        foreach (static::$blockedPatterns as $pattern) {
            if (preg_match($pattern, $email)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if an email is safe to send to.
     */
    public static function isSafe(string $email): bool
    {
        return !static::isBlocked($email);
    }
}
