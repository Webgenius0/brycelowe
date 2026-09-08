<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\PayoutHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    /**
     * Handle incoming Stripe Webhooks.
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = env('STRIPE_WEBHOOK_SECRET');

        $event = null;

        if ($endpointSecret && class_exists('\Stripe\Webhook')) {
            try {
                $event = \Stripe\Webhook::constructEvent(
                    $payload,
                    $sigHeader,
                    $endpointSecret
                );
            } catch (\UnexpectedValueException $e) {
                return response()->json(['error' => 'Invalid payload'], 400);
            } catch (\Stripe\Exception\SignatureVerificationException $e) {
                return response()->json(['error' => 'Invalid signature'], 400);
            }
        } else {
            $event = json_decode($payload);
        }

        if (!$event) {
            return response()->json(['error' => 'Event parse error'], 400);
        }

        $eventType = $event->type ?? null;
        $dataObject = $event->data->object ?? null;

        Log::info("Stripe Webhook Received: {$eventType}");

        switch ($eventType) {
            case 'account.updated':
                $this->handleAccountUpdated($dataObject);
                break;

            case 'transfer.created':
                $this->handleTransferCreated($dataObject);
                break;

            case 'transfer.failed':
            case 'payout.failed':
                $this->handleTransferFailed($dataObject);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    protected function handleAccountUpdated($account)
    {
        if (!$account || empty($account->id)) {
            return;
        }

        $user = User::where('stripe_connect_id', $account->id)->first();
        if ($user) {
            $isReady = !empty($account->payouts_enabled) || !empty($account->charges_enabled);
            $user->update([
                'stripe_connect_active' => $isReady,
            ]);
            Log::info("Partner #{$user->id} Stripe Connect active status updated to: " . ($isReady ? 'true' : 'false'));
        }
    }

    protected function handleTransferCreated($transfer)
    {
        if (!$transfer || empty($transfer->id)) {
            return;
        }

        Log::info("Stripe Transfer created: {$transfer->id} for destination: " . ($transfer->destination ?? 'N/A'));
    }

    protected function handleTransferFailed($transfer)
    {
        if (!$transfer) {
            return;
        }

        $transferId = $transfer->id ?? null;
        $payout = PayoutHistory::where('stripe_transfer_id', $transferId)->first();

        if ($payout && $payout->status !== 'rejected') {
            // Auto-refund points back to partner balance
            $partner = User::find($payout->user_id);
            if ($partner && $payout->amount > 0) {
                $partner->increment('points', (int) $payout->amount);
            }

            $payout->update([
                'status' => 'rejected',
                'note' => ($payout->note ? $payout->note . ' | ' : '') . 'Transfer failed on Stripe. Points refunded to balance.',
            ]);

            Log::warning("Stripe Transfer failed for Payout #{$payout->id}. Points refunded to partner #{$payout->user_id}.");
        }
    }
}
