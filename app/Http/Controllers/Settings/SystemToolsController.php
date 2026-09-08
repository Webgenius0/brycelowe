<?php

namespace App\Http\Controllers\Settings;

use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SystemToolsController extends Controller
{
    public function index()
    {
        $logPath = storage_path('logs/laravel.log');
        $logSize = File::exists($logPath) ? round(filesize($logPath) / 1024, 1) . ' KB' : '0 KB';
        $logLines = File::exists($logPath) ? count(file($logPath)) : 0;

        $loginAttempts = LoginAttempt::orderByDesc('last_attempt_at')
            ->take(50)
            ->get()
            ->map(function ($record) {
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

        return Inertia::render('settings/system-tools', [
            'logStats' => [
                'size'  => $logSize,
                'lines' => $logLines,
            ],
            'loginAttempts' => $loginAttempts,
        ]);
    }

    public function optimizeClear()
    {
        Artisan::call('optimize:clear');
        return redirect()->back()->with('success', 'All caches cleared successfully (cache, config, views, routes).');
    }

    public function optimize()
    {
        Artisan::call('optimize');
        return redirect()->back()->with('success', 'Application optimized successfully (config + routes cached).');
    }

    public function clearLogs()
    {
        $logPath = storage_path('logs/laravel.log');

        if (File::exists($logPath)) {
            File::put($logPath, '');
        }

        return redirect()->back()->with('success', 'Laravel log file cleared successfully.');
    }

    public function logs(Request $request)
    {
        $logPath = storage_path('logs/laravel.log');

        if (!File::exists($logPath)) {
            return response()->json(['lines' => []]);
        }

        $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        // Return last 300 lines
        $lines = array_slice($lines, -300);

        $parsed = array_map(function ($line) {
            $level = 'debug';
            if (preg_match('/\.(ERROR|WARNING|CRITICAL|ALERT|EMERGENCY)/i', $line, $m)) {
                $level = strtolower($m[1]);
            } elseif (preg_match('/\.(INFO|NOTICE)/i', $line, $m)) {
                $level = 'info';
            } elseif (preg_match('/\.(DEBUG)/i', $line, $m)) {
                $level = 'debug';
            }

            return [
                'text' => $line,
                'level' => $level,
            ];
        }, $lines);

        return response()->json(['lines' => $parsed]);
    }

    public function unblockIp(int $id)
    {
        LoginAttempt::where('id', $id)->delete();
        return redirect()->back()->with('success', 'IP address unblocked successfully.');
    }

    public function clearAllAttempts()
    {
        LoginAttempt::truncate();
        return redirect()->back()->with('success', 'All login attempt records cleared.');
    }
}
