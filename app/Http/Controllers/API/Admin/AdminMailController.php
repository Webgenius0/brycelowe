<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\ProspectEmail;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminMailController extends Controller
{
    use ApiResponse;

    /**
     * List all prospect emails across the platform (Admin View with filters).
     */
    public function index(Request $request)
    {
        $query = ProspectEmail::with('user:id,name,email')->latest('id');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('to', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        $perPage = min(100, max(5, (int) $request->input('per_page', 15)));
        $emails = $query->paginate($perPage);

        return $this->pagination('All prospect emails retrieved successfully.', $emails);
    }

    /**
     * Show single prospect email details.
     */
    public function show($id)
    {
        $email = ProspectEmail::with('user:id,name,email')->find($id);

        if (! $email) {
            return $this->error('Email record not found.', 404);
        }

        return $this->ok('Email details retrieved successfully.', $email);
    }

    /**
     * Delete email log.
     */
    public function destroy($id)
    {
        $email = ProspectEmail::find($id);

        if (! $email) {
            return $this->error('Email record not found.', 404);
        }

        $email->delete();

        return $this->ok('Email record deleted successfully.');
    }

    /**
     * List email templates.
     */
    public function templates()
    {
        $templates = EmailTemplate::latest('id')->get();
        return $this->ok('Email templates retrieved successfully.', $templates);
    }

    /**
     * Create new template (Admin).
     */
    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'category' => 'nullable|string|max:100',
            'is_system' => 'nullable|boolean',
        ]);

        $template = EmailTemplate::create([
            'user_id' => $request->user()?->id,
            'title' => $validated['title'],
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'category' => $validated['category'] ?? 'General',
            'is_system' => $validated['is_system'] ?? true,
        ]);

        return $this->success('Email template created successfully.', $template, 201);
    }

    /**
     * Update template (Admin).
     */
    public function updateTemplate(Request $request, $id)
    {
        $template = EmailTemplate::find($id);

        if (! $template) {
            return $this->error('Template not found.', 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'subject' => 'sometimes|required|string|max:255',
            'body' => 'sometimes|required|string',
            'category' => 'nullable|string|max:100',
            'is_system' => 'nullable|boolean',
        ]);

        $template->update($validated);

        return $this->ok('Email template updated successfully.', $template);
    }

    /**
     * Delete template.
     */
    public function destroyTemplate($id)
    {
        $template = EmailTemplate::find($id);

        if (! $template) {
            return $this->error('Template not found.', 404);
        }

        $template->delete();

        return $this->ok('Email template deleted successfully.');
    }

    /**
     * Send email as Administrator.
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

        return $this->success('Email dispatched successfully from Administrator account.', $email, 201);
    }
}
