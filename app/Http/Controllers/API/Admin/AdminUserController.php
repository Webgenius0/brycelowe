<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    use ApiResponse;

    /**
     * List all users with search, role filter, status filter, and pagination.
     */
    public function index(Request $request)
    {
        $query = User::query()->latest('id');

        // Search by name, email, phone
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($role = $request->input('role')) {
            $query->where(function ($q) use ($role) {
                $q->where('role', $role)
                  ->orWhere('external_user_role', $role);
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by user_type (INTERNAL / EXTERNAL)
        if ($userType = $request->input('user_type')) {
            $query->where('user_type', strtoupper($userType));
        }

        $perPage = min(100, max(5, (int) $request->input('per_page', 15)));
        $users = $query->paginate($perPage);

        return $this->pagination('Users list retrieved successfully.', $users);
    }

    /**
     * Create a new user or administrative staff account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|max:50',
            'status' => 'nullable|in:Active,Inactive,Banned',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'user_type' => 'nullable|in:INTERNAL,EXTERNAL',
        ]);

        $role = $validated['role'] ?? 'User';
        $userType = $validated['user_type'] ?? (in_array(strtoupper($role), ['SUPERADMIN', 'ADMIN']) ? 'INTERNAL' : 'EXTERNAL');

        $user = User::create([
            'name' => $validated['name'],
            'full_name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
            'external_user_role' => $role,
            'status' => $validated['status'] ?? 'Active',
            'is_active' => ($validated['status'] ?? 'Active') === 'Active',
            'phone' => $validated['phone'] ?? null,
            'phone_number' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'user_type' => $userType,
        ]);

        return $this->success('User created successfully.', $user, 201);
    }

    /**
     * Show single user profile & detail.
     */
    public function show($id)
    {
        $user = User::find($id);

        if (! $user) {
            return $this->error('User not found.', 404);
        }

        return $this->ok('User details retrieved successfully.', $user);
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return $this->error('User not found.', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'full_name' => 'sometimes|nullable|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|max:50',
            'status' => 'nullable|in:Active,Inactive,Banned',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'user_type' => 'nullable|in:INTERNAL,EXTERNAL',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
            $user->full_name = $validated['full_name'] ?? $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if (isset($validated['role'])) {
            $user->role = $validated['role'];
            $user->external_user_role = $validated['role'];
            if (in_array(strtoupper($validated['role']), ['SUPERADMIN', 'ADMIN'])) {
                $user->user_type = 'INTERNAL';
            }
        }

        if (isset($validated['status'])) {
            $user->status = $validated['status'];
            $user->is_active = ($validated['status'] === 'Active');
        }

        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
            $user->phone_number = $validated['phone'];
        }

        if (isset($validated['address'])) {
            $user->address = $validated['address'];
        }

        if (isset($validated['user_type'])) {
            $user->user_type = $validated['user_type'];
        }

        $user->save();

        return $this->ok('User updated successfully.', $user->fresh());
    }

    /**
     * Update user account status (Active / Inactive / Banned).
     */
    public function updateStatus(Request $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return $this->error('User not found.', 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:Active,Inactive,Banned',
        ]);

        $user->status = $validated['status'];
        $user->is_active = ($validated['status'] === 'Active');
        $user->save();

        return $this->ok('User status updated successfully.', [
            'id' => $user->id,
            'status' => $user->status,
            'is_active' => $user->is_active,
        ]);
    }

    /**
     * Delete user account.
     */
    public function destroy(Request $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return $this->error('User not found.', 404);
        }

        if ($request->user() && $request->user()->id === $user->id) {
            return $this->error('You cannot delete your own account.', 400);
        }

        $user->delete();

        return $this->ok('User deleted successfully.');
    }

    /**
     * List all available roles.
     */
    public function roles()
    {
        return $this->ok('Available roles list retrieved successfully.', [
            'internal_roles' => ['SUPERADMIN', 'Admin'],
            'external_roles' => ['User', 'Pro', 'Enterprise'],
        ]);
    }
}
