<?php

namespace App\Listeners;

use App\Services\EmailSanitizerService;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mime\Address;

class BlockTestEmailsListener
{
    /**
     * Handle the MessageSending event.
     *
     * Returning false from this listener stops the email from being sent.
     */
    public function handle(MessageSending $event): ?bool
    {
        $message = $event->message;

        /** @var Address[] $toRecipients */
        $toRecipients = $message->getTo() ?? [];
        $validTo = [];
        $blockedTo = [];

        foreach ($toRecipients as $address) {
            $email = $address->getAddress();
            if (EmailSanitizerService::isBlocked($email)) {
                $blockedTo[] = $email;
            } else {
                $validTo[] = $address;
            }
        }

        // If all recipients are blocked, completely abort email sending
        if (empty($validTo)) {
            Log::info(
                '[EmailSanitizer] Blocked outgoing email to dummy/test address(es): ' .
                implode(', ', $blockedTo) .
                ' | Subject: "' . ($message->getSubject() ?? '(No Subject)') . '"'
            );

            return false;
        }

        // If only some recipients are blocked, filter out the blocked ones
        if (!empty($blockedTo)) {
            Log::info(
                '[EmailSanitizer] Removed dummy/test address(es) from recipient list: ' .
                implode(', ', $blockedTo)
            );
            $message->to(...$validTo);
        }

        // Also clean Cc recipients if any
        $ccRecipients = $message->getCc() ?? [];
        if (!empty($ccRecipients)) {
            $validCc = array_filter($ccRecipients, fn (Address $addr) => !EmailSanitizerService::isBlocked($addr->getAddress()));
            $message->cc(...$validCc);
        }

        // Also clean Bcc recipients if any
        $bccRecipients = $message->getBcc() ?? [];
        if (!empty($bccRecipients)) {
            $validBcc = array_filter($bccRecipients, fn (Address $addr) => !EmailSanitizerService::isBlocked($addr->getAddress()));
            $message->bcc(...$validBcc);
        }

        return true;
    }
}
