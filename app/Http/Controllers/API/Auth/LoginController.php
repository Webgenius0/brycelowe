<?php

namespace App\Http\Controllers\API\Auth;

use App\Concerns\ApiResponse;
use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    use ApiResponse;

    public function login(Request $request)
    {
        $request->merge([
            'remember_token' => filter_var($request->remember_token, FILTER_VALIDATE_BOOLEAN),
        ]);

        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return Helper::jsonErrorResponse('The provided credentials do not match our records.', 401, [
                'email' => 'The provided credentials do not match our records.',
            ]);
        }

        if (Auth::user()->email_verified_at === null) {
            return Helper::jsonErrorResponse('Email not verified.', 403, []);
        }

        if (Auth::user()->status === 'Inactive') {
            Auth::logout();

            return Helper::jsonErrorResponse('Your account is inactive. Please contact support.', 403, []);
        }

        if (Auth::user()->status === 'Banned') {
            Auth::logout();

            return Helper::jsonErrorResponse('Your account has been banned.', 403, []);
        }

        $user = Auth::user();

        // handle nullable remember_token
        if ($request->remember_token) {
            $user->setRememberToken(Str::random(60));
        }

        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Login Successful',
            'token_type' => 'Bearer',
            'token' => $user->createToken('AuthToken')->plainTextToken,
            'data' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        try {
            // Revoke the current user’s token
            $request->user()->currentAccessToken()->delete();

            // Return a response indicating the user was logged out
            return $this->ok('Logged out successfully.');
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 500);
        }
    }

    public function userDetails()
    {
        $user = Auth::user();

        return $this->ok('User Details fetch successfully.', $user);
    }

    public function userDashboardStats(Request $request)
    {
        $user = $request->user();

        // 1. Active Passes count (where stripe status is active, and not expired)
        $activePasses = $user->subscriptions()
            ->where('stripe_status', 'active')
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', \Carbon\Carbon::now());
            })
            ->count();

        // 2. Total Visited Places count (Distinct places/businesses visited with approved redemptions)
        $totalVisited = (int) (\App\Models\ReedemPoint::where('user_id', $user->id)
            ->where('status', 'approved')
            ->distinct('business_id')
            ->count('business_id'));

        // 3. Expiring Soon count (active subscriptions ending in <= 7 days)
        $expiringSoon = $user->subscriptions()
            ->where('stripe_status', 'active')
            ->whereNotNull('ends_at')
            ->whereBetween('ends_at', [\Carbon\Carbon::now(), \Carbon\Carbon::now()->addDays(7)])
            ->count();

        // 4. Recent Visit History (Real approved redemptions)
        $realVisits = \App\Models\ReedemPoint::with('business')
            ->where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get();

        $recentVisits = [];
        foreach ($realVisits as $visit) {
            $business = $visit->business;
            if (!$business) {
                continue;
            }

            // Format opening hours using today_opening_hours attribute
            $formattedHours = $business->today_opening_hours['formatted'] ?? '8:00 am - 10:00 pm';

            $recentVisits[] = [
                'id' => $visit->id,
                'business_title' => $business->title,
                'business_image' => $business->logo ?? $business->banner ?? null,
                'location' => $business->address ?? 'N/A',
                'hours' => $formattedHours,
                'points' => $visit->points,
                'quantity' => $visit->quantity ?? 1,
                'status' => $visit->status === 'approved' ? 'Completed' : ucfirst($visit->status),
                'visited_at' => $visit->created_at->format('M d, Y, h:i A'),
            ];
        }

        return $this->ok('User dashboard statistics retrieved successfully', [
            'active_passes' => $activePasses,
            'total_visited_places' => $totalVisited,
            'expiring_soon' => $expiringSoon,
            'recent_visit_history' => $recentVisits,
        ]);
    }
}
