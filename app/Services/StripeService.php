<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Stripe\Charge;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('stripe.secret_key'));
    }

    /*
    |--------------------------------------------------------------------------
    | Create Stripe Checkout Session
    |--------------------------------------------------------------------------
    */

    public function createCheckoutSession(Order $order, ?int $userId = null): array
    {
        try {

            $lineItems = [];

            if ($order->discount > 0) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => config('services.stripe.currency', 'gbp'),
                        'product_data' => [
                            'name' => 'Order Total (Discount Applied)',
                        ],
                        'unit_amount' => (int) round($order->total * 100),
                    ],
                    'quantity' => 1,
                ];
            } else {
                foreach ($order->items as $item) {
                    $lineItems[] = [
                        'price_data' => [
                            'currency' => config('services.stripe.currency', 'gbp'),
                            'product_data' => [
                                'name' => $item->product_name,
                            ],
                            'unit_amount' => (int) round($item->price * 100),
                        ],
                        'quantity' => $item->quantity,
                    ];
                }

                if ($order->plates && $order->plates->count() > 0) {
                    foreach ($order->plates as $plate) {
                        $lineItems[] = [
                            'price_data' => [
                                'currency' => config('services.stripe.currency', 'gbp'),
                                'product_data' => [
                                    'name' => "Plate: {$plate->plate_text}",
                                ],
                                'unit_amount' => (int) round($plate->price * 100),
                            ],
                            'quantity' => 1,
                        ];
                    }
                }

                $fittingTotal = 0;
                if ($order->consider_fitting) {
                    if ($order->fitting_ids && count($order->fitting_ids) > 0) {
                        $fittingTotal = (float) \App\Models\FittingRequest::whereIn('id', $order->fitting_ids)->sum('price');
                    } else {
                        foreach ($order->items as $item) {
                            $product = \App\Models\Product::find($item->product_id);
                            if ($product && $product->fitting_available && $product->fitting_price_from) {
                                $fittingTotal += (float) $product->fitting_price_from * $item->quantity;
                            }
                        }
                    }
                }

                if ($fittingTotal > 0) {
                    $lineItems[] = [
                        'price_data' => [
                            'currency' => config('services.stripe.currency', 'gbp'),
                            'product_data' => [
                                'name' => 'Fitting Service',
                            ],
                            'unit_amount' => (int) round($fittingTotal * 100),
                        ],
                        'quantity' => 1,
                    ];
                }

                if ($order->shipping_cost > 0) {
                    $lineItems[] = [
                        'price_data' => [
                            'currency' => config('services.stripe.currency', 'gbp'),
                            'product_data' => [
                                'name' => 'Shipping Cost',
                            ],
                            'unit_amount' => (int) round($order->shipping_cost * 100),
                        ],
                        'quantity' => 1,
                    ];
                }
            }

            $session = Session::create([

                'payment_method_types' => ['card'],

                'mode' => 'payment',

                'customer_email' => $order->guest_email,

                'line_items' => $lineItems,

                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ],

                'success_url' => env('FRONTEND_URL')
                    .'/payment-success?session_id={CHECKOUT_SESSION_ID}',

                'cancel_url' => env('FRONTEND_URL')
                    .'/payment-cancel?order_id='.$order->id,
            ]);

            $payment = Payment::updateOrCreate(
                [
                    'order_id' => $order->id,
                ],
                [
                    'user_id' => $userId,
                    'amount' => $order->total,
                    'currency' => config('stripe.currency', 'gbp'),
                    'status' => 'pending',
                    'stripe_checkout_session_id' => $session->id,
                ]
            );

            $order->update([
                'stripe_session_id' => $session->id,
            ]);

            return [
                'success' => true,
                'checkout_url' => $session->url,
                'session_id' => $session->id,
                'payment_id' => $payment->id,
            ];

        } catch (\Exception $e) {

            Log::error('Stripe Checkout Session Failed', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Confirm Stripe Payment
    |--------------------------------------------------------------------------
    */

    public function confirmPayment(string $sessionId): array
    {
        try {

            $session = Session::retrieve($sessionId);

            if ($session->payment_status !== 'paid') {

                return [
                    'success' => false,
                    'message' => 'Payment not completed',
                ];
            }

            $order = Order::find($session->metadata->order_id);

            if (! $order) {

                return [
                    'success' => false,
                    'message' => 'Order not found',
                ];
            }

            $payment = Payment::where(
                'stripe_checkout_session_id',
                $session->id
            )->first();

            $receiptUrl = null;

            if ($session->payment_intent) {

                $paymentIntent = PaymentIntent::retrieve(
                    $session->payment_intent
                );

                if (! empty($paymentIntent->latest_charge)) {

                    $charge = Charge::retrieve(
                        $paymentIntent->latest_charge
                    );

                    $receiptUrl = $charge->receipt_url ?? null;

                    if ($payment) {
                        $paymentMethodType = $charge->payment_method_details->type ?? null;
                        $cardBrand = null;
                        $cardLastFour = null;
                        if ($paymentMethodType === 'card' && !empty($charge->payment_method_details->card)) {
                            $cardBrand = $charge->payment_method_details->card->brand ?? null;
                            $cardLastFour = $charge->payment_method_details->card->last4 ?? null;
                        }

                        $payment->update([
                            'receipt_url' => $receiptUrl,
                            'stripe_payment_intent_id' => $paymentIntent->id,
                            'stripe_payment_method_id' => $paymentIntent->payment_method,
                            'stripe_customer_id' => $paymentIntent->customer,
                            'status' => 'succeeded',
                            'paid_at' => now(),
                            'payment_method_type' => $paymentMethodType,
                            'card_brand' => $cardBrand,
                            'card_last_four' => $cardLastFour,
                        ]);
                    }
                }
            }

            $isAlreadyPaid = $order->payment_status === 'paid';

            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
            ]);

            if (!$isAlreadyPaid) {
                if ($order->user) {
                    $order->user->notify(new \App\Notifications\NewOrderNotification($order, false));
                } else if ($order->guest_email) {
                    \Illuminate\Support\Facades\Notification::route('mail', $order->guest_email)
                        ->notify(new \App\Notifications\NewOrderNotification($order, false));
                }

                $admins = \App\Models\User::where('role', 'Admin')->get();
                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\NewOrderNotification($order, true));
                }
            }

            if ($order->user_id) {
                $cart = \App\Models\Cart::where('user_id', $order->user_id)->first();
                if ($cart) {
                    $cart->items()->delete();
                    $cart->delete();
                }
            }

            return [
                'success' => true,
                'order' => $order,
                'receipt_url' => $receiptUrl,
            ];

        } catch (\Exception $e) {

            Log::error('Stripe Confirm Payment Failed', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Webhook
    |--------------------------------------------------------------------------
    */

    public function handleWebhookEvent(
        string $payload,
        string $sigHeader
    ): array {

        try {

            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('stripe.webhook_secret')
            );

        } catch (\Exception $e) {

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }

        if ($event->type === 'checkout.session.completed') {

            $session = $event->data->object;

            $this->confirmPayment($session->id);
        }

        return [
            'success' => true,
            'event' => $event->type,
        ];
    }
}
