<?php

namespace App\Http\Controllers\Settings;

use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class LoginAttemptsController extends Controller
{
    public function index(Request $request)
    {
        $query = LoginAttempt::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $attempts = $query->orderByDesc('last_attempt_at')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($record) {
                return [
                    'id'              => $record->id,
                    'ip_address'      => $record->ip_address,
                    'email'           => $record->email,
                    'attempts'        => $record->attempts,
                    'locked_until'    => $record->locked_until?->toDateTimeString(),
                    'last_attempt_at' => $record->last_attempt_at?->toDateTimeString(),
                    'is_locked'       => $record->isCurrentlyLocked(),
                ];
            });

        return Inertia::render('settings/login-attempts', [
            'loginAttempts' => $attempts,
            'filters' => $request->only(['search']),
        ]);
    }

    public function unblockIp(int $id)
    {
        LoginAttempt::where('id', $id)->delete();
        return redirect()->back()->with('success', 'IP address unblocked successfully.');
    }

    public function clearAll()
    {
        LoginAttempt::truncate();
        return redirect()->back()->with('success', 'All login attempt records cleared.');
    }
}
