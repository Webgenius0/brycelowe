<?php

namespace App\Http\Controllers\Web\Notification;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function getNotifications(Request $request)
    {
        $notifications = $request->user()?->notifications()->take(20)->get() ?? [];
        return response()->json($notifications);
    }

    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()?->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
            return response()->json(['success' => true]);
        }
        return response()->json(['error' => 'Notification not found'], 404);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()?->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        $notification = $request->user()?->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->delete();
            return response()->json(['success' => true]);
        }
        return response()->json(['error' => 'Notification not found'], 404);
    }
}
