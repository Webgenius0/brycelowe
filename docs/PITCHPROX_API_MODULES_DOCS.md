# Pitchprox (Brycelowe) API Documentation & Module Status

This document details the newly implemented **Leads Management**, **Calls & Call Reports**, and **AI Training Content** APIs, as well as the remaining modules roadmap.

---

## Base Configuration

- **Base URL:** `http://localhost:8000/api` (or your staging/production host)
- **Authentication:** Bearer Token via Laravel Sanctum (`Authorization: Bearer <TOKEN>`)
- **Common Headers:**
  ```http
  Accept: application/json
  Authorization: Bearer <TOKEN>
  ```

---

## 1. Leads Management Module

Manages inbound/outbound CRM prospects, multiple telephone numbers, and interaction activity logs.

### 1.1 List Leads
- **Endpoint:** `GET /api/leads`
- **Query Parameters:**
  - `search` *(string, optional)*: Search in name, email, company, property address, city, state, zip, phone.
  - `status` *(string, optional)*: e.g. `New`, `Contacted`, `Qualified`, `Converted`, `Lost`.
  - `priority` *(string, optional)*: `Low`, `Medium`, `High`, `Urgent`.
  - `lead_type` *(string, optional)*: `Buyer`, `Seller`, `Investor`, `Wholesaler`, `Agent`, `Inbound`, `Outbound`.
  - `outcome` *(string, optional)*: Filter by call outcome.
  - `in_followup_queue` *(boolean, optional)*: `1` / `true` or `0` / `false`.
  - `sort_by` *(string, optional)*: `created_at`, `estimated_value`, `total_call`, `trust_gain`, `full_name`, `property_address`.
  - `sort_order` *(string, optional)*: `asc` or `desc` (default: `desc`).
  - `page` *(int, optional)*: Page number.
  - `per_page` *(int, optional)*: Records per page (default: `15`).
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Leads retrieved successfully.",
    "data": [
      {
        "id": 1,
        "full_name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone_number": "+1 (555) 123-4567",
        "property_address": "742 Evergreen Terrace",
        "city": "Springfield",
        "state": "OR",
        "zip_code": "97477",
        "lead_type": "Seller",
        "status": "New",
        "priority": "High",
        "in_followup_queue": true,
        "notes": "Looking to sell single-family property within 30 days.",
        "numbers": [
          {
            "id": 1,
            "lead_id": 1,
            "number": "+1 (555) 123-4567",
            "is_default": true
          },
          {
            "id": 2,
            "lead_id": 1,
            "number": "+1 (555) 987-6543",
            "is_default": false
          }
        ],
        "lead_by": {
          "id": 2,
          "name": "Admin User",
          "email": "admin@pitchprox.com"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 15,
      "total": 1
    }
  }
  ```

### 1.2 Create Lead
- **Endpoint:** `POST /api/leads`
- **Request Body (JSON):**
  Supports both standard payloads and frontend form formats (dynamic phone fields, aliases):
  ```json
  {
    "full_name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone_number_1": "+1 (555) 123-4567",
    "phone_number_2": "+1 (555) 987-6543",
    "phone_number_3": "+1 (555) 246-8101",
    "property_address": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "OR",
    "zip_code": "97477",
    "lead_type": "Seller",
    "notes": "Looking to sell single-family property within 30 days.",
    "in_followup_queue": true,
    "status": "New",
    "priority": "High"
  }
  ```
  *Alternative Formats & Supported Aliases:*
  - `name` automatically maps to `full_name`
  - `address` automatically maps to `property_address`
  - `zip` automatically maps to `zip_code`
  - `add_to_queue` / `add_to_follow_up_queue` maps to `in_followup_queue`
  - Phone numbers can be provided as `phone_number_1`, `phone_number_2`, etc., OR as an array `phone_numbers: ["...", "..."]`, OR as `numbers: [{"number": "..."}]`
- **Response `201 Created`:** Returns created lead model with initialized default activities and numbers.

### 1.3 Get Lead Details
- **Endpoint:** `GET /api/leads/{id}`
- **Response `200 OK`:** Returns the full lead object with `numbers`, all `activities` in chronological order, and recent `calls`.

### 1.4 Update Lead
- **Endpoint:** `PUT /api/leads/{id}` or `PATCH /api/leads/{id}`
- **Request Body (JSON):**
  ```json
  {
    "status": "Contacted",
    "priority": "Urgent",
    "estimated_value": 30000.00,
    "notes": "Follow up scheduled after pricing review."
  }
  ```

### 1.5 Add Lead Activity / Note
- **Endpoint:** `POST /api/leads/{id}/activities`
- **Request Body (JSON):**
  ```json
  {
    "activity_type": "Meeting Scheduled",
    "description": "Executive pitch scheduled with VP of Engineering for Friday 2 PM.",
    "timestamp": "2026-09-22 14:00:00",
    "is_completed": true
  }
  ```

### 1.6 Add Phone Number to Lead
- **Endpoint:** `POST /api/leads/{id}/numbers`
- **Request Body (JSON):**
  ```json
  {
    "number": "+15557788990",
    "is_default": false
  }
  ```

### 1.7 Delete Phone Number
- **Endpoint:** `DELETE /api/leads/{id}/numbers/{numberId}`

### 1.8 Delete Lead
- **Endpoint:** `DELETE /api/leads/{id}`

---

## 2. Calls & AI Call Reports Module

Logs automated AI or human calls, tracks talk/listen ratios, sentiment, objections, conversion insights, and stores audio recordings.

### 2.1 Call History (Tab 1)
- **Endpoint:** `GET /api/calls/history` (or `GET /api/calls?tab=history`)
- **Query Parameters:**
  - `period` / `time_filter` *(string, optional)*: `6 Month`, `1 Month`, `3 Month`, `1 Year`, `All`.
  - `lead_type` *(string, optional)*: `Expired Listing`, `FSBO`, `Pre-Expired`, `Absentee Owner`, etc.
  - `outcome` *(string, optional)*: `Appointment Set`, `Follow Up`, `Not A Fit`.
  - `search` *(string, optional)*: Search in name, property address, phone, email, call UUID.
  - `page`, `per_page` *(int, optional)*: Default 15.
- **Response `200 OK`:**
  Returns calls formatted to match the UI table columns (`date`, `time`, `name`, `property_address`, `lead_type`, `formatted_trust_gain`, `outcome`, `formatted_ai_adherence`, `duration_formatted`, `has_report`, `report_id`) and summary counts (`total_calls`, `followup_queue`, `appointments_set`).

### 2.2 Follow-up Queue (Tab 2)
- **Endpoint:** `GET /api/calls/followup-queue` (or `GET /api/calls?tab=queue`)
- **Query Parameters:** Same as above (`period`, `lead_type`, `outcome`, `search`, `page`).
- **Response `200 OK`:**
  Returns queued calls ordered by due date, with calculated `followup_due_text` (e.g. `"Follow up in 1 day"`, `"Follow up today"`, `"Overdue by 2 days"`) and queue counts.

### 2.3 Quick Update Outcome (Dropdown Badge)
- **Endpoint:** `PATCH /api/calls/{id}/outcome`
- **Request Body (JSON):**
  ```json
  {
    "outcome": "Follow Up",
    "next_call": "2026-09-22 10:30:00",
    "in_queue": true
  }
  ```
- **Response `200 OK`:** Updates call outcome and syncs outcome to the associated lead.

### 2.4 Toggle / Update Queue Status
- **Endpoint:** `PATCH /api/calls/{id}/queue`
- **Request Body (JSON):**
  ```json
  {
    "in_queue": true,
    "next_call": "2026-09-22 10:30:00"
  }
  ```

### 2.5 Log Call (With Optional Embedded AI Report)
- **Endpoint:** `POST /api/calls`
- **Request Body (JSON):**
  ```json
  {
    "call_id": "optional-uuid-here",
    "lead_id": 1,
    "duration": 215,
    "duration_formatted": "03:35",
    "outcome": "Scheduled Demo",
    "trust_gain": 25,
    "ai_adherance": 96,
    "in_queue": false,
    "report": {
      "summary": "Prospect engaged actively with AI voice agent and requested enterprise pricing.",
      "talk_ratio": 42,
      "listen_ratio": 58,
      "trust_score": 91,
      "sentiment": {
        "overall": "Positive",
        "confidence": 0.94
      },
      "objections": [
        "Implementation timeline constraints"
      ],
      "key_insights": [
        "Wants to replace legacy call center pipeline within 30 days"
      ],
      "next_step": [
        "Send executive summary and calendar invite"
      ]
    }
  }
  ```
- **Response `201 Created`:**
  - Automatically generates UUID if omitted.
  - Updates associated `Lead`: increments `total_call`, updates `last_call` timestamp, and sets new `trust_gain`.
  - Automatically registers a `LeadActivity` ('Call Logged').

### 2.3 Get Call Details
- **Endpoint:** `GET /api/calls/{id}` (accepts numeric ID or UUID `call_id`)
- **Response `200 OK`:** Returns call object with `lead`, `agent`, and embedded `report`.

### 2.6 Get AI Call Report (Full 5-Section Figma Report)
- **Endpoint:** `GET /api/calls/{id}/report`
- **Description:** Returns the complete coaching and performance analysis formatted specifically for the Figma Call Report layout:
  - **Meta Top Bar:** `call_id`, `agent`, `lead_source`, `date`, `time`, `recording_length`, `recording_file_url`, `disclaimer`.
  - **1. Call Summary:** `call_overview`, `summary_disclosure` (legal compliance notice), `key_moments_log` (timeline events with timestamp, icon, title, description, impact badge).
  - **2. Performance Metrics:** `call_duration`, `prompt_utilization` (Used as-is %, Modified %, Off-script %), `response_timing` (average seconds & rating), `coaching_insights`, `response_timing_insight`.
  - **3. Conversion Indicators:** `call_status` (status badge & narrative), `followup_suggestion` (re-engage suggestion, subtitle, due days).
  - **4. Agent Tone & Delivery Feedback:** `tone_alignment` (wave chart points & timeline markers), `energy_profile` (level, narrative, research reference & psychology study link).
  - **5. Agent Sentiment & Responsiveness:** `sentiment_signal` (-1.0 to +1.0 score gauge, label, key moments), `adaptability_moments` (Pacing Shift, Strategy Shift, Tone Adjustment with research links), `coaching_tags` (Reassuring, Assertive, Empathetic, Confident with timestamps & coaching descriptions).
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Call report retrieved successfully.",
    "data": {
      "header": {
        "title": "Call Report",
        "subtext": "(No Transcript, No Lead Data Recorded or Processed)",
        "available_actions": ["download_pdf", "print_report", "share_report"]
      },
      "meta": {
        "call_id": "PX-48291",
        "agent": "Bryce Lowe",
        "lead_source": "Expired Listing",
        "date": "May 21, 2026",
        "recording_length": "7m 11s",
        "recording_length_seconds": 431,
        "recording_file_url": "http://localhost:8000/uploads/recordings/call_123.mp3"
      },
      "call_summary": {
        "section_number": 1,
        "section_title": "1. Call Summary",
        "call_overview": "You opened the call with a clear value statement and set expectations early...",
        "summary_disclosure": "This coaching report was generated solely from the agent's side of the conversation...",
        "key_moments_log": [
          { "time": "00:45", "icon": "message-square", "title": "Used AI prompt to open with value framing.", "impact": "High Impact", "impact_variant": "success" },
          { "time": "03:18", "icon": "alert-triangle", "title": "Navigated pricing objection with empathy.", "impact": "Effective", "impact_variant": "warning" },
          { "time": "04:12", "icon": "users", "title": "Built rapport by mirroring tone and pace.", "impact": "High Impact", "impact_variant": "success" },
          { "time": "06:42", "icon": "target", "title": "Issued CTA to schedule appointment.", "impact": "Moderate", "impact_variant": "amber" }
        ]
      },
      "performance_metrics": {
        "section_number": 2,
        "section_title": "2. Performance Metrics",
        "call_duration": { "formatted": "7m 11s", "seconds": 431 },
        "prompt_utilization": { "used_as_is": 62, "modified": 28, "off_script": 10 },
        "response_timing": { "average": "1.9s", "average_seconds": 1.9, "rating": "Excellent" },
        "coaching_insights": "You used AI guidance effectively while maintaining a natural delivery...",
        "response_timing_insight": "Your average time between prompt and response was 1.9 seconds..."
      },
      "conversion_indicators": {
        "section_number": 3,
        "section_title": "3. Conversion Indicators",
        "call_status": { "status": "SUCCESS", "badge": "✓ SUCCESS ✓", "narrative": "You issued a strong CTA..." },
        "followup_suggestion": { "title": "Re-engage within 3 days", "subtitle": "Send a calendar link and short value recap.", "due_days": 3 }
      },
      "agent_tone_and_delivery": {
        "section_number": 4,
        "section_title": "4. Agent Tone & Delivery Feedback",
        "tone_alignment": {
          "timeline_points": [{ "time": "00:00", "score": 50 }, { "time": "02:00", "score": 65 }, { "time": "07:11", "score": 70 }],
          "markers": [{ "time": "02:55", "label": "Warm and confident opening", "color": "green" }]
        },
        "energy_profile": {
          "level": "High",
          "label": "ENERGY LEVEL",
          "narrative": "Your vocal energy was consistently high and engaging...",
          "research_study": "Frontiers in Psychology Study",
          "research_url": "https://www.frontiersin.org/journals/psychology"
        }
      },
      "agent_sentiment_and_responsiveness": {
        "section_number": 5,
        "section_title": "5. Agent Sentiment & Responsiveness",
        "sentiment_signal": {
          "score": 0.61,
          "formatted_score": "+0.61",
          "label": "POSITIVE COACHING ALIGNMENT",
          "score_range": "-1.0 (Negative) to +1.0 (Positive)",
          "key_moments": [{ "time": "02:55", "score": "+0.48", "label": "Confident opening" }]
        },
        "adaptability_moments": [
          { "time": "04:12", "title": "Pacing Shift", "research_title": "Harvard Study on Trust & Pace" },
          { "time": "07:20", "title": "Strategy Shift", "research_title": "Salesforce Research on Adaptability" }
        ],
        "coaching_tags": [
          { "tag": "Reassuring", "time": "03:18", "variant": "teal", "description": "You acknowledged the concern..." },
          { "tag": "Assertive", "time": "05:44", "variant": "blue", "description": "You stated value clearly..." },
          { "tag": "Empathetic", "time": "04:12", "variant": "orange", "description": "You showed understanding..." },
          { "tag": "Confident", "time": "06:42", "variant": "purple", "description": "You closed with confidence..." }
        ]
      }
    }
  }
  ```

### 2.7 Save / Update AI Call Report
- **Endpoint:** `POST /api/calls/{id}/report` or `PUT /api/calls/{id}/report`
- **Request Body (JSON):** Accepts any or all of the 5 sections (`call_summary`, `performance_metrics`, `conversion_indicators`, `agent_tone_and_delivery`, `agent_sentiment_and_responsiveness`) or flat parameters (`summary`, `key_moment_log`, `prompt_utilization`, `response_time`, `cache_insight`, `response_timing_insight`, `conversion_indicators`, `agent_tone_and_feedback`, `sentiment`).
- **Response `200 OK`:** Saves the report in database and returns the fresh formatted 5-section response.

### 2.5 Save / Update AI Call Report
- **Endpoint:** `POST /api/calls/{id}/report` or `PUT /api/calls/{id}/report`
- **Request Body (JSON):** Updates or creates full AI metrics (summary, sentiment, talk/listen ratio, trust score, objections, conversion indicators, prompt utilization).

### 2.6 Upload Call Audio Recording
- **Endpoint:** `POST /api/calls/{id}/recording`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `recording`: Audio file (`.mp3, .wav, .m4a, .webm, .ogg`, max 50MB).
- **Response `200 OK`:** Uploads recording to `public/uploads/recordings/` and saves `recording_file_url` to the report.

### 2.7 Delete Call
- **Endpoint:** `DELETE /api/calls/{id}`

---

## 3. AI Training Content Module

Allows uploading documents, media, and prompt scripts to train the AI Voice and Qualification Agents.

### 3.1 List Training Contents & User Progress
- **Endpoint:** `GET /api/training-contents`
- **Query Parameters:**
  - `content_category` *(string, optional)*: `Sales Bio`, `Company Info`, `Scripts & Flows`, `Objections`, `Marketing & Listing Presentation`, `Past Sales Data`, `Other Resources`.
  - `type` *(string, optional)*: `Document`, `Audio`, `Video`, `PDF`, `Text`.
  - `status` *(string, optional)*: `Pending`, `Processing`, `Trained`, `Failed`, `Active`.
  - `is_active` *(boolean, optional)*: `true` or `false`.
  - `search` *(string, optional)*.
- **Response `200 OK`:**
  Includes user's live training progress metrics (percentage, completed categories out of 7, last updated text) matching the top progress bar UI:
  ```json
  {
    "status": 200,
    "message": "Training contents retrieved successfully.",
    "progress": {
      "percentage": 43,
      "percentage_text": "43% Complete",
      "completed_categories_count": 3,
      "total_categories_count": 7,
      "last_updated": "Last updated: July 18, 2026",
      "last_updated_at": "2026-07-18T10:30:00.000000Z",
      "categories": {
        "Sales Bio": { "is_completed": true, "count": 1 },
        "Company Info": { "is_completed": true, "count": 1 },
        "Scripts & Flows": { "is_completed": false, "count": 0 },
        "Objections": { "is_completed": true, "count": 1 },
        "Marketing & Listing Presentation": { "is_completed": false, "count": 0 },
        "Past Sales Data": { "is_completed": false, "count": 0 },
        "Other Resources": { "is_completed": false, "count": 0 }
      }
    },
    "data": [ ... ],
    "pagination": { ... }
  }
  ```

### 3.2 Upload Training Content
- **Endpoint:** `POST /api/training-contents`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `file`: Training resource file (PDF, DOCX, TXT, CSV, MP3, WAV, MP4, max 50MB).
  - `content_category`: Category string (e.g. `Sales Bio`, `Company Info`, `Scripts & Flows`, `Objections`, `Marketing & Listing Presentation`, `Past Sales Data`, `Other Resources`).
  - `type`: Optional (auto-detected if omitted: e.g. `.pdf` ➔ `PDF`, `.mp3` ➔ `Audio`, `.mp4` ➔ `Video`).
  - `status`: Optional (`Pending` by default, or `Trained`).
- **Response `201 Created`:**
  ```json
  {
    "status": 201,
    "message": "Training content uploaded and registered successfully.",
    "data": {
      "id": 1,
      "user_id": 1,
      "content_category": "Sales Pitch",
      "type": "Document",
      "file": "uploads/training/ai_train_1726830000_abc.pdf",
      "file_url": "http://localhost:8000/uploads/training/ai_train_1726830000_abc.pdf",
      "size": "2.45 MB",
      "status": "Trained",
      "is_active": true,
      "upload_at": "2026-09-20T11:32:00.000000Z"
    }
  }
  ```

### 3.3 Get Training Content Details
- **Endpoint:** `GET /api/training-contents/{id}`

### 3.4 Update Training Content Metadata
- **Endpoint:** `PUT /api/training-contents/{id}` or `PATCH /api/training-contents/{id}`
- **Request Body (JSON):**
  ```json
  {
    "content_category": "Objection Handling",
    "is_active": true,
    "status": "Active"
  }
  ```

### 3.5 Toggle Active Status
- **Endpoint:** `POST /api/training-contents/{id}/toggle-status`
- **Response `200 OK`:** Toggles `is_active` between true and false.

### 3.6 Delete Training Content
- **Endpoint:** `DELETE /api/training-contents/{id}`
- Deletes both the database record and the uploaded file from the storage directory.

---

## 4. In-App Notifications Feed & Channels Module

Provides in-app notification feeds, real-time unread badge counts, read receipts, and channel subscription preference management.

### 4.1 Get In-App Notifications Feed
- **Endpoint:** `GET /api/notifications`
- **Query Parameters:**
  - `unread_only` *(boolean, optional)*: `true` to fetch only unread notifications.
  - `page` *(int, optional)*: Page number.
  - `per_page` *(int, optional)*: Items per page (default: `15`).
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Notifications retrieved successfully.",
    "unread_count": 1,
    "data": [
      {
        "id": "40c9bbf0-b7da-4a6f-9041-0d7bb8f195de",
        "type": "App\\Notifications\\LeadAlert",
        "notifiable_type": "App\\Models\\User",
        "notifiable_id": 1,
        "data": {
          "title": "New High-Priority Lead Alert",
          "message": "Dr. Sarah Connor requested an urgent platform walkthrough.",
          "action_url": "/leads/1"
        },
        "read_at": null,
        "created_at": "2026-09-20T14:22:20.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 15,
      "total": 1
    }
  }
  ```

### 4.2 Fast Unread Counter (Navbar Badge)
- **Endpoint:** `GET /api/notifications/unread-count`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Unread notifications count retrieved.",
    "data": {
      "unread_count": 1
    }
  }
  ```

### 4.3 Dispatch Test In-App Notification (Testing / Dev)
- **Endpoint:** `POST /api/notifications/test`
- **Request Body (JSON):**
  ```json
  {
    "title": "New High-Priority Lead Alert",
    "message": "Dr. Sarah Connor requested an urgent platform walkthrough.",
    "action_url": "/leads/1",
    "type": "LeadAlert"
  }
  ```
- **Response `201 Created`**

### 4.4 Mark Single Notification as Read
- **Endpoint:** `PUT /api/notifications/{id}/read`
- **Response `200 OK`**

### 4.5 Mark All Notifications as Read
- **Endpoint:** `PUT /api/notifications/read-all`
- **Response `200 OK`**

### 4.6 List Notification Channels & Preferences
- **Endpoint:** `GET /api/notifications/channels`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Notification channels retrieved successfully.",
    "data": [
      {
        "id": 1,
        "title": "In-App Notifications",
        "description": "Receive real-time notifications directly within the app interface.",
        "channel_type": "IN APP",
        "is_active": true
      },
      {
        "id": 2,
        "title": "Call Reminders",
        "description": "Receive prompt reminders before scheduled calls and meetings.",
        "channel_type": "CALL REMAINDER",
        "is_active": true
      }
    ]
  }
  ```

### 4.7 Toggle Channel Subscription Preference
- **Endpoint:** `POST /api/notifications/channels/{id}/toggle`
- **Response `200 OK`:** Toggles `is_active` for user channel subscription.

### 4.8 Clear All Notifications
- **Endpoint:** `DELETE /api/notifications/clear-all`

### 4.9 Delete Single Notification
- **Endpoint:** `DELETE /api/notifications/{id}`

---

## 5. Remaining Modules Roadmap & Full Specifications

The complete endpoint specifications, JSON payloads, and schemas for the remaining modules are documented in:
👉 **[REMAINING_MODULES_API_DOCS.md](file:///z:/fuyad-backend/office-folder/brycelowe/docs/REMAINING_MODULES_API_DOCS.md)**

| Module / Tables | Related Models | Scope & Planned Endpoints |
| :--- | :--- | :--- |
| **1. AI Calibrations**<br>`calibrations`<br>`calibration_rounds` | `Calibration`<br>`CalibrationRound` | `GET /api/calibrations`, `POST /api/calibrations/start`, `GET /api/calibrations/{id}`, `POST /api/calibrations/{id}/rounds`, `POST /api/calibrations/{id}/complete`, `DELETE /api/calibrations/{id}` |
| **2. Client Company Profile API**<br>`company_profiles` | `CompanyProfile` | `GET /api/company-profile`, `POST /api/company-profile` (supports avatar/logo upload), `DELETE /api/company-profile/avatar` |
| **3. Public & Admin Newsletter API**<br>`newsletter_subscribers` | `NewsletterSubscriber` | `POST /api/newsletter/subscribe`, `POST /api/newsletter/unsubscribe`, `GET /api/admin/newsletter/subscribers`, `POST /api/admin/newsletter/broadcast` |
| **4. Discounts & Overage Rates**<br>`discounts`<br>`overages_rates` | `Discount`<br>`OveragesRate` | `GET /api/admin/discounts`, `POST /api/admin/discounts`, `PUT /api/admin/discounts/{id}`, `DELETE /api/admin/discounts/{id}`, `GET /api/admin/overages-rates`, `POST /api/admin/overages-rates` |
