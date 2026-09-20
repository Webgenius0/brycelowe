<?php

namespace App\Http\Controllers\API\Lead;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of leads with search, filtering, and summary statistics.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Lead::with(['numbers', 'leadBy:id,name,email']);

        // Filter by user if not admin
        if ($user && ! in_array($user->role, ['Admin', 'SUPERADMIN']) && ! $user->is_superuser) {
            $query->where(function ($q) use ($user) {
                $q->where('lead_by', $user->id)
                    ->orWhereNull('lead_by');
            });
        }

        // Search across full_name, email, company_name, property_address, city, state, zip_code, phone_number
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('property_address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('state', 'like', "%{$search}%")
                    ->orWhere('zip_code', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%")
                    ->orWhereHas('numbers', function ($sub) use ($search) {
                        $sub->where('number', 'like', "%{$search}%");
                    });
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('lead_type')) {
            $query->where('lead_type', $request->lead_type);
        }

        if ($request->filled('outcome')) {
            $query->where('outcome', $request->outcome);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        if ($request->has('in_followup_queue')) {
            $query->where('in_followup_queue', $request->boolean('in_followup_queue'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'full_name', 'created_at', 'last_call', 'estimated_value', 'priority', 'status', 'total_call', 'trust_gain', 'property_address'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest('id');
        }

        $perPage = $request->integer('per_page', 15);
        $leads = $query->paginate($perPage);

        return $this->pagination('Leads retrieved successfully.', $leads);
    }

    /**
     * Store a newly created lead in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Support field aliases from frontend forms
        if (! $request->filled('full_name') && $request->filled('name')) {
            $request->merge(['full_name' => $request->input('name')]);
        }
        if (! $request->filled('property_address') && $request->filled('address')) {
            $request->merge(['property_address' => $request->input('address')]);
        }
        if (! $request->filled('zip_code') && $request->filled('zip')) {
            $request->merge(['zip_code' => $request->input('zip')]);
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'property_address' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'zip' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
            'status' => 'nullable|string|max:50',
            'lead_type' => 'nullable|string|max:50',
            'outcome' => 'nullable|string|max:50',
            'priority' => 'nullable|string|in:Low,Medium,High,Urgent',
            'tags' => 'nullable|array',
            'estimated_value' => 'nullable|numeric|min:0',
            'source' => 'nullable|string|max:100',
            'in_followup_queue' => 'nullable|boolean',
            'add_to_queue' => 'nullable|boolean',
            'add_to_follow_up_queue' => 'nullable|boolean',
            'numbers' => 'nullable|array',
            'phone_numbers' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $user = $request->user();

            $phoneNumbers = $this->extractPhoneNumbers($request);
            $primaryPhone = ! empty($phoneNumbers) ? $phoneNumbers[0] : ($validated['phone_number'] ?? ($validated['phone'] ?? null));

            $inFollowupQueue = $request->boolean('in_followup_queue')
                || $request->boolean('add_to_queue')
                || $request->boolean('add_to_follow_up_queue')
                || $request->boolean('follow_up_queue');

            $lead = Lead::create([
                'full_name' => $validated['full_name'],
                'email' => $validated['email'] ?? null,
                'phone_number' => $primaryPhone,
                'company_name' => $validated['company_name'] ?? null,
                'property_address' => $validated['property_address'] ?? ($validated['address'] ?? null),
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'zip_code' => $validated['zip_code'] ?? ($validated['zip'] ?? null),
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['status'] ?? 'New',
                'lead_type' => $validated['lead_type'] ?? 'Inbound',
                'outcome' => $validated['outcome'] ?? null,
                'priority' => $validated['priority'] ?? 'Medium',
                'tags' => $validated['tags'] ?? [],
                'estimated_value' => $validated['estimated_value'] ?? 0.00,
                'source' => $validated['source'] ?? 'Manual Entry',
                'is_lead' => true,
                'in_followup_queue' => $inFollowupQueue,
                'lead_by' => $user ? $user->id : null,
            ]);

            // Save extracted phone numbers to lead_numbers table
            if (! empty($phoneNumbers)) {
                foreach ($phoneNumbers as $index => $num) {
                    LeadNumber::create([
                        'lead_id' => $lead->id,
                        'number' => $num,
                        'is_default' => ($index === 0),
                        'is_active' => true,
                    ]);
                }
            } elseif (! empty($primaryPhone)) {
                LeadNumber::create([
                    'lead_id' => $lead->id,
                    'number' => $primaryPhone,
                    'is_default' => true,
                    'is_active' => true,
                ]);
            }

            // Log activity: Lead Created
            LeadActivity::create([
                'lead_id' => $lead->id,
                'activity_type' => 'Lead Created',
                'timestamp' => now(),
                'tmiestamp' => now(),
                'description' => 'Lead was created by '.($user ? $user->name : 'System'),
                'is_completed' => true,
            ]);

            $lead->load(['numbers', 'activities', 'leadBy:id,name,email']);

            return $this->success('Lead created successfully.', $lead, 201);
        });
    }

    /**
     * Display the specified lead with relations.
     */
    public function show(int $id): JsonResponse
    {
        $lead = Lead::with([
            'numbers',
            'activities' => fn ($q) => $q->latest('id'),
            'calls' => fn ($q) => $q->latest('id')->limit(10),
            'leadBy:id,name,email',
        ])->find($id);

        if (! $lead) {
            return $this->error('Lead not found.', 404);
        }

        return $this->ok('Lead retrieved successfully.', $lead);
    }

    /**
     * Update the specified lead in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return $this->error('Lead not found.', 404);
        }

        // Support field aliases
        if (! $request->filled('full_name') && $request->filled('name')) {
            $request->merge(['full_name' => $request->input('name')]);
        }
        if (! $request->filled('property_address') && $request->filled('address')) {
            $request->merge(['property_address' => $request->input('address')]);
        }
        if (! $request->filled('zip_code') && $request->filled('zip')) {
            $request->merge(['zip_code' => $request->input('zip')]);
        }

        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'property_address' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'zip' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
            'status' => 'nullable|string|max:50',
            'lead_type' => 'nullable|string|max:50',
            'outcome' => 'nullable|string|max:50',
            'priority' => 'nullable|string|in:Low,Medium,High,Urgent',
            'tags' => 'nullable|array',
            'estimated_value' => 'nullable|numeric|min:0',
            'source' => 'nullable|string|max:100',
            'trust_gain' => 'nullable|integer',
            'ai_adherance' => 'nullable|integer',
            'in_followup_queue' => 'nullable|boolean',
            'add_to_queue' => 'nullable|boolean',
            'add_to_follow_up_queue' => 'nullable|boolean',
            'numbers' => 'nullable|array',
            'phone_numbers' => 'nullable|array',
        ]);

        if ($request->has('in_followup_queue') || $request->has('add_to_queue') || $request->has('add_to_follow_up_queue') || $request->has('follow_up_queue')) {
            $validated['in_followup_queue'] = $request->boolean('in_followup_queue')
                || $request->boolean('add_to_queue')
                || $request->boolean('add_to_follow_up_queue')
                || $request->boolean('follow_up_queue');
        }

        if (isset($validated['address']) && ! isset($validated['property_address'])) {
            $validated['property_address'] = $validated['address'];
        }

        $lead->update($validated);

        // Process phone numbers if provided in request
        $phoneNumbers = $this->extractPhoneNumbers($request);
        if (! empty($phoneNumbers)) {
            foreach ($phoneNumbers as $idx => $num) {
                $existing = LeadNumber::where('lead_id', $lead->id)->where('number', $num)->first();
                if (! $existing) {
                    LeadNumber::create([
                        'lead_id' => $lead->id,
                        'number' => $num,
                        'is_default' => ($idx === 0 && empty($lead->phone_number)),
                        'is_active' => true,
                    ]);
                }
            }
        } elseif (! empty($validated['phone_number'])) {
            $existing = LeadNumber::where('lead_id', $lead->id)->where('number', $validated['phone_number'])->first();
            if (! $existing) {
                LeadNumber::create([
                    'lead_id' => $lead->id,
                    'number' => $validated['phone_number'],
                    'is_default' => true,
                    'is_active' => true,
                ]);
            }
        }

        $lead->load(['numbers', 'leadBy:id,name,email']);

        return $this->ok('Lead updated successfully.', $lead);
    }

    /**
     * Remove the specified lead from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return $this->error('Lead not found.', 404);
        }

        $lead->delete();

        return $this->ok('Lead deleted successfully.');
    }

    /**
     * Add an activity log/note for a lead.
     */
    public function addActivity(Request $request, int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return $this->error('Lead not found.', 404);
        }

        $validated = $request->validate([
            'activity_type' => 'required|string|max:100',
            'description' => 'required|string',
            'timestamp' => 'nullable|date',
            'is_completed' => 'nullable|boolean',
        ]);

        $activityTime = ! empty($validated['timestamp']) ? $validated['timestamp'] : now();

        $activity = LeadActivity::create([
            'lead_id' => $lead->id,
            'activity_type' => $validated['activity_type'],
            'timestamp' => $activityTime,
            'tmiestamp' => $activityTime,
            'description' => $validated['description'],
            'is_completed' => $validated['is_completed'] ?? true,
        ]);

        return $this->success('Lead activity recorded successfully.', $activity, 201);
    }

    /**
     * Add a phone number for the lead.
     */
    public function addNumber(Request $request, int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return $this->error('Lead not found.', 404);
        }

        $validated = $request->validate([
            'number' => 'required|string|max:50',
            'is_default' => 'nullable|boolean',
        ]);

        $isDefault = $validated['is_default'] ?? false;

        if ($isDefault) {
            LeadNumber::where('lead_id', $lead->id)->update(['is_default' => false]);
            $lead->update(['phone_number' => $validated['number']]);
        }

        $leadNumber = LeadNumber::create([
            'lead_id' => $lead->id,
            'number' => $validated['number'],
            'is_default' => $isDefault,
            'is_active' => true,
        ]);

        return $this->success('Phone number added successfully.', $leadNumber, 201);
    }

    /**
     * Delete a phone number from the lead.
     */
    public function deleteNumber(int $id, int $numberId): JsonResponse
    {
        $number = LeadNumber::where('lead_id', $id)->where('id', $numberId)->first();

        if (! $number) {
            return $this->error('Phone number not found.', 404);
        }

        $number->delete();

        return $this->ok('Phone number deleted successfully.');
    }

    /**
     * Helper to extract and normalize phone numbers from various frontend formats.
     * Supports:
     * - Numbered fields: phone_number_1, phone_number_2, phone_1, ...
     * - Array of strings: phone_numbers = ["...", "..."]
     * - Array of objects: numbers = [{"number": "..."}, ...]
     * - Single fields: phone_number, phone
     *
     * @return array<int, string>
     */
    protected function extractPhoneNumbers(Request $request): array
    {
        $numbers = [];

        // 1. Numbered fields: phone_number_1, phone_number_2, ..., phone_1, phone_2, ...
        foreach ($request->all() as $key => $value) {
            if (preg_match('/^phone(_number)?_\d+$/i', $key) && is_string($value) && trim($value) !== '') {
                $numbers[] = trim($value);
            }
        }

        // 2. phone_numbers array (strings or objects)
        if ($request->has('phone_numbers') && is_array($request->phone_numbers)) {
            foreach ($request->phone_numbers as $item) {
                if (is_string($item) && trim($item) !== '') {
                    $numbers[] = trim($item);
                } elseif (is_array($item) && ! empty($item['number'])) {
                    $numbers[] = trim((string) $item['number']);
                }
            }
        }

        // 3. numbers array (strings or objects)
        if ($request->has('numbers') && is_array($request->numbers)) {
            foreach ($request->numbers as $item) {
                if (is_string($item) && trim($item) !== '') {
                    $numbers[] = trim($item);
                } elseif (is_array($item) && ! empty($item['number'])) {
                    $numbers[] = trim((string) $item['number']);
                }
            }
        }

        // 4. Single phone_number / phone
        if ($request->filled('phone_number')) {
            $numbers[] = trim((string) $request->phone_number);
        }
        if ($request->filled('phone')) {
            $numbers[] = trim((string) $request->phone);
        }

        // Deduplicate while preserving order
        return array_values(array_unique(array_filter($numbers)));
    }
}
