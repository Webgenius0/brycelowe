<?php

namespace App\Services;

use App\Notifications\CustomNotification;
use Illuminate\Support\Collection;

class NotificationService
{
    public function send($users, string $title, string $message, ?string $url = null, bool $mail = false)
    {
        if (!($users instanceof Collection)) {
            $users = collect([$users]);
        }
        foreach ($users as $user) {
            $user?->notify(
                new CustomNotification($title, $message, $url, $mail)
            );
        }
    }
}