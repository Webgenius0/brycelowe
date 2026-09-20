<?php

namespace App\Http\Controllers\API\Training;

use App\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\TrainingContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class TrainingContentController extends Controller
{
    use ApiResponse;

    /**
     * List AI training content with filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = TrainingContent::with('user:id,name,email');

        if ($user && ! in_array($user->role, ['Admin', 'SUPERADMIN']) && ! $user->is_superuser) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('content_category')) {
            $query->where('content_category', $request->content_category);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('content_category', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('file', 'like', "%{$search}%");
            });
        }

        $perPage = $request->integer('per_page', 15);
        $contents = $query->latest('id')->paginate($perPage);

        $progress = $this->calculateProgress($user ? $user->id : null);

        return response()->json([
            'status' => 200,
            'message' => 'Training contents retrieved successfully.',
            'progress' => $progress,
            'data' => $contents->items(),
            'pagination' => [
                'current_page' => $contents->currentPage(),
                'last_page' => $contents->lastPage(),
                'per_page' => $contents->perPage(),
                'total' => $contents->total(),
                'first_page_url' => $contents->url(1),
                'last_page_url' => $contents->url($contents->lastPage()),
                'next_page_url' => $contents->nextPageUrl(),
                'prev_page_url' => $contents->previousPageUrl(),
                'from' => $contents->firstItem(),
                'to' => $contents->lastItem(),
                'path' => $contents->path(),
            ],
        ], 200);
    }

    /**
     * Upload and create new training content.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'content_category' => 'required|string|in:Sales Bio,Company Info,Scripts & Flows,Objections,Marketing & Listing Presentation,Past Sales Data,Other Resources',
            'type' => 'nullable|string|in:Document,Audio,Video,PDF,Text',
            'file' => 'required|file|max:51200', // 50MB max
            'status' => 'nullable|string|in:Pending,Processing,Trained,Failed,Active',
            'is_active' => 'nullable|boolean',
        ]);

        $uploadedFile = $request->file('file');
        $ext = strtolower($uploadedFile->getClientOriginalExtension());
        $byteSize = $uploadedFile->getSize();

        // Calculate human readable size
        $formattedSize = $this->formatBytes($byteSize);

        // Auto-detect type if not provided
        $type = $validated['type'] ?? $this->detectType($ext);

        $filename = 'ai_train_'.time().'_'.uniqid().'.'.$ext;
        $uploadDir = public_path('uploads/training');

        if (! File::isDirectory($uploadDir)) {
            File::makeDirectory($uploadDir, 0755, true, true);
        }

        $uploadedFile->move($uploadDir, $filename);
        $relativePath = 'uploads/training/'.$filename;

        $content = TrainingContent::create([
            'user_id' => $user->id,
            'content_category' => $validated['content_category'],
            'type' => $type,
            'file' => $relativePath,
            'size' => $formattedSize,
            'status' => $validated['status'] ?? 'Pending',
            'upload_at' => now(),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $content->load('user:id,name,email');

        return $this->success('Training content uploaded and registered successfully.', $content, 201);
    }

    /**
     * Show single training content details.
     */
    public function show(int $id): JsonResponse
    {
        $content = TrainingContent::with('user:id,name,email')->find($id);

        if (! $content) {
            return $this->error('Training content not found.', 404);
        }

        return $this->ok('Training content retrieved successfully.', $content);
    }

    /**
     * Update training content metadata.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $content = TrainingContent::find($id);

        if (! $content) {
            return $this->error('Training content not found.', 404);
        }

        $validated = $request->validate([
            'content_category' => 'nullable|string|in:Sales Bio,Company Info,Scripts & Flows,Objections,Marketing & Listing Presentation,Past Sales Data,Other Resources',
            'type' => 'nullable|string|in:Document,Audio,Video,PDF,Text',
            'status' => 'nullable|string|in:Pending,Processing,Trained,Failed,Active',
            'is_active' => 'nullable|boolean',
        ]);

        $content->update($validated);

        return $this->ok('Training content updated successfully.', $content);
    }

    /**
     * Toggle active/inactive status for training content.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $content = TrainingContent::find($id);

        if (! $content) {
            return $this->error('Training content not found.', 404);
        }

        $content->is_active = ! $content->is_active;
        $content->save();

        return $this->ok('Training content status toggled successfully.', [
            'id' => $content->id,
            'is_active' => $content->is_active,
        ]);
    }

    /**
     * Delete training content and its local file.
     */
    public function destroy(int $id): JsonResponse
    {
        $content = TrainingContent::find($id);

        if (! $content) {
            return $this->error('Training content not found.', 404);
        }

        // Delete physical file if exists
        if ($content->file) {
            $filePath = public_path($content->file);
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
        }

        $content->delete();

        return $this->ok('Training content deleted successfully.');
    }

    /**
     * Helper to auto detect type by file extension.
     */
    protected function detectType(string $ext): string
    {
        return match ($ext) {
            'pdf' => 'PDF',
            'mp3', 'wav', 'm4a', 'ogg' => 'Audio',
            'mp4', 'webm', 'mov', 'avi' => 'Video',
            'txt' => 'Text',
            default => 'Document',
        };
    }

    /**
     * Helper to format bytes into readable KB/MB.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }

    /**
     * Calculate training progress metrics for a specific user.
     */
    protected function calculateProgress(?int $userId): array
    {
        $categories = [
            'Sales Bio',
            'Company Info',
            'Scripts & Flows',
            'Objections',
            'Marketing & Listing Presentation',
            'Past Sales Data',
            'Other Resources',
        ];

        $query = TrainingContent::where('is_active', true);
        if ($userId) {
            $query->where('user_id', $userId);
        }

        $userContents = $query->get();
        $uploadedCategories = $userContents->pluck('content_category')->unique()->toArray();

        $categoryStatus = [];
        $completedCount = 0;

        foreach ($categories as $cat) {
            $hasContent = in_array($cat, $uploadedCategories);
            $categoryStatus[$cat] = [
                'is_completed' => $hasContent,
                'count' => $userContents->where('content_category', $cat)->count(),
            ];
            if ($hasContent) {
                $completedCount++;
            }
        }

        $totalCategories = count($categories);
        $percentage = $totalCategories > 0 ? (int) round(($completedCount / $totalCategories) * 100) : 0;

        $lastUpdatedItem = $userContents->sortByDesc('updated_at')->first();
        $lastUpdatedText = $lastUpdatedItem && $lastUpdatedItem->updated_at
            ? $lastUpdatedItem->updated_at->format('F d, Y')
            : null;

        return [
            'percentage' => $percentage,
            'percentage_text' => $percentage.'% Complete',
            'completed_categories_count' => $completedCount,
            'total_categories_count' => $totalCategories,
            'last_updated' => $lastUpdatedText ? 'Last updated: '.$lastUpdatedText : 'Not updated yet',
            'last_updated_at' => $lastUpdatedItem?->updated_at?->toIso8601String(),
            'categories' => $categoryStatus,
        ];
    }
}
