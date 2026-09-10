<?php

namespace App\Http\Controllers\Web\Ticket;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    /**
     * Display a listing of the tickets.
     */
    public function index(Request $request): Response
    {
        $query = Ticket::query()->with(['user', 'attachments']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_id', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $tickets = $query->latest('id')->paginate(10)->withQueryString();

        $analytics = [
            'total' => Ticket::count(),
            'open' => Ticket::where('is_open', true)->count(),
            'in_progress' => Ticket::where('status', 'IN_PROGRESS')->count(),
            'resolved' => Ticket::where('status', 'RESOLVED')->count(),
            'urgent' => Ticket::where('priority', 'URGENT')->count(),
        ];

        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('ticket/index', [
            'tickets' => $tickets,
            'analytics' => $analytics,
            'users' => $users,
            'filters' => $request->only(['search', 'category', 'priority', 'status']),
        ]);
    }

    /**
     * Store a newly created ticket in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'category' => 'required|in:TECHNICAL,BILLING,ACCOUNT,GENERAL,FEATURE_REQUEST',
            'priority' => 'required|in:LOW,MEDIUM,HIGH,URGENT',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'status' => 'nullable|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED,PENDING',
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|max:10240',
        ]);

        $status = $validated['status'] ?? 'OPEN';

        $ticket = Ticket::create([
            'user_id' => $validated['user_id'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => $status,
            'is_open' => !in_array($status, ['RESOLVED', 'CLOSED']),
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

        return redirect()->route('ticket.index')->with('success', 'Support ticket created successfully.');
    }

    /**
     * Update the specified ticket in storage.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $ticket = Ticket::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'category' => 'required|in:TECHNICAL,BILLING,ACCOUNT,GENERAL,FEATURE_REQUEST',
            'priority' => 'required|in:LOW,MEDIUM,HIGH,URGENT',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'status' => 'required|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED,PENDING',
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|max:10240',
        ]);

        $status = $validated['status'];

        $ticket->update([
            'user_id' => $validated['user_id'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => $status,
            'is_open' => !in_array($status, ['RESOLVED', 'CLOSED']),
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

        return redirect()->route('ticket.index')->with('success', 'Support ticket updated successfully.');
    }

    /**
     * Update status of the specified ticket.
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $ticket = Ticket::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED,PENDING',
        ]);

        $status = $validated['status'];
        $ticket->update([
            'status' => $status,
            'is_open' => !in_array($status, ['RESOLVED', 'CLOSED']),
        ]);

        return back()->with('success', "Ticket status updated to {$status}.");
    }

    /**
     * Remove the specified ticket from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $ticket = Ticket::with('attachments')->findOrFail($id);

        // Remove files
        foreach ($ticket->attachments as $attachment) {
            $filePath = public_path($attachment->file);
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }

        $ticket->delete();

        return redirect()->route('ticket.index')->with('success', 'Ticket deleted successfully.');
    }
}
