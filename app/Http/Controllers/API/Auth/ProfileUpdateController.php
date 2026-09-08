<?php

namespace App\Http\Controllers\API\Auth;

use App\Concerns\ApiResponse;
use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProfileUpdateController extends Controller
{
    use ApiResponse;

    public function changePassword(Request $request)
    {
        $validator = $request->validate([
            'old_password' => 'required|string',
            'password' => 'required|string|confirmed',
        ]);

        if (! $validator) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
            ], 422);
        }

        try {

            $user = auth()->user();

            if (! Hash::check($request->old_password, $user->password)) {
                return $this->error('Incorrect Current Password', 402);
            }

            $user->password = Hash::make($request->password);
            $user->save();

            return $this->ok('Password changed successfully');
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 404);
        }
    }

    public function updateDetails(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:20480',
            'address' => 'nullable',
            'stripe_connect_id' => 'nullable|string|max:255',
            'stripe_connect_active' => 'nullable|boolean',
        ]);

        $user = Auth::user();

        $data = array_filter($request->except(['avatar', 'stripe_connect_id', 'stripe_connect_active']), function ($value) {
            return ! is_null($value) && $value !== '';
        });

        $user->fill($data);

        // Automatically manage stripe_connect_id and its active boolean status
        if ($request->has('stripe_connect_id')) {
            $connectId = trim((string)$request->stripe_connect_id);
            if (!empty($connectId)) {
                $user->stripe_connect_id = $connectId;
                $user->stripe_connect_active = $request->has('stripe_connect_active')
                    ? (bool)$request->stripe_connect_active
                    : true;
            } else {
                $user->stripe_connect_id = null;
                $user->stripe_connect_active = false;
            }
        } elseif ($request->has('stripe_connect_active')) {
            $user->stripe_connect_active = (bool)$request->stripe_connect_active;
        }

        if ($request->hasFile('avatar')) {

            $file = $request->file('avatar');

            $nameWithoutExt = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $cleanName = Str::slug($nameWithoutExt);

            $fileName = time() . '_' . $cleanName . '.' . $extension;

            $newPath = Helper::fileUpload($file, 'avatar', $fileName);

            if ($newPath) {
                if (! empty($user->avatar)) {
                    Helper::fileDelete($user->avatar);
                }
                $user->avatar = $newPath;
            }
        }

        $user->save();

        return $this->success(
            'Profile info updated successfully',
            $user->fresh(),
            200
        );
    }

    public function accountDelete(Request $request)
    {
        $user = Auth::user();
        $user->delete();

        return $this->success('Account deleted successfully', [], 202);
    }
}
