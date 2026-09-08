<?php

namespace App\Http\Controllers\Web\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // 🔎 Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // 🔃 Sorting
        if ($request->sort_by) {
            $query->orderBy(
                $request->sort_by,
                $request->sort_order ?? 'asc'
            );
        } else {
            $query->latest();
        }

        // 🎭 Role Filter
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // 📄 Pagination
        // makeVisible ensures created_at and last_login_at are included in the
        // serialized output even though the model's #[Hidden] attribute hides
        // created_at by default.
        $users = $query->paginate(10)->withQueryString();
        $users->getCollection()->each->makeVisible(['created_at', 'last_login_at']);

        // 📊 Analytics
        $analytics = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'Active')->count(),
            'total_admins' => User::where('role', 'Admin')->count(),
            'total_partners' => User::where('role', 'Partner')->count(),
            'total_customers' => User::where('role', 'User')->count(),
            'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        return Inertia::render('user/index', [
            'users' => $users,
            'analytics' => $analytics,
            'filters' => $request->only([
                'search',
                'sort_by',
                'sort_order',
                'role',
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|in:User,Admin,Partner',
            'status' => 'nullable|in:Active,Inactive,Banned',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'phone' => $request->phone,
            'role' => $request->role ?? 'User',
            'status' => $request->status ?? 'Active',
        ]);

        $user->email_verified_at = now();
        $user->save();

        return redirect()->route('user.index')->with('success', 'User created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|in:User,Admin,Partner',
            'status' => 'nullable|in:Active,Inactive,Banned',
        ]);

        $data = $request->only(['name', 'email', 'phone', 'role', 'status']);

        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        return redirect()->route('user.index')->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('user.index')->with('success', 'User deleted successfully.');
    }


    public function export(Request $request)
    {
        $format = $request->get('format', 'xlsx');
        $month = $request->get('month');
        $year = $request->get('year');

        $query = User::query()->orderBy('created_at', 'desc');

        if ($month && $year) {
            $query->whereYear('created_at', $year)
                ->whereMonth('created_at', $month);
        }

        $users = $query->get();

        $columns = [
            'ID',
            'Name',
            'Email',
            'Phone',
            'Address',
            'Terms Accepted',
            'Role',
            'Status',
            'Created Date',
        ];

        $data = $users->map(function ($user) {
            return [
                $user->id,
                $user->name,
                $user->email,
                $user->phone ?? 'N/A',
                $user->address ?? 'N/A',
                $user->terms ? 'Yes' : 'No',
                $user->role,
                $user->status,
                $user->created_at->format('Y-m-d H:i:s'),
            ];
        });

        $exportService = new ExportService();

        $filename = $exportService->generateFilename('users_export');

        $metadata = $exportService->getMetadata(
            $users->count(),
            'Users',
            $month,
            $year
        );

        $data = $data->map(fn($row) => (object) array_combine($columns, $row));

        if ($format === 'csv') {
            return $exportService->toCsv(
                collect($data),
                $columns,
                $filename
            );
        }

        return $exportService->toExcel(
            collect($data),
            $columns,
            $filename,
            $metadata
        );
    }
}
