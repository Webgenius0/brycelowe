<?php

namespace App\Http\Controllers\API\Notification;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\NotificationChannel;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    use ApiResponse;

    /**
     * Get in-app notifications feed for authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->error('Unauthenticated.', 401);
        }

        $query = $user->notifications();

        if ($request->boolean('unread_only') || $request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        $perPage = $request->integer('per_page', 15);
        $notifications = $query->paginate($perPage);

        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'status' => 200,
            'message' => 'Notifications retrieved successfully.',
            'unread_count' => $unreadCount,
            'data' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Get fast unread notifications counter for navbar/header.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->error('Unauthenticated.', 401);
        }

        $unreadCount = $user->unreadNotifications()->count();

        return $this->ok('Unread notifications count retrieved.', [
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            return $this->error('Notification not found.', 404);
        }

        if (is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return $this->ok('Notification marked as read.', [
            'id' => $notification->id,
            'read_at' => $notification->read_at,
        ]);
    }

    /**
     * Mark all notifications as read for authenticated user.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->unreadNotifications()->update(['read_at' => now()]);

        return $this->ok('All notifications marked as read.');
    }

    /**
     * Delete a single notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            return $this->error('Notification not found.', 404);
        }

        $notification->delete();

        return $this->ok('Notification deleted successfully.');
    }

    /**
     * Clear / delete all notifications for the authenticated user.
     */
    public function clearAll(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->notifications()->delete();

        return $this->ok('All notifications cleared successfully.');
    }

    /**
     * List all notification channels and user's subscription preferences.
     */
    public function channels(Request $request): JsonResponse
    {
        $user = $request->user();
        $allChannels = NotificationChannel::where('is_active', true)->get();

        // Get user preferences
        $userPrefs = UserNotification::where('user_id', $user->id)
            ->pluck('is_active', 'notification_channel_id');

        $result = $allChannels->map(function ($channel) use ($userPrefs) {
            return [
                'id' => $channel->id,
                'title' => $channel->title,
                'description' => $channel->description,
                'channel_type' => $channel->channel_type,
                'logo' => $channel->logo,
                'is_active' => $userPrefs->has($channel->id) ? (bool) $userPrefs->get($channel->id) : true,
            ];
        });

        return $this->ok('Notification channels retrieved successfully.', $result);
    }

    /**
     * Toggle subscription status for a specific notification channel.
     */
    public function toggleChannel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $channel = NotificationChannel::find($id);

        if (! $channel) {
            return $this->error('Notification channel not found.', 404);
        }

        $userPref = UserNotification::firstOrNew([
            'user_id' => $user->id,
            'notification_channel_id' => $channel->id,
        ]);

        $newStatus = ! ($userPref->exists ? $userPref->is_active : true);
        $userPref->is_active = $newStatus;
        $userPref->save();

        return $this->ok('Notification channel preference updated successfully.', [
            'channel_id' => $channel->id,
            'title' => $channel->title,
            'is_active' => $newStatus,
        ]);
    }

    /**
     * Create / dispatch a test notification for developer testing in the feed.
     */
    public function sendTestNotification(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'action_url' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:100',
        ]);

        $title = $validated['title'] ?? 'New High-Priority Lead Alert';
        $message = $validated['message'] ?? 'Dr. Alexander Wright has requested a live AI voice platform walkthrough.';
        $actionUrl = $validated['action_url'] ?? '/leads/1';
        $type = $validated['type'] ?? 'LeadAlert';

        $id = (string) Str::uuid();

        DB::table('notifications')->insert([
            'id' => $id,
            'type' => 'App\\Notifications\\'.$type,
            'notifiable_type' => get_class($user),
            'notifiable_id' => $user->id,
            'data' => json_encode([
                'title' => $title,
                'message' => $message,
                'action_url' => $actionUrl,
            ]),
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $notification = DB::table('notifications')->where('id', $id)->first();

        return $this->success('Test notification dispatched successfully.', [
            'id' => $id,
            'data' => json_decode($notification->data, true),
            'read_at' => null,
            'created_at' => $notification->created_at,
        ], 201);
    }
}
