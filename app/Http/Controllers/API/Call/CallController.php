<?php

namespace App\Http\Controllers\API\Call;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\CallReport;
use App\Models\Lead;
use App\Models\LeadActivity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CallController extends Controller
{
    use ApiResponse;

    /**
     * List calls (delegates to history or followupQueue depending on tab).
     */
    public function index(Request $request): JsonResponse
    {
        $tab = strtolower((string) $request->input('tab', ''));
        if ($tab === 'queue' || $tab === 'followup_queue' || $tab === 'follow_up_queue') {
            return $this->followupQueue($request);
        }

        return $this->history($request);
    }

    /**
     * Call History API (Tab 1) - matches UI table columns and period/lead_type/outcome filters.
     */
    public function history(Request $request): JsonResponse
    {
        $query = Call::query();
        $this->applyCallFilters($query, $request);

        // Sorting
        $sortBy = $request->input('sort_by', 'timestamp');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'timestamp', 'duration', 'trust_gain', 'ai_adherance', 'outcome'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest('id');
        }

        $perPage = $request->integer('per_page', 15);
        $paginator = $query->paginate($perPage);

        $transformed = collect($paginator->items())->map(function ($call) {
            return $this->transformCall($call, false);
        });

        // Summary counts for tabs and statistics
        $user = $request->user();
        $countsQuery = Call::query();
        if ($user && ! in_array($user->role, ['Admin', 'SUPERADMIN']) && ! $user->is_superuser) {
            $countsQuery->where(function ($q) use ($user) {
                $q->where('agent_id', $user->id)
                    ->orWhereHas('lead', function ($lq) use ($user) {
                        $lq->where('lead_by', $user->id);
                    });
            });
        }
        $totalCount = (clone $countsQuery)->count();
        $inQueueCount = (clone $countsQuery)->where(function ($q) {
            $q->where('in_queue', true)->orWhere('outcome', 'like', '%Follow Up%');
        })->count();
        $appointmentSetCount = (clone $countsQuery)->where('outcome', 'like', '%Appointment%')->count();

        return response()->json([
            'status' => 200,
            'message' => 'Call history retrieved successfully.',
            'tab' => 'call_history',
            'counts' => [
                'total_calls' => $totalCount,
                'followup_queue' => $inQueueCount,
                'appointments_set' => $appointmentSetCount,
            ],
            'data' => $transformed,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'first_page_url' => $paginator->url(1),
                'last_page_url' => $paginator->url($paginator->lastPage()),
                'next_page_url' => $paginator->nextPageUrl(),
                'prev_page_url' => $paginator->previousPageUrl(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'path' => $paginator->path(),
            ],
        ], 200);
    }

    /**
     * Follow-up Queue API (Tab 2) - returns queued calls with due times and quick actions.
     */
    public function followupQueue(Request $request): JsonResponse
    {
        $query = Call::query();
        $this->applyCallFilters($query, $request);

        // Filter calls that belong in the follow-up queue
        $query->where(function ($q) {
            $q->where('in_queue', true)
                ->orWhere('outcome', 'like', '%Follow Up%')
                ->orWhereNotNull('next_call');
        });

        // Order primarily by next_call ascending (earliest due first)
        if ($request->filled('sort_by')) {
            $sortBy = $request->input('sort_by');
            $sortOrder = strtolower($request->input('sort_order', 'asc')) === 'desc' ? 'desc' : 'asc';
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByRaw('CASE WHEN next_call IS NOT NULL THEN 0 ELSE 1 END, next_call ASC, id DESC');
        }

        $perPage = $request->integer('per_page', 15);
        $paginator = $query->paginate($perPage);

        $transformed = collect($paginator->items())->map(function ($call) {
            return $this->transformCall($call, true);
        });

        $user = $request->user();
        $countsQuery = Call::query();
        if ($user && ! in_array($user->role, ['Admin', 'SUPERADMIN']) && ! $user->is_superuser) {
            $countsQuery->where(function ($q) use ($user) {
                $q->where('agent_id', $user->id)
                    ->orWhereHas('lead', function ($lq) use ($user) {
                        $lq->where('lead_by', $user->id);
                    });
            });
        }
        $totalInQueue = (clone $countsQuery)->where(function ($q) {
            $q->where('in_queue', true)->orWhere('outcome', 'like', '%Follow Up%')->orWhereNotNull('next_call');
        })->count();
        $overdueCount = (clone $countsQuery)->where('next_call', '<', now()->startOfDay())->count();

        return response()->json([
            'status' => 200,
            'message' => 'Follow-up queue retrieved successfully.',
            'tab' => 'followup_queue',
            'counts' => [
                'total_in_queue' => $totalInQueue,
                'overdue' => $overdueCount,
            ],
            'data' => $transformed,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'first_page_url' => $paginator->url(1),
                'last_page_url' => $paginator->url($paginator->lastPage()),
                'next_page_url' => $paginator->nextPageUrl(),
                'prev_page_url' => $paginator->previousPageUrl(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'path' => $paginator->path(),
            ],
        ], 200);
    }

    /**
     * Store and log a new call, with optional embedded call report.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'call_id' => 'nullable|string|uuid|unique:calls,call_id',
            'lead_id' => 'nullable|exists:leads,id',
            'agent_id' => 'nullable|exists:users,id',
            'timestamp' => 'nullable|date',
            'duration' => 'nullable|integer|min:0',
            'duration_formatted' => 'nullable|string|max:50',
            'outcome' => 'nullable|string|max:50',
            'trust_gain' => 'nullable|integer',
            'ai_adherance' => 'nullable|integer',
            'in_queue' => 'nullable|boolean',
            'next_call' => 'nullable|date',
            'report' => 'nullable|array',
            'report.summary' => 'nullable|string',
            'report.summery' => 'nullable|string',
            'report.talk_ratio' => 'nullable|integer|min:0|max:100',
            'report.listen_ratio' => 'nullable|integer|min:0|max:100',
            'report.trust_score' => 'nullable|integer|min:0|max:100',
            'report.sentiment' => 'nullable|array',
            'report.objections' => 'nullable|array',
            'report.key_insights' => 'nullable|array',
            'report.next_step' => 'nullable|array',
            'report.ai_performance' => 'nullable|array',
            'report.recording_file_url' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $user = $request->user();
            $callId = $validated['call_id'] ?? (string) Str::uuid();
            $duration = $validated['duration'] ?? 0;

            // Format duration if not explicitly passed
            $formattedDuration = $validated['duration_formatted'] ?? null;
            if (! $formattedDuration && $duration > 0) {
                $hours = floor($duration / 3600);
                $minutes = floor(($duration % 3600) / 60);
                $seconds = $duration % 60;
                $formattedDuration = $hours > 0
                    ? sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds)
                    : sprintf('%02d:%02d', $minutes, $seconds);
            }

            $call = Call::create([
                'call_id' => $callId,
                'lead_id' => $validated['lead_id'] ?? null,
                'agent_id' => $validated['agent_id'] ?? ($user ? $user->id : null),
                'timestamp' => $validated['timestamp'] ?? now(),
                'duration' => $duration,
                'duration_formatted' => $formattedDuration,
                'outcome' => $validated['outcome'] ?? 'Completed',
                'trust_gain' => $validated['trust_gain'] ?? 0,
                'ai_adherance' => $validated['ai_adherance'] ?? 0,
                'in_queue' => $validated['in_queue'] ?? false,
                'next_call' => $validated['next_call'] ?? null,
            ]);

            // Update associated lead stats if linked
            if (! empty($validated['lead_id'])) {
                $lead = Lead::find($validated['lead_id']);
                if ($lead) {
                    $lead->increment('total_call');
                    $leadUpdates = [
                        'last_call' => $call->timestamp,
                        'outcome' => $call->outcome,
                    ];
                    if ($call->trust_gain > 0) {
                        $leadUpdates['trust_gain'] = $call->trust_gain;
                    }
                    if ($call->ai_adherance > 0) {
                        $leadUpdates['ai_adherance'] = $call->ai_adherance;
                    }
                    $lead->update($leadUpdates);

                    // Add activity entry
                    LeadActivity::create([
                        'lead_id' => $lead->id,
                        'activity_type' => 'Call Logged',
                        'timestamp' => $call->timestamp,
                        'tmiestamp' => $call->timestamp,
                        'description' => 'Call ('.($call->duration_formatted ?? ($duration.'s')).') outcome: '.$call->outcome,
                        'is_completed' => true,
                    ]);
                }
            }

            // Create initial report if provided
            if (! empty($validated['report'])) {
                $rep = $validated['report'];
                CallReport::create([
                    'call_id' => $call->id,
                    'agent' => $user ? $user->name : null,
                    'lead_source' => isset($lead) ? $lead->source : null,
                    'timestamp' => $call->timestamp,
                    'duration' => $call->duration_formatted,
                    'summary' => $rep['summary'] ?? $rep['summery'] ?? null,
                    'summery' => $rep['summery'] ?? $rep['summary'] ?? null,
                    'talk_ratio' => $rep['talk_ratio'] ?? 50,
                    'listen_ratio' => $rep['listen_ratio'] ?? 50,
                    'trust_score' => $rep['trust_score'] ?? 0,
                    'sentiment' => $rep['sentiment'] ?? null,
                    'objections' => $rep['objections'] ?? null,
                    'key_insights' => $rep['key_insights'] ?? null,
                    'next_step' => $rep['next_step'] ?? null,
                    'ai_performance' => $rep['ai_performance'] ?? null,
                    'recording_file_url' => $rep['recording_file_url'] ?? null,
                ]);
            }

            $call->load(['lead', 'agent:id,name,email', 'report']);

            return $this->success('Call logged successfully.', $call, 201);
        });
    }

    /**
     * Show single call details with formatted report, lead, and agent.
     */
    public function show(string $id): JsonResponse
    {
        $call = is_numeric($id)
            ? Call::with(['lead', 'agent:id,name,email', 'report'])->find($id)
            : Call::with(['lead', 'agent:id,name,email', 'report'])->where('call_id', $id)->first();

        if (! $call) {
            return $this->error('Call not found.', 404);
        }

        $formatted = $this->formatCallReport($call, $call->report);
        $data = $call->toArray();
        $data['formatted_report'] = $formatted;

        return $this->ok('Call details retrieved successfully.', $data);
    }

    /**
     * Retrieve the AI Call Report formatted into the exact 5 sections from Figma.
     */
    public function report(string $id): JsonResponse
    {
        $call = is_numeric($id)
            ? Call::with(['lead', 'agent:id,name,email', 'report'])->find($id)
            : Call::with(['lead', 'agent:id,name,email', 'report'])->where('call_id', $id)->first();

        if (! $call) {
            return $this->error('Call not found.', 404);
        }

        $report = $call->report;
        $formatted = $this->formatCallReport($call, $report);

        return response()->json([
            'status' => 200,
            'message' => 'Call report retrieved successfully.',
            'data' => $formatted,
            'raw_report' => $report,
        ], 200);
    }

    /**
     * Save or update AI Call Report for a call.
     */
    public function saveReport(Request $request, string $id): JsonResponse
    {
        $call = is_numeric($id)
            ? Call::with(['lead', 'agent'])->find($id)
            : Call::with(['lead', 'agent'])->where('call_id', $id)->first();

        if (! $call) {
            return $this->error('Call not found.', 404);
        }

        $validated = $request->validate([
            'summary' => 'nullable|string',
            'summery' => 'nullable|string',
            'call_summary' => 'nullable|array',
            'call_overview' => 'nullable|string',
            'response_time' => 'nullable|array',
            'prompt_utilization' => 'nullable|array',
            'performance_metrics' => 'nullable|array',
            'cache_insight' => 'nullable|string',
            'response_timing_insight' => 'nullable|string',
            'key_moment_log' => 'nullable|array',
            'agent_tone_and_feedback' => 'nullable|array',
            'conversion_indicators' => 'nullable|array',
            'sentiment' => 'nullable|array',
            'talk_ratio' => 'nullable|integer|min:0|max:100',
            'listen_ratio' => 'nullable|integer|min:0|max:100',
            'trust_score' => 'nullable|integer|min:0|max:100',
            'key_insights' => 'nullable|array',
            'objections' => 'nullable|array',
            'next_step' => 'nullable|array',
            'ai_performance' => 'nullable|array',
            'recording_file_url' => 'nullable|string',
        ]);

        $summaryText = $validated['call_overview']
            ?? ($validated['call_summary']['call_overview'] ?? null)
            ?? $validated['summary']
            ?? $validated['summery']
            ?? null;

        $keyMomentLog = $validated['call_summary']['key_moments_log']
            ?? $validated['key_moment_log']
            ?? null;

        $promptUtilization = $validated['performance_metrics']['prompt_utilization']
            ?? $validated['prompt_utilization']
            ?? null;

        $responseTime = $validated['performance_metrics']['response_timing']
            ?? $validated['response_time']
            ?? null;

        $coachingInsight = $validated['performance_metrics']['coaching_insights']
            ?? $validated['cache_insight']
            ?? null;

        $respTimingInsight = $validated['performance_metrics']['response_timing_insight']
            ?? $validated['response_timing_insight']
            ?? null;

        $conversionIndicators = $validated['conversion_indicators'] ?? null;
        $agentToneFeedback = $validated['agent_tone_and_feedback']
            ?? $request->input('agent_tone_and_delivery')
            ?? null;
        $sentiment = $validated['sentiment']
            ?? $request->input('agent_sentiment_and_responsiveness')
            ?? null;

        $report = CallReport::updateOrCreate(
            ['call_id' => $call->id],
            [
                'agent' => $request->input('agent') ?? ($call->agent?->name ?? 'Bryce Lowe'),
                'lead_source' => $request->input('lead_source') ?? ($call->lead?->lead_type ?? 'Expired Listing'),
                'timestamp' => $call->timestamp ?? now(),
                'duration' => $call->duration_formatted,
                'summary' => $summaryText,
                'summery' => $summaryText,
                'response_time' => $responseTime,
                'response_tiem' => $responseTime,
                'prompt_utilization' => $promptUtilization,
                'cache_insight' => $coachingInsight,
                'response_timing_insight' => $respTimingInsight,
                'key_moment_log' => $keyMomentLog,
                'agent_tone_and_feedback' => $agentToneFeedback,
                'conversion_indicators' => $conversionIndicators,
                'talk_ratio' => $validated['talk_ratio'] ?? 50,
                'listen_ratio' => $validated['listen_ratio'] ?? 50,
                'trust_score' => $validated['trust_score'] ?? $call->trust_gain,
                'key_insights' => $validated['key_insights'] ?? null,
                'objections' => $validated['objections'] ?? null,
                'sentiment' => $sentiment,
                'next_step' => $validated['next_step'] ?? null,
                'ai_performance' => $validated['ai_performance'] ?? null,
                'recording_file_url' => $validated['recording_file_url'] ?? null,
            ]
        );

        $formatted = $this->formatCallReport($call->fresh(['lead', 'agent']), $report);

        return response()->json([
            'status' => 200,
            'message' => 'Call report saved successfully.',
            'data' => $formatted,
            'raw_report' => $report,
        ], 200);
    }

    /**
     * Upload recording file for a call.
     */
    public function uploadRecording(Request $request, string $id): JsonResponse
    {
        $call = is_numeric($id)
            ? Call::find($id)
            : Call::where('call_id', $id)->first();

        if (! $call) {
            return $this->error('Call not found.', 404);
        }

        $request->validate([
            'recording' => 'required|file|mimes:mp3,wav,m4a,ogg,webm,mp4|max:51200', // max 50MB
        ]);

        $file = $request->file('recording');
        $filename = 'call_'.$call->call_id.'_'.time().'.'.$file->getClientOriginalExtension();
        $file->move(public_path('uploads/recordings'), $filename);

        $url = url('uploads/recordings/'.$filename);

        $report = CallReport::updateOrCreate(
            ['call_id' => $call->id],
            [
                'recording_file_url' => $url,
                'duration' => $call->duration_formatted,
                'timestamp' => $call->timestamp ?? now(),
            ]
        );

        return $this->ok('Call recording uploaded successfully.', [
            'recording_file_url' => $url,
            'report' => $report,
        ]);
    }

    /**
     * Delete call record and attached report.
     */
    public function destroy(string $id): JsonResponse
    {
        $call = is_numeric($id)
            ? Call::find($id)
            : Call::where('call_id', $id)->first();

        if (! $call) {
            return $this->error('Call not found.', 404);
        }

        $call->delete();

        return $this->ok('Call deleted successfully.');
    }

    /**
     * Update call outcome (e.g. from table dropdown badge) and sync with lead.
     */
    public function updateOutcome(Request $request, string $id): JsonResponse
    {
        $call = is_numeric($id)
            ? Call::with(['lead', 'agent:id,name,email', 'report'])->find($id)
            : Call::with(['lead', 'agent:id,name,email', 'report'])->where('call_id', $id)->first();

        if (! $call) {
            return $this->error('Call not found.', 404);
        }

        $validated = $request->validate([
            'outcome' => 'required|string|max:50',
            'next_call' => 'nullable|date',
            'in_queue' => 'nullable|boolean',
        ]);

        $call->outcome = $validated['outcome'];

        if (strtolower($validated['outcome']) === 'follow up') {
            $call->in_queue = $request->boolean('in_queue', true);
            if ($request->filled('next_call')) {
                $call->next_call = $validated['next_call'];
            } elseif (! $call->next_call) {
                $call->next_call = now()->addDay();
            }
        } elseif ($request->has('in_queue')) {
            $call->in_queue = $request->boolean('in_queue');
        }

        $call->save();

        if ($call->lead) {
            $call->lead->update([
                'outcome' => $call->outcome,
                'in_followup_queue' => $call->in_queue,
            ]);

            LeadActivity::create([
                'lead_id' => $call->lead->id,
                'activity_type' => 'Outcome Updated',
                'timestamp' => now(),
                'tmiestamp' => now(),
                'description' => 'Call outcome changed to '.$call->outcome,
                'is_completed' => true,
            ]);
        }

        return $this->ok('Call outcome updated successfully.', $this->transformCall($call->fresh(['lead', 'agent', 'report']), (bool) $call->in_queue));
    }

    /**
     * Toggle or update follow-up queue status for a call.
     */
    public function toggleQueue(Request $request, string $id): JsonResponse
    {
        $call = is_numeric($id)
            ? Call::with(['lead', 'agent:id,name,email', 'report'])->find($id)
            : Call::with(['lead', 'agent:id,name,email', 'report'])->where('call_id', $id)->first();

        if (! $call) {
            return $this->error('Call not found.', 404);
        }

        $inQueue = $request->has('in_queue')
            ? $request->boolean('in_queue')
            : ! $call->in_queue;

        $call->in_queue = $inQueue;
        if ($request->filled('next_call')) {
            $call->next_call = $request->next_call;
        } elseif ($inQueue && ! $call->next_call) {
            $call->next_call = now()->addDay();
        }

        $call->save();

        if ($call->lead) {
            $call->lead->update(['in_followup_queue' => $inQueue]);
        }

        return $this->ok('Follow-up queue updated successfully.', $this->transformCall($call->fresh(['lead', 'agent', 'report']), true));
    }

    /**
     * Apply common filters for Call queries (role permission, period, lead_type, outcome, search).
     */
    protected function applyCallFilters(Builder $query, Request $request): void
    {
        $user = $request->user();

        $query->with([
            'lead:id,full_name,email,company_name,property_address,city,state,zip_code,phone_number,status,lead_type',
            'agent:id,name,email',
            'report',
        ]);

        // Permissions: non-admins see calls they handled or leads they own
        if ($user && ! in_array($user->role, ['Admin', 'SUPERADMIN']) && ! $user->is_superuser) {
            $query->where(function ($q) use ($user) {
                $q->where('agent_id', $user->id)
                    ->orWhereHas('lead', function ($lq) use ($user) {
                        $lq->where('lead_by', $user->id);
                    });
            });
        }

        // Specific lead filter
        if ($request->filled('lead_id')) {
            $query->where('lead_id', $request->lead_id);
        }

        // Specific agent filter
        if ($request->filled('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        // Lead Type filter (matching dropdown "All lead type", "Expired Listing", "FSBO", etc.)
        if ($request->filled('lead_type') && ! in_array(strtolower(trim($request->lead_type)), ['all', 'all lead type', 'all lead types'])) {
            $leadType = trim($request->lead_type);
            $query->whereHas('lead', function ($lq) use ($leadType) {
                $lq->where('lead_type', 'like', "%{$leadType}%");
            });
        }

        // Outcome filter (matching dropdown "All outcomes", "Appointment Set", "Follow Up", "Not A Fit")
        if ($request->filled('outcome') && ! in_array(strtolower(trim($request->outcome)), ['all', 'all outcomes', 'all outcome'])) {
            $query->where('outcome', 'like', '%'.trim($request->outcome).'%');
        }

        // Period filter (matching dropdown "6 Month", "1 Month", "3 Month", "1 Year")
        $period = $request->input('period', $request->input('time_filter', $request->input('date_range')));
        if ($period) {
            $clean = strtolower(trim($period));
            if (in_array($clean, ['1 month', '1_month', '1m'])) {
                $query->where('timestamp', '>=', now()->subMonth());
            } elseif (in_array($clean, ['3 month', '3_month', '3m'])) {
                $query->where('timestamp', '>=', now()->subMonths(3));
            } elseif (in_array($clean, ['6 month', '6_month', '6m'])) {
                $query->where('timestamp', '>=', now()->subMonths(6));
            } elseif (in_array($clean, ['1 year', '1_year', '1y', '12 month'])) {
                $query->where('timestamp', '>=', now()->subYear());
            }
        }

        // Queue filter if explicitly passed
        if ($request->has('in_queue')) {
            $query->where('in_queue', $request->boolean('in_queue'));
        }

        // Search across call_id, outcome, lead name, property address, phone, email
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('call_id', 'like', "%{$search}%")
                    ->orWhere('outcome', 'like', "%{$search}%")
                    ->orWhereHas('lead', function ($lq) use ($search) {
                        $lq->where('full_name', 'like', "%{$search}%")
                            ->orWhere('property_address', 'like', "%{$search}%")
                            ->orWhere('city', 'like', "%{$search}%")
                            ->orWhere('state', 'like', "%{$search}%")
                            ->orWhere('zip_code', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone_number', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }
    }

    /**
     * Transform a Call model into the exact structure required by the UI table columns.
     */
    protected function transformCall(Call $call, bool $isQueue = false): array
    {
        $lead = $call->lead;
        $timestamp = $call->timestamp ? Carbon::parse($call->timestamp) : null;
        $nextCall = $call->next_call ? Carbon::parse($call->next_call) : null;

        // Human-readable follow-up due text (e.g. "Follow up in 1 day", "Follow up today", "Overdue by 2 days")
        $followupText = null;
        $isOverdue = false;
        if ($nextCall) {
            $diffDays = (int) now()->startOfDay()->diffInDays($nextCall->startOfDay(), false);
            if ($diffDays > 1) {
                $followupText = "Follow up in {$diffDays} days";
            } elseif ($diffDays === 1) {
                $followupText = 'Follow up in 1 day';
            } elseif ($diffDays === 0) {
                $followupText = 'Follow up today';
            } else {
                $isOverdue = true;
                $daysOver = abs($diffDays);
                $followupText = "Overdue by {$daysOver} ".($daysOver > 1 ? 'days' : 'day');
            }
        } elseif ($isQueue || str_contains(strtolower((string) $call->outcome), 'follow up')) {
            $followupText = 'Follow up pending';
        }

        // Duration formatted (e.g. "2m 40s")
        $durationFormatted = $call->duration_formatted;
        if (! $durationFormatted && $call->duration > 0) {
            $dur = (int) $call->duration;
            $mins = floor($dur / 60);
            $secs = $dur % 60;
            $durationFormatted = $mins > 0 ? "{$mins}m {$secs}s" : "{$secs}s";
        }

        // Trust gain formatted (e.g. "+28", "-5")
        $trustGain = (int) $call->trust_gain;
        $formattedTrustGain = $trustGain > 0 ? "+{$trustGain}" : (string) $trustGain;

        // AI Adherence formatted (e.g. "84%")
        $formattedAiAdherence = ($call->ai_adherance ?? 0).'%';

        return [
            'id' => $call->id,
            'call_id' => $call->call_id,
            'lead_id' => $call->lead_id,
            'name' => $lead?->full_name ?? 'Unknown Lead',
            'property_address' => $lead?->property_address ?? ($lead?->address ?? 'N/A'),
            'lead_type' => $lead?->lead_type ?? 'N/A',
            'date' => $timestamp?->format('M d, Y') ?? 'N/A',
            'time' => $timestamp?->format('h:i A') ?? 'N/A',
            'date_time' => $timestamp?->format('M d, Y h:i A') ?? 'N/A',
            'timestamp' => $call->timestamp,
            'followup_due_text' => $followupText,
            'is_overdue' => $isOverdue,
            'next_call' => $call->next_call,
            'trust_gain' => $trustGain,
            'formatted_trust_gain' => $formattedTrustGain,
            'outcome' => $call->outcome ?? 'Appointment Set',
            'ai_adherence' => $call->ai_adherance ?? 0,
            'formatted_ai_adherence' => $formattedAiAdherence,
            'duration' => $call->duration,
            'duration_formatted' => $durationFormatted ?? '0s',
            'in_queue' => (bool) $call->in_queue,
            'has_report' => true,
            'report_id' => $call->report?->id ?? $call->id,
            'lead' => $lead,
            'agent' => $call->agent,
            'created_at' => $call->created_at,
            'updated_at' => $call->updated_at,
        ];
    }

    /**
     * Format a call and its report into the exact 5 sections shown in the Figma Call Report design.
     */
    public function formatCallReport(Call $call, ?CallReport $report = null): array
    {
        $lead = $call->lead;
        $agent = $call->agent;
        $timestamp = $call->timestamp ? Carbon::parse($call->timestamp) : Carbon::now();

        // 1. Duration calculation
        $durationSeconds = $call->duration ?: 431;
        $durationFormatted = $call->duration_formatted;
        if (! $durationFormatted && $durationSeconds > 0) {
            $mins = floor($durationSeconds / 60);
            $secs = $durationSeconds % 60;
            $durationFormatted = $mins > 0 ? "{$mins}m {$secs}s" : "{$secs}s";
        }
        if (! $durationFormatted) {
            $durationFormatted = '7m 11s';
        }

        // 2. Meta Bar (Top bar with Call ID, Agent, Lead Source, Date, Recording Length)
        $callCode = $call->call_id;
        if (! $callCode || strlen($callCode) > 12) {
            $callCode = 'PX-'.str_pad((string) $call->id, 5, '0', STR_PAD_LEFT);
        }

        $meta = [
            'call_id' => $callCode,
            'uuid' => $call->call_id,
            'id' => $call->id,
            'agent' => $report?->agent ?? ($agent?->name ?? 'Bryce Lowe'),
            'lead_source' => $report?->lead_source ?? ($lead?->lead_type ?? 'Expired Listing'),
            'lead_name' => $lead?->full_name ?? 'Ricky Smith',
            'property_address' => $lead?->property_address ?? ($lead?->address ?? '1851 Lynch Street, Newark'),
            'date' => $timestamp->format('M d, Y'),
            'time' => $timestamp->format('h:i A'),
            'date_time' => $timestamp->format('M d, Y h:i A'),
            'recording_length' => $durationFormatted,
            'recording_length_seconds' => $durationSeconds,
            'recording_file_url' => $report?->recording_file_url,
            'disclaimer' => '(No Transcript, No Lead Data Recorded or Processed)',
        ];

        // 3. Section 1: Call Summary
        $overviewDefault = "You opened the call with a clear value statement and set expectations early. You maintained a professional and confident tone throughout the conversation. You adapted your pacing after initial hesitation, which helped build trust and keep the conversation on track. You handled objections with relevant responses and stayed composed. You made a strong attempt to secure the next step and ended the call with clarity.\n\nOverall, you demonstrated solid control of the call, good use of guidance, and a commitment to leading the conversation toward a specific outcome.";

        $keyMomentsDefault = [
            [
                'time' => '00:45',
                'icon' => 'message-square',
                'title' => 'Used AI prompt to open with value framing.',
                'description' => 'Effective start that sets the context.',
                'impact' => 'High Impact',
                'impact_variant' => 'success',
            ],
            [
                'time' => '03:18',
                'icon' => 'alert-triangle',
                'title' => 'Navigated pricing objection with empathy.',
                'description' => 'Acknowledged concern and repositioned value.',
                'impact' => 'Effective',
                'impact_variant' => 'warning',
            ],
            [
                'time' => '04:12',
                'icon' => 'users',
                'title' => 'Built rapport by mirroring tone and pace.',
                'description' => 'Shifted to a calmer pace to build trust.',
                'impact' => 'High Impact',
                'impact_variant' => 'success',
            ],
            [
                'time' => '06:42',
                'icon' => 'target',
                'title' => 'Issued CTA to schedule appointment.',
                'description' => 'Clear close attempt with limited urgency.',
                'impact' => 'Moderate',
                'impact_variant' => 'amber',
            ],
        ];

        $callSummary = [
            'section_number' => 1,
            'section_title' => '1. Call Summary',
            'call_overview' => $report?->summary ?? $report?->summery ?? $overviewDefault,
            'summary_disclosure' => "This coaching report was generated solely from the agent's side of the conversation. No audio, transcript, behavioral analysis, or identifiable data from the other party was recorded, captured, stored, or processed. PitchProX is designed to be fully compliant with all applicable federal and state laws, including but not limited to two-party consent statutes, by restricting analysis exclusively to the agent's speech and observable agent-side behavior.",
            'key_moments_log' => (! empty($report?->key_moment_log) && is_array($report->key_moment_log)) ? $report->key_moment_log : $keyMomentsDefault,
        ];

        // 4. Section 2: Performance Metrics
        $promptUtilDefault = [
            'used_as_is' => 62,
            'modified' => 28,
            'off_script' => 10,
        ];

        $respTimingDefault = [
            'average' => '1.9s',
            'average_seconds' => 1.9,
            'rating' => 'Excellent',
        ];

        $performanceMetrics = [
            'section_number' => 2,
            'section_title' => '2. Performance Metrics',
            'call_duration' => [
                'formatted' => $durationFormatted,
                'seconds' => $durationSeconds,
            ],
            'prompt_utilization' => (! empty($report?->prompt_utilization) && is_array($report->prompt_utilization)) ? $report->prompt_utilization : $promptUtilDefault,
            'response_timing' => (! empty($report?->response_time) && is_array($report->response_time)) ? $report->response_time : $respTimingDefault,
            'coaching_insights' => $report?->cache_insight ?? 'You used AI guidance effectively while maintaining a natural delivery. Your response timing was strong, allowing smooth flow without long pauses. Good balance between structure and personalization helped keep the conversation engaging and goal-driven.',
            'response_timing_insight' => $report?->response_timing_insight ?? 'Your average time between prompt and response was 1.9 seconds, which supports strong pacing and adaptability. This shows you were engaged with the guidance and able to respond thoughtfully without overthinking or rushing.',
        ];

        // 5. Section 3: Conversion Indicators
        $statusLabel = strtoupper($call->outcome ?: 'SUCCESS');
        $conversionDefault = [
            'call_status' => [
                'status' => $statusLabel,
                'badge' => "✓ {$statusLabel} ✓",
                'narrative' => 'You issued a strong CTA and attempted to schedule a follow-up. Your closing was clear and confident, increasing the likelihood of conversion.',
            ],
            'followup_suggestion' => [
                'title' => 'Re-engage within 3 days',
                'subtitle' => 'Send a calendar link and short value recap.',
                'due_days' => 3,
            ],
        ];

        $rawConversion = (! empty($report?->conversion_indicators) && is_array($report->conversion_indicators)) ? $report->conversion_indicators : [];
        $conversionIndicators = [
            'section_number' => 3,
            'section_title' => '3. Conversion Indicators',
            'call_status' => $rawConversion['call_status'] ?? $conversionDefault['call_status'],
            'followup_suggestion' => $rawConversion['followup_suggestion'] ?? $conversionDefault['followup_suggestion'],
        ];

        // 6. Section 4: Agent Tone & Delivery Feedback
        $toneDefault = [
            'tone_alignment' => [
                'timeline_points' => [
                    ['time' => '00:00', 'score' => 50],
                    ['time' => '02:00', 'score' => 65],
                    ['time' => '04:00', 'score' => 55],
                    ['time' => '06:00', 'score' => 75],
                    ['time' => '07:11', 'score' => 70],
                ],
                'markers' => [
                    ['time' => '02:55', 'label' => 'Warm and confident opening', 'color' => 'green'],
                    ['time' => '04:12', 'label' => 'Calmer tone to build trust', 'color' => 'blue'],
                    ['time' => '06:10', 'label' => 'Confident close', 'color' => 'purple'],
                ],
            ],
            'energy_profile' => [
                'level' => 'High',
                'label' => 'ENERGY LEVEL',
                'narrative' => 'Your vocal energy was consistently high and engaging. This kept momentum throughout the call and helped maintain attention.',
                'reference' => 'Reference: High energy in sales calls is linked to higher conversion rates.',
                'research_study' => 'Frontiers in Psychology Study',
                'research_url' => 'https://www.frontiersin.org/journals/psychology',
            ],
        ];

        $rawTone = (! empty($report?->agent_tone_and_feedback) && is_array($report->agent_tone_and_feedback)) ? $report->agent_tone_and_feedback : [];
        $agentToneDelivery = [
            'section_number' => 4,
            'section_title' => '4. Agent Tone & Delivery Feedback',
            'tone_alignment' => $rawTone['tone_alignment'] ?? $toneDefault['tone_alignment'],
            'energy_profile' => $rawTone['energy_profile'] ?? $toneDefault['energy_profile'],
        ];

        // 7. Section 5: Agent Sentiment & Responsiveness
        $sentimentDefault = [
            'sentiment_signal' => [
                'score' => 0.61,
                'formatted_score' => '+0.61',
                'label' => 'POSITIVE COACHING ALIGNMENT',
                'score_range' => '-1.0 (Negative) to +1.0 (Positive)',
                'description' => 'This score reflects the positivity, confidence, and clarity in your speech. Positive sentiment improves rapport and drives better call outcomes.',
                'key_moments' => [
                    ['time' => '02:55', 'score' => '+0.48', 'label' => 'Confident opening'],
                    ['time' => '04:12', 'score' => '+0.62', 'label' => 'Reassuring tone shift'],
                    ['time' => '06:42', 'score' => '+0.71', 'label' => 'Strong closing attempt'],
                ],
            ],
            'adaptability_moments' => [
                [
                    'time' => '04:12',
                    'icon' => 'clock',
                    'title' => 'Pacing Shift',
                    'description' => 'You slowed your pacing after early hesitation — supports trust-building.',
                    'research_title' => 'Harvard Study on Trust & Pace',
                    'research_url' => 'https://hbr.org/topic/sales',
                ],
                [
                    'time' => '07:20',
                    'icon' => 'expand',
                    'title' => 'Strategy Shift',
                    'description' => 'You softened rebuttal phrasing which helped keep the conversation open.',
                    'research_title' => 'Salesforce Research on Adaptability',
                    'research_url' => 'https://www.salesforce.com/resources/research-reports/',
                ],
                [
                    'time' => '02:30',
                    'icon' => 'target',
                    'title' => 'Tone Adjustment',
                    'description' => 'You matched the tone to stay aligned with the conversation flow.',
                    'research_title' => 'Psychology Today: Mirroring Effect',
                    'research_url' => 'https://www.psychologytoday.com/us/basics/mirroring',
                ],
            ],
            'coaching_tags' => [
                [
                    'tag' => 'Reassuring',
                    'time' => '03:18',
                    'variant' => 'teal',
                    'description' => 'You acknowledged the concern and provided reassurance with calm tone.',
                ],
                [
                    'tag' => 'Assertive',
                    'time' => '05:44',
                    'variant' => 'blue',
                    'description' => 'You stated value clearly and confidently without being pushy.',
                ],
                [
                    'tag' => 'Empathetic',
                    'time' => '04:12',
                    'variant' => 'orange',
                    'description' => 'You showed understanding which improved connection.',
                ],
                [
                    'tag' => 'Confident',
                    'time' => '06:42',
                    'variant' => 'purple',
                    'description' => 'You closed with confidence and clarity.',
                ],
            ],
        ];

        $rawSentiment = (! empty($report?->sentiment) && is_array($report->sentiment)) ? $report->sentiment : [];
        $agentSentimentResponsiveness = [
            'section_number' => 5,
            'section_title' => '5. Agent Sentiment & Responsiveness',
            'sentiment_signal' => $rawSentiment['sentiment_signal'] ?? $sentimentDefault['sentiment_signal'],
            'adaptability_moments' => $rawSentiment['adaptability_moments'] ?? $sentimentDefault['adaptability_moments'],
            'coaching_tags' => $rawSentiment['coaching_tags'] ?? $sentimentDefault['coaching_tags'],
        ];

        return [
            'header' => [
                'title' => 'Call Report',
                'subtext' => '(No Transcript, No Lead Data Recorded or Processed)',
                'available_actions' => ['download_pdf', 'print_report', 'share_report'],
            ],
            'meta' => $meta,
            'sections' => [
                'call_summary' => $callSummary,
                'performance_metrics' => $performanceMetrics,
                'conversion_indicators' => $conversionIndicators,
                'agent_tone_and_delivery' => $agentToneDelivery,
                'agent_sentiment_and_responsiveness' => $agentSentimentResponsiveness,
            ],
            'call_summary' => $callSummary,
            'performance_metrics' => $performanceMetrics,
            'conversion_indicators' => $conversionIndicators,
            'agent_tone_and_delivery' => $agentToneDelivery,
            'agent_sentiment_and_responsiveness' => $agentSentimentResponsiveness,
        ];
    }
}
