<?php

namespace App\Http\Controllers\Web\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanyProfileController extends Controller
{
    /**
     * Display a listing of company profiles.
     */
    public function index(Request $request): Response
    {
        $query = CompanyProfile::with('user:id,name,email,avatar,role');

        // 🔎 Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('industry', 'like', "%{$search}%")
                    ->orWhere('industury', 'like', "%{$search}%")
                    ->orWhere('timezone', 'like', "%{$search}%")
                    ->orWhere('language', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // 🏢 Industry Filter
        if ($request->filled('industry') && $request->industry !== 'all') {
            $query->where(function ($q) use ($request) {
                $q->where('industry', $request->industry)
                    ->orWhere('industury', $request->industry);
            });
        }

        // 🔃 Sorting
        if ($request->filled('sort_by')) {
            $query->orderBy(
                $request->sort_by,
                $request->sort_order ?? 'asc'
            );
        } else {
            $query->latest('id');
        }

        $companies = $query->paginate(10)->withQueryString();

        // 📊 Analytics
        $analytics = [
            'total' => CompanyProfile::count(),
            'assigned_users' => CompanyProfile::whereNotNull('user_id')->count(),
            'unassigned' => CompanyProfile::whereNull('user_id')->count(),
            'unique_industries' => CompanyProfile::whereNotNull('industry')->distinct('industry')->count('industry'),
        ];

        // All users for selection dropdown in modals
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        // Available distinct industries for filtering
        $industries = CompanyProfile::whereNotNull('industry')
            ->where('industry', '!=', '')
            ->distinct()
            ->pluck('industry');

        return Inertia::render('company/index', [
            'companies' => $companies,
            'analytics' => $analytics,
            'users' => $users,
            'industries' => $industries,
            'filters' => $request->only(['search', 'industry', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Store a newly created company profile in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'company_name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'timezone' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:255',
            'avatar' => 'nullable',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('companies', 'public');
            $avatarPath = Storage::url($avatarPath);
        } elseif (is_string($request->avatar)) {
            $avatarPath = $request->avatar;
        }

        CompanyProfile::create([
            'user_id' => $validated['user_id'] ?? null,
            'company_name' => $validated['company_name'],
            'industry' => $validated['industry'] ?? null,
            'industury' => $validated['industry'] ?? null,
            'timezone' => $validated['timezone'] ?? null,
            'language' => $validated['language'] ?? 'English',
            'avatar' => $avatarPath,
        ]);

        return redirect()->route('company.index')->with('success', 'Company profile created successfully.');
    }

    /**
     * Update the specified company profile in storage.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $profile = CompanyProfile::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'company_name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'timezone' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:255',
            'avatar' => 'nullable',
        ]);

        $data = [
            'user_id' => $validated['user_id'] ?? null,
            'company_name' => $validated['company_name'],
            'industry' => $validated['industry'] ?? null,
            'industury' => $validated['industry'] ?? null,
            'timezone' => $validated['timezone'] ?? null,
            'language' => $validated['language'] ?? 'English',
        ];

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('companies', 'public');
            $data['avatar'] = Storage::url($avatarPath);
        } elseif ($request->filled('avatar') && is_string($request->avatar)) {
            $data['avatar'] = $request->avatar;
        }

        $profile->update($data);

        return redirect()->route('company.index')->with('success', 'Company profile updated successfully.');
    }

    /**
     * Remove the specified company profile from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $profile = CompanyProfile::findOrFail($id);
        $profile->delete();

        return redirect()->route('company.index')->with('success', 'Company profile deleted successfully.');
    }
}
