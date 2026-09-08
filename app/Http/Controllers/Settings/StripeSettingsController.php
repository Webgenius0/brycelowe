<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StripeSettingsController extends Controller
{
    public function edit()
    {
        return Inertia::render('settings/stripe', [
            'stripe' => [
                'publishable_key' => $this->maskKey(config('stripe.publishable_key')),
                'secret_key' => $this->maskKey(config('stripe.secret_key')),
                'webhook_secret' => $this->maskKey(config('stripe.webhook_secret')),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'publishable_key' => 'required|string|starts_with:pk_',
            'secret_key' => 'required|string|starts_with:sk_',
            'webhook_secret' => 'required|string|starts_with:whsec_',
        ]);

        $this->updateEnvValue('STRIPE_PUBLISHABLE_KEY', $request->publishable_key);
        $this->updateEnvValue('STRIPE_SECRET_KEY', $request->secret_key);
        $this->updateEnvValue('STRIPE_WEBHOOK_SECRET', $request->webhook_secret);

        return back()->with('success', 'Stripe settings updated successfully.');
    }

    private function maskKey(?string $key): string
    {
        if (! $key || strlen($key) < 12) {
            return '••••••••••••';
        }

        return substr($key, 0, 7).'••••••••'.substr($key, -4);
    }

    private function updateEnvValue(string $key, string $value): void
    {
        $envPath = base_path('.env');
        $contents = file_get_contents($envPath);

        $pattern = "/^{$key}=.*/m";

        if (preg_match($pattern, $contents)) {
            $contents = preg_replace($pattern, "{$key}={$value}", $contents);
        } else {
            $contents .= "\n{$key}={$value}";
        }

        file_put_contents($envPath, $contents);
    }
}
