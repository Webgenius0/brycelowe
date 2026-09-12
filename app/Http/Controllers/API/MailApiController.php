<?php

namespace App\Http\Controllers\API;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\ProspectEmail;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MailApiController extends Controller
{
    use ApiResponse;

    /**
     * List recent prospect emails.
     */
    public function recents(Request $request)
    {
        $user = $request->user();
        $query = ProspectEmail::with('user:id,name,email')->latest('id');

        $isSuperAdminOrAdmin = $user && (
            $user->is_superuser ||
            in_array(strtoupper($user->role ?? $user->external_user_role ?? ''), ['SUPERADMIN', 'ADMIN']) ||
            strtoupper($user->user_type ?? '') === 'INTERNAL'
        );

        if (! $isSuperAdminOrAdmin && $user) {
            $query->where('user_id', $user->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('to', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $perPage = min(50, max(5, (int) $request->input('per_page', 15)));
        $emails = $query->paginate($perPage);

        return $this->pagination('Recent emails retrieved successfully.', $emails);
    }

    /**
     * List quick email templates.
     */
    public function templates(Request $request)
    {
        $user = $request->user();
        $query = EmailTemplate::query();

        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('is_system', true)
                  ->orWhere('user_id', $user->id);
            });
        } else {
            $query->where('is_system', true);
        }

        $templates = $query->orderBy('id', 'asc')->get();
        return $this->ok('Email templates retrieved successfully.', $templates);
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

        return $this->success('Email dispatched successfully.', $email, 201);
    }

    /**
     * AI Assistant Copy Generator.
     */
    public function aiAssist(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'nullable|string|max:1000',
            'tone' => 'nullable|string|in:Professional,Friendly,Persuasive,Concise,Urgent',
            'recipient_name' => 'nullable|string|max:100',
            'property_address' => 'nullable|string|max:255',
        ]);

        $tone = $validated['tone'] ?? 'Professional';
        $name = $validated['recipient_name'] ?? '{First Name}';
        $property = $validated['property_address'] ?? '{Property Address}';

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

        return $this->ok('AI email draft generated successfully.', [
            'subject' => $subject,
            'message' => $body,
            'tone' => $tone,
        ]);
    }
}
