<?php

namespace App\Http\Controllers\API\Ticket;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    use ApiResponse;

    /**
     * List tickets for the authenticated user (or all if admin).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Ticket::with(['attachments', 'user:id,name,email,avatar']);

        if ($user && !in_array($user->role, ['Admin', 'SUPERADMIN']) && !$user->is_superuser) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', strtoupper($request->status));
        }

        if ($request->filled('category')) {
            $query->where('category', strtoupper($request->category));
        }

        if ($request->filled('priority')) {
            $query->where('priority', strtoupper($request->priority));
        }

        $tickets = $query->latest('id')->paginate($request->integer('per_page', 15));

        return $this->pagination('Tickets retrieved successfully.', $tickets);
    }

    /**
     * Get ticket details by ID.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::with(['attachments', 'user:id,name,email,avatar'])->find($id);

        if (!$ticket) {
            return $this->error('Ticket not found.', 404);
        }

        if ($user && !in_array($user->role, ['Admin', 'SUPERADMIN']) && !$user->is_superuser && $ticket->user_id !== $user->id) {
            return $this->error('Unauthorized access to ticket.', 403);
        }

        return $this->ok('Ticket retrieved successfully.', $ticket);
    }

    /**
     * Create a new support ticket.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'category' => 'required|in:TECHNICAL,BILLING,ACCOUNT,GENERAL,FEATURE_REQUEST',
            'priority' => 'required|in:LOW,MEDIUM,HIGH,URGENT',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|max:10240',
        ]);

        $ticket = Ticket::create([
            'user_id' => $user->id,
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'OPEN',
            'is_open' => true,
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/tickets'), $filename);
                $ticket->attachments()->create([
                    'file' => 'uploads/tickets/' . $filename,
                ]);
            }
        }

        $ticket->load(['attachments', 'user:id,name,email,avatar']);

        return $this->success('Ticket created successfully.', $ticket, 201);
    }

    /**
     * Update ticket status (Admin/Staff or User).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return $this->error('Ticket not found.', 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED,PENDING',
        ]);

        $status = $validated['status'];
        $ticket->update([
            'status' => $status,
            'is_open' => !in_array($status, ['RESOLVED', 'CLOSED']),
        ]);

        return $this->ok('Ticket status updated successfully.', $ticket);
    }

    /**
     * Delete a support ticket.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::with('attachments')->find($id);

        if (!$ticket) {
            return $this->error('Ticket not found.', 404);
        }

        $user = $request->user();
        if ($user && !in_array($user->role, ['Admin', 'SUPERADMIN']) && !$user->is_superuser && $ticket->user_id !== $user->id) {
            return $this->error('Unauthorized.', 403);
        }

        foreach ($ticket->attachments as $attachment) {
            $filePath = public_path($attachment->file);
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }

        $ticket->delete();

        return $this->ok('Ticket deleted successfully.');
    }
}
