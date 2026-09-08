<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MailSettingsController extends Controller
{
    public function edit()
    {
        return Inertia::render('settings/mail', [
            'setting' => [
                'mailer' => env('MAIL_MAILER'),
                'host' => env('MAIL_HOST'),
                'port' => env('MAIL_PORT'),
                'username' => env('MAIL_USERNAME'),
                'from_address' => env('MAIL_FROM_ADDRESS'),
                'encryption' => env('MAIL_ENCRYPTION'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'mailer' => 'required|string|max:50',
            'host' => 'required|string|max:255',
            'port' => 'required|string|max:10',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'from_address' => 'required|email',
            'encryption' => 'nullable|string|max:20',
        ]);

        $this->setEnv('MAIL_MAILER', $request->mailer);
        $this->setEnv('MAIL_HOST', $request->host);
        $this->setEnv('MAIL_PORT', $request->port);
        $this->setEnv('MAIL_USERNAME', $request->username);
        $this->setEnv('MAIL_ENCRYPTION', $request->encryption);
        $this->setEnv('MAIL_FROM_ADDRESS', $request->from_address);

        // Only update password if provided
        if ($request->filled('password')) {
            $this->setEnv('MAIL_PASSWORD', $request->password);
        }

        // Optional: set from name
        $this->setEnv('MAIL_FROM_NAME', config('app.name'));

        // Clear config cache so changes apply
        \Artisan::call('config:clear');
        \Artisan::call('cache:clear');

        return back()->with('success', 'Mail settings updated in .env successfully.');
    }

    private function setEnv($key, $value)
    {
        $path = base_path('.env');

        if (! file_exists($path)) {
            return;
        }

        $value = '"'.addslashes($value).'"';

        $env = file_get_contents($path);

        // If key exists → replace
        if (preg_match("/^{$key}=.*/m", $env)) {
            $env = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $env);
        } else {
            // If not exists → append
            $env .= "\n{$key}={$value}";
        }

        file_put_contents($path, $env);
    }
}
