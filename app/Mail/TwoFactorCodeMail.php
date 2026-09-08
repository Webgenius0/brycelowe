<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;
    public string $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $code, string $userName = 'User')
    {
        $this->code = $code;
        $this->userName = $userName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Two-Factor Verification Code: {$this->code}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;'>
                    <h2 style='color: #0f172a; margin-bottom: 10px;'>Your Security Code</h2>
                    <p style='color: #475569; font-size: 14px;'>Hello {$this->userName},</p>
                    <p style='color: #475569; font-size: 14px;'>Use the following 6-digit one-time passcode to complete your login / verification:</p>
                    <div style='background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0f172a; border-radius: 6px; margin: 20px 0;'>
                        {$this->code}
                    </div>
                    <p style='color: #94a3b8; font-size: 12px;'>This code is valid for 5 minutes. If you did not request this code, please secure your account immediately.</p>
                </div>
            ",
        );
    }
}
