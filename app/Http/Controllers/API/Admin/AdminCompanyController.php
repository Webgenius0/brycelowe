<?php

namespace App\Http\Controllers\API\Admin;

use App\Concerns\ApiResponse;
use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;

class AdminCompanyController extends Controller
{
    use ApiResponse;

    /**
     * List all company profiles.
     */
    public function index(Request $request)
    {
        $query = CompanyProfile::with('user:id,name,email,avatar')->latest('id');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('industry', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($industry = $request->input('industry')) {
            $query->where('industry', $industry);
        }

        $perPage = min(100, max(5, (int) $request->input('per_page', 15)));
        $companies = $query->paginate($perPage);

        return $this->pagination('Company profiles retrieved successfully.', $companies);
    }

    /**
     * Create a new company profile.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'company_name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:50',
            'timezone' => 'nullable|string|max:100',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = Helper::fileUpload($request->file('avatar'), 'company', 'company_' . time());
        }

        $company = CompanyProfile::create($validated);

        return $this->success('Company profile created successfully.', $company, 201);
    }

    /**
     * Show single company profile.
     */
    public function show($id)
    {
        $company = CompanyProfile::with('user')->find($id);

        if (! $company) {
            return $this->error('Company profile not found.', 404);
        }

        return $this->ok('Company profile retrieved successfully.', $company);
    }

    /**
     * Update company profile.
     */
    public function update(Request $request, $id)
    {
        $company = CompanyProfile::find($id);

        if (! $company) {
            return $this->error('Company profile not found.', 404);
        }

        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:50',
            'timezone' => 'nullable|string|max:100',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('avatar')) {
            if (! empty($company->getRawOriginal('avatar'))) {
                Helper::fileDelete($company->getRawOriginal('avatar'));
            }
            $validated['avatar'] = Helper::fileUpload($request->file('avatar'), 'company', 'company_' . time());
        }

        $company->update($validated);

        return $this->ok('Company profile updated successfully.', $company->fresh());
    }

    /**
     * Delete company profile.
     */
    public function destroy($id)
    {
        $company = CompanyProfile::find($id);

        if (! $company) {
            return $this->error('Company profile not found.', 404);
        }

        if (! empty($company->getRawOriginal('avatar'))) {
            Helper::fileDelete($company->getRawOriginal('avatar'));
        }

        $company->delete();

        return $this->ok('Company profile deleted successfully.');
    }
}
