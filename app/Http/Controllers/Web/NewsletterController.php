<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use App\Services\EmailSanitizerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterController extends Controller
{
    /**
     * Display the newsletter management dashboard page.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $query = NewsletterSubscriber::query()
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('email', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('source', 'like', "%{$search}%");
                });
            })
            ->when($status && $status !== 'all', function ($q) use ($status) {
                $q->where('status', $status);
            });

        $subscribers = $query->latest('id')->paginate(10)->withQueryString();

        $stats = [
            'total' => NewsletterSubscriber::count(),
            'subscribed' => NewsletterSubscriber::where('status', 'subscribed')->count(),
            'unsubscribed' => NewsletterSubscriber::where('status', 'unsubscribed')->count(),
            'campaigns' => NewsletterCampaign::count(),
        ];

        $recentCampaigns = NewsletterCampaign::latest('id')->limit(6)->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'subject' => $c->subject,
                'content' => $c->content,
                'recipients_count' => $c->recipients_count,
                'status' => $c->status,
                'sent_at' => $c->sent_at ? $c->sent_at->format('M d, Y H:i') : 'Draft',
            ];
        });

        return Inertia::render('newsletter/index', [
            'subscribers' => $subscribers,
            'stats' => $stats,
            'recentCampaigns' => $recentCampaigns,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
            ],
        ]);
    }

    /**
     * Store a new subscriber (Admin or Public).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:100',
            'source' => 'nullable|string|max:50',
        ]);

        $email = strtolower(trim($validated['email']));

        $existing = NewsletterSubscriber::where('email', $email)->first();

        if ($existing) {
            if ($existing->status === 'unsubscribed') {
                $existing->update([
                    'status' => 'subscribed',
                    'subscribed_at' => now(),
                    'unsubscribed_at' => null,
                ]);

                return back()->with('success', 'Subscriber has been re-activated.');
            }

            return back()->with('info', 'This email is already subscribed.');
        }

        NewsletterSubscriber::create([
            'email' => $email,
            'name' => $validated['name'] ?? null,
            'source' => $validated['source'] ?? 'Dashboard',
            'status' => 'subscribed',
            'ip_address' => $request->ip(),
            'subscribed_at' => now(),
        ]);

        return back()->with('success', 'New subscriber added successfully.');
    }

    /**
     * Toggle subscriber status (subscribed / unsubscribed).
     */
    public function toggleStatus($id): RedirectResponse
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $newStatus = $subscriber->status === 'subscribed' ? 'unsubscribed' : 'subscribed';

        $subscriber->update([
            'status' => $newStatus,
            'subscribed_at' => $newStatus === 'subscribed' ? now() : $subscriber->subscribed_at,
            'unsubscribed_at' => $newStatus === 'unsubscribed' ? now() : null,
        ]);

        return back()->with('success', "Subscriber status changed to {$newStatus}.");
    }

    /**
     * Delete a subscriber.
     */
    public function destroy($id): RedirectResponse
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->delete();

        return back()->with('success', 'Subscriber removed successfully.');
    }

    /**
     * Broadcast a newsletter campaign to all active subscribers.
     */
    public function sendBroadcast(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:200',
            'content' => 'required|string|max:10000',
        ]);

        $activeSubscribers = NewsletterSubscriber::where('status', 'subscribed')->get();
        $count = $activeSubscribers->count();

        // Create campaign record
        $campaign = NewsletterCampaign::create([
            'subject' => $validated['subject'],
            'content' => $validated['content'],
            'recipients_count' => $count,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Send to subscribers (with EmailSanitizer protection automatically active)
        foreach ($activeSubscribers as $subscriber) {
            try {
                if (EmailSanitizerService::isSafe($subscriber->email)) {
                    Mail::raw($validated['content'], function ($message) use ($subscriber, $validated) {
                        $message->to($subscriber->email)
                            ->subject($validated['subject']);
                    });
                }
            } catch (\Exception $e) {
                // Ignore failure for individual test/dummy addresses
            }
        }

        return back()->with('success', "Newsletter broadcast successfully sent to {$count} subscribers.");
    }

    /**
     * Export subscribers as CSV.
     */
    public function export(): StreamedResponse
    {
        $subscribers = NewsletterSubscriber::latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="newsletter_subscribers_' . date('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($subscribers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Email', 'Name', 'Status', 'Source', 'Subscribed At']);

            foreach ($subscribers as $s) {
                fputcsv($handle, [
                    $s->id,
                    $s->email,
                    $s->name ?? 'N/A',
                    $s->status,
                    $s->source,
                    $s->subscribed_at?->format('Y-m-d H:i:s') ?? $s->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
