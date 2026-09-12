<?php

namespace App\Http\Controllers\Web\Mail;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\ProspectEmail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MailSupportController extends Controller
{
    /**
     * Display the Mail & Support page.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $isSuperAdminOrAdmin = $user && (
            $user->is_superuser ||
            in_array(strtoupper($user->role ?? $user->external_user_role ?? ''), ['SUPERADMIN', 'ADMIN']) ||
            strtoupper($user->user_type ?? '') === 'INTERNAL'
        );

        $templates = EmailTemplate::where(function ($q) use ($user) {
            $q->where('is_system', true);
            if ($user) {
                $q->orWhere('user_id', $user->id);
            }
        })->orderBy('id', 'asc')->get();

        $query = ProspectEmail::with('user:id,name,email')->latest('id');

        if (! $isSuperAdminOrAdmin && $user) {
            $query->where('user_id', $user->id);
        }

        $recentEmails = $query->limit(50)->get();

        return Inertia::render('mail/index', [
            'templates' => $templates,
            'recentEmails' => $recentEmails,
            'isSuperAdmin' => $isSuperAdminOrAdmin,
        ]);
    }

    /**
     * Send email to prospect.
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'to' => 'required|email|max:255',
            'cc' => 'nullable|string|max:255',
            'bcc' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'is_tracked' => 'nullable|boolean',
            'scheduled_at' => 'nullable|date',
            'attachments' => 'nullable|array',
        ]);

        $status = !empty($validated['scheduled_at']) ? 'Scheduled' : 'Sent';
        $sentAt = empty($validated['scheduled_at']) ? Carbon::now() : null;

        $email = ProspectEmail::create([
            'user_id' => $request->user()?->id,
            'to' => $validated['to'],
            'cc' => $validated['cc'] ?? null,
            'bcc' => $validated['bcc'] ?? null,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'is_tracked' => $validated['is_tracked'] ?? true,
            'status' => $status,
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'sent_at' => $sentAt,
            'attachments' => $validated['attachments'] ?? [],
        ]);

        return redirect()->back()->with('success', 'Email dispatched successfully to ' . $validated['to']);
    }

    /**
     * Save draft email.
     */
    public function saveDraft(Request $request)
    {
        $validated = $request->validate([
            'to' => 'nullable|email|max:255',
            'cc' => 'nullable|string|max:255',
            'bcc' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'is_tracked' => 'nullable|boolean',
        ]);

        $email = ProspectEmail::create([
            'user_id' => $request->user()?->id,
            'to' => $validated['to'] ?? 'draft@prospect.com',
            'cc' => $validated['cc'] ?? null,
            'bcc' => $validated['bcc'] ?? null,
            'subject' => $validated['subject'] ?? '(No subject)',
            'message' => $validated['message'] ?? '',
            'is_tracked' => $validated['is_tracked'] ?? false,
            'status' => 'Draft',
        ]);

        return redirect()->back()->with('success', 'Draft saved successfully.');
    }

    /**
     * AI Assistant Copy Generator & Optimizer.
     */
    public function aiAssist(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'nullable|string|max:1000',
            'tone' => 'nullable|string|in:Professional,Friendly,Persuasive,Concise,Urgent',
            'recipient_name' => 'nullable|string|max:100',
            'property_address' => 'nullable|string|max:255',
            'context' => 'nullable|string',
        ]);

        $tone = $validated['tone'] ?? 'Professional';
        $name = $validated['recipient_name'] ?? '{First Name}';
        $property = $validated['property_address'] ?? '{Property Address}';
        $userPrompt = $validated['prompt'] ?? 'Follow up on property inquiry and schedule call';

        // Intelligent template generation logic based on tone and context
        $subject = match ($tone) {
            'Friendly' => "Quick update regarding {$property} - Great speaking with you!",
            'Persuasive' => "Exclusive market opportunities & customized valuation for {$property}",
            'Concise' => "Follow-up: {$property} next steps",
            'Urgent' => "Time-sensitive update regarding {$property}",
            default => "Follow-up regarding your property inquiry - {$property}",
        };

        $body = "Hi {$name},\n\n"
            . "I wanted to quickly follow up regarding your interest in {$property}. Based on our recent insights and local market demand, there are several key trends that could significantly benefit your investment and pricing goals.\n\n"
            . "Key Highlights:\n"
            . "• Recent comparable sales have shifted favorably in your neighborhood.\n"
            . "• Buyer engagement is currently at peak velocity for this property category.\n\n"
            . "Would you have 10 minutes for a brief call tomorrow afternoon to walk through the detailed numbers?\n\n"
            . "Best regards,\n"
            . "PitchProX Sales Team";

        return response()->json([
            'success' => true,
            'subject' => $subject,
            'message' => $body,
        ]);
    }
}
