<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
            color: #333333;
        }

        .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eef2f5;
        }

        .header h2 {
            margin: 0;
            color: #1a202c;
            font-size: 22px;
            font-weight: 700;
        }

        .header p {
            margin: 5px 0 0 0;
            color: #718096;
            font-size: 14px;
        }

        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #2d3748;
            padding: 25px 0;
        }

        .otp-container {
            background-color: #f7fafc;
            border: 1px dashed #cbd5e0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
        }

        .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 6px;
            color: #3182ce;
            margin: 0;
        }

        .otp-hint {
            font-size: 13px;
            color: #a0aec0;
            margin-top: 8px;
        }

        .footer {
            margin-top: 20px;
            font-size: 13px;
            text-align: center;
            color: #a0aec0;
            border-top: 1px solid #eef2f5;
            padding-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>Email Verification</h2>
            <p>{{ $systemSetting?->site_name ?? $systemSetting?->site_title ?? config('app.name') }}</p>
        </div>
        <div class="content">
            <p>Hello {{ is_object($user) ? ($user->name ?? 'there') : (is_string($user) ? (\App\Models\User::where('email', $user)->value('name') ?? 'there') : 'there') }},</p>

            <p>Thank you for registering with <strong>{{ $systemSetting?->site_name ?? $systemSetting?->site_title ?? config('app.name') }}</strong>. Please use the verification code below to verify your email address:</p>

            <div class="otp-container">
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-hint">This code expires in 5 minutes. Do not share it with anyone.</div>
            </div>

            <p>If you did not create an account with us, please safely ignore this email.</p>

            <p>Best regards,<br>The {{ $systemSetting?->site_name ?? $systemSetting?->site_title ?? config('app.name') }} Team</p>
        </div>
        <div class="footer">
            @if($systemSetting?->address)
                <p>{{ $systemSetting->address }}</p>
            @endif
            <p>© {{ date('Y') }} {{ $systemSetting?->site_name ?? $systemSetting?->site_title ?? config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>

</html>