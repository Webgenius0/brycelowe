<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public string $title;
    public string $message;
    public ?string $url;
    public bool $sendMail;

    public function __construct(
        string $title,
        string $message,
        ?string $url = null,
        bool $sendMail = false
    ) {
        $this->title = $title;
        $this->message = $message;
        $this->url = $url;
        $this->sendMail = $sendMail;
    }

    public function via($notifiable): array
    {
        return $this->sendMail ? ['database', 'mail'] : ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->title)
            ->greeting('Hello ' . ($notifiable->name ?? 'Admin'));

        $lines = explode("\n", $this->message);
        foreach ($lines as $line) {
            $mail->line($line);
        }

        if ($this->url) {
            $mail->action('View Details', url($this->url));
        }

        return $mail;
    }
}