<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class AdminTicketController extends Controller
{
    use ApiResponse;

    /**
     * List all support tickets with filtering.
     */
    public function index(Request $request)
    {
        $query = Ticket::with('user:id,name,email,avatar')->latest('id');

        if ($status = $request->input('status')) {
            $query->where('status', strtoupper($status));
        }

        if ($priority = $request->input('priority')) {
            $query->where('priority', strtoupper($priority));
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('ticket_id', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = min(100, max(5, (int) $request->input('per_page', 15)));
        $tickets = $query->paginate($perPage);

        return $this->pagination('Support tickets retrieved successfully.', $tickets);
    }

    /**
     * Show single ticket details.
     */
    public function show($id)
    {
        $ticket = Ticket::with(['user:id,name,email,avatar', 'attachments'])->find($id);

        if (! $ticket) {
            return $this->error('Ticket not found.', 404);
        }

        return $this->ok('Ticket details retrieved successfully.', $ticket);
    }

    /**
     * Update ticket status and priority.
     */
    public function updateStatus(Request $request, $id)
    {
        $ticket = Ticket::find($id);

        if (! $ticket) {
            return $this->error('Ticket not found.', 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH,URGENT',
        ]);

        $ticket->status = $validated['status'];
        if (isset($validated['priority'])) {
            $ticket->priority = $validated['priority'];
        }
        $ticket->save();

        return $this->ok('Ticket status updated successfully.', $ticket->fresh());
    }

    /**
     * Delete ticket.
     */
    public function destroy($id)
    {
        $ticket = Ticket::find($id);

        if (! $ticket) {
            return $this->error('Ticket not found.', 404);
        }

        $ticket->delete();

        return $this->ok('Ticket deleted successfully.');
    }
}
