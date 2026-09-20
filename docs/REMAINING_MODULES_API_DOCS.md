# Pitchprox (Brycelowe) — Remaining Modules API Documentation & Specification

This document provides the complete API specification, schemas, payload examples, and endpoint design for all modules that **currently exist in the database schema/models but are remaining to be exposed via API controllers**.

---

## Summary Matrix of Remaining Modules

| # | Module Name | Database Tables | Eloquent Models | Planned Controller & Routes |
|---|---|---|---|---|
| **1** | **AI Calibrations & Rounds** | `calibrations`, `calibration_rounds` | `Calibration`, `CalibrationRound` | `App\Http\Controllers\API\Calibration\CalibrationController`<br>`/api/calibrations` |
| **2** | **In-App Notifications & Channels** | `user_notifications`, `notification_channels`, `notifications` | `UserNotification`, `NotificationChannel` | `App\Http\Controllers\API\Notification\NotificationController`<br>`/api/notifications` |
| **3** | **Client Company Profile** | `company_profiles` | `CompanyProfile` | `App\Http\Controllers\API\Company\CompanyProfileController`<br>`/api/company-profile` |
| **4** | **Newsletter Subscription & Broadcast** | `newsletter_subscribers` | `NewsletterSubscriber` | `App\Http\Controllers\API\Newsletter\NewsletterApiController`<br>`/api/newsletter` & `/api/admin/newsletter` |
| **5** | **Discounts & Overages Rates** | `discounts`, `overages_rates` | `Discount`, `OveragesRate` | `App\Http\Controllers\API\Admin\AdminDiscountController`<br>`/api/admin/discounts` & `/api/admin/overages` |

---

## 1. AI Calibrations & Calibration Rounds Module

Allows AI voice agents and sales representatives to conduct practice pitch sessions, calculate scores across acoustic/linguistic dimensions, and record round evaluations.

### 1.1 List Calibration Sessions
- **Route:** `GET /api/calibrations`
- **Auth:** `auth:sanctum`
- **Query Parameters:**
  - `status` *(string, optional)*: `pending`, `in_progress`, `completed`.
  - `search` *(string, optional)*: Search in session title.
  - `page` *(int, optional)*: Page number (default: `1`).
  - `per_page` *(int, optional)*: Items per page (default: `15`).
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Calibration sessions retrieved successfully.",
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "title": "Outbound Cold Call Pitch - Healthcare Vertical",
        "timestamp": "2026-09-20 11:30:00",
        "total_time": 420,
        "total_time_formatted": "07:00",
        "overall_score": "88.50",
        "round_completed": 3,
        "status": "completed",
        "completed_at": "2026-09-20 11:37:00",
        "created_at": "2026-09-20T11:30:00.000000Z"
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

### 1.2 Start Calibration Session
- **Route:** `POST /api/calibrations/start`
- **Auth:** `auth:sanctum`
- **Request Body (JSON):**
  ```json
  {
    "title": "Inbound Qualification Speed Test",
    "timestamp": "2026-09-20 11:45:00"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "status": 201,
    "message": "Calibration session started successfully.",
    "data": {
      "id": 2,
      "user_id": 1,
      "title": "Inbound Qualification Speed Test",
      "timestamp": "2026-09-20 11:45:00",
      "total_time": 0,
      "total_time_formatted": "00:00",
      "overall_score": "0.00",
      "round_completed": 0,
      "status": "in_progress",
      "created_at": "2026-09-20T11:45:00.000000Z"
    }
  }
  ```

### 1.3 Get Calibration Details & Scorecard
- **Route:** `GET /api/calibrations/{id}`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Calibration details retrieved successfully.",
    "data": {
      "id": 1,
      "user_id": 1,
      "title": "Outbound Cold Call Pitch - Healthcare Vertical",
      "total_time_formatted": "07:00",
      "overall_score": "88.50",
      "round_completed": 3,
      "status": "completed",
      "rounds": [
        {
          "id": 1,
          "calibration_id": 1,
          "word_choice": "92.00",
          "pacing": "85.00",
          "sentiment": "90.00",
          "tone": "88.00",
          "pause": "80.00",
          "energy": "91.00",
          "score": "87.67",
          "status": "completed"
        },
        {
          "id": 2,
          "calibration_id": 1,
          "word_choice": "94.00",
          "pacing": "88.00",
          "sentiment": "92.00",
          "tone": "90.00",
          "pause": "84.00",
          "energy": "88.00",
          "score": "89.33",
          "status": "completed"
        }
      ]
    }
  }
  ```

### 1.4 Submit Calibration Round Evaluation
- **Route:** `POST /api/calibrations/{id}/rounds`
- **Auth:** `auth:sanctum`
- **Request Body (JSON):**
  ```json
  {
    "word_choice": 92.50,
    "pacing": 88.00,
    "sentiment": 94.00,
    "tone": 90.00,
    "pause": 85.00,
    "energy": 91.00,
    "score": 90.08,
    "duration": 120,
    "status": "completed"
  }
  ```
- **Response `201 Created`:** Automatically updates `round_completed` count, appends duration to `total_time`, and returns the evaluated round.

### 1.5 Finalize & Complete Calibration Session
- **Route:** `POST /api/calibrations/{id}/complete`
- **Auth:** `auth:sanctum`
- **Request Body (JSON, optional):**
  ```json
  {
    "overall_score": 89.50
  }
  ```
- **Response `200 OK`:** Sets `status = 'completed'`, `completed_at = now()`, recalculates `overall_score` across all rounds if omitted.

### 1.6 Delete Calibration Session
- **Route:** `DELETE /api/calibrations/{id}`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:** Cascade deletes session and all round records.

---

## 2. In-App Notifications Feed & Channel Preferences Module

Provides mobile apps and frontends with real-time notification feeds, read receipts, unread counter badges, and notification channel preference toggles.

### 2.1 Get In-App Notifications Feed
- **Route:** `GET /api/notifications`
- **Auth:** `auth:sanctum`
- **Query Parameters:**
  - `unread_only` *(boolean, optional)*: `true` to fetch unread items only.
  - `page` *(int, optional)*: Page number.
  - `per_page` *(int, optional)*: Items per page (default: `20`).
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Notifications retrieved successfully.",
    "unread_count": 3,
    "data": [
      {
        "id": "c7a8b4e2-632b-4221-8f5b-91d9efc21124",
        "type": "App\\Notifications\\LeadAssignedNotification",
        "data": {
          "title": "New High-Priority Lead",
          "message": "Dr. Alexander Wright has been assigned to your queue.",
          "lead_id": 1,
          "action_url": "/leads/1"
        },
        "read_at": null,
        "created_at": "2026-09-20T11:20:00.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 20,
      "total": 1
    }
  }
  ```

### 2.2 Get Unread Notification Count Badge
- **Route:** `GET /api/notifications/unread-count`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "data": {
      "unread_count": 3
    }
  }
  ```

### 2.3 Mark Single Notification as Read
- **Route:** `PUT /api/notifications/{id}/read`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Notification marked as read.",
    "data": {
      "id": "c7a8b4e2-632b-4221-8f5b-91d9efc21124",
      "read_at": "2026-09-20T11:45:00.000000Z"
    }
  }
  ```

### 2.4 Mark All Notifications as Read
- **Route:** `PUT /api/notifications/read-all`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "All notifications marked as read."
  }
  ```

### 2.5 Delete / Dismiss Notification
- **Route:** `DELETE /api/notifications/{id}`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Notification deleted successfully."
  }
  ```

### 2.6 List Notification Channels & Preferences
- **Route:** `GET /api/notifications/channels`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Notification channels retrieved successfully.",
    "data": [
      {
        "id": 1,
        "name": "Email Notifications",
        "slug": "email",
        "type": "email",
        "description": "Receive transactional alerts and daily call summaries via email.",
        "is_active": true
      },
      {
        "id": 2,
        "name": "SMS Alerts",
        "slug": "sms",
        "type": "sms",
        "description": "Urgent notifications sent directly to your mobile phone.",
        "is_active": false
      },
      {
        "id": 3,
        "name": "In-App Push",
        "slug": "push",
        "type": "push",
        "description": "Desktop and mobile in-app notifications.",
        "is_active": true
      }
    ]
  }
  ```

### 2.7 Toggle Notification Channel Preference
- **Route:** `POST /api/notifications/channels/{id}/toggle`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Notification channel preference updated.",
    "data": {
      "channel_id": 2,
      "is_active": true
    }
  }
  ```

---

## 3. Client Company Profile Module

Allows an authenticated account holder to view, configure, and update their business organization profile, branding, and timezone settings.

### 3.1 Get Current User Company Profile
- **Route:** `GET /api/company-profile`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Company profile retrieved successfully.",
    "data": {
      "id": 1,
      "user_id": 1,
      "company_name": "Apex Revenue Group LLC",
      "avatar": "http://localhost:8000/uploads/company/logo_1726830000.png",
      "industry": "Software & AI Consulting",
      "timezone": "America/Chicago",
      "language": "en",
      "created_at": "2026-09-08T05:35:00.000000Z",
      "updated_at": "2026-09-20T10:00:00.000000Z"
    }
  }
  ```

### 3.2 Create or Update Company Profile (Supports Logo Upload)
- **Route:** `POST /api/company-profile`
- **Auth:** `auth:sanctum`
- **Content-Type:** `multipart/form-data` or `application/json`
- **Parameters:**
  - `company_name` *(string, required)*: Business entity name.
  - `avatar` *(file, optional)*: Image file (`jpg, png, webp, svg`, max 5MB).
  - `industry` *(string, optional)*: e.g. `Finance`, `Healthcare`, `Real Estate`.
  - `timezone` *(string, optional)*: Valid timezone string e.g. `America/New_York`.
  - `language` *(string, optional)*: Language code e.g. `en`, `es`, `fr`.
- **Response `200 OK` (or `201 Created`):**
  ```json
  {
    "status": 200,
    "message": "Company profile updated successfully.",
    "data": {
      "id": 1,
      "user_id": 1,
      "company_name": "Apex Revenue Group LLC",
      "avatar": "http://localhost:8000/uploads/company/logo_1726830000.png",
      "industry": "Software & AI Consulting",
      "timezone": "America/New_York",
      "language": "en"
    }
  }
  ```

### 3.3 Delete Company Logo
- **Route:** `DELETE /api/company-profile/avatar`
- **Auth:** `auth:sanctum`
- **Response `200 OK`:** Removes the file from storage and sets `avatar = null`.

---

## 4. Newsletter Subscription & Broadcast Module

Handles public email subscription, double opt-in, unsubscribe handling, and admin broadcast campaigns.

### 4.1 Public Newsletter Subscription
- **Route:** `POST /api/newsletter/subscribe`
- **Auth:** None (Public)
- **Request Body (JSON):**
  ```json
  {
    "email": "subscriber@domain.example",
    "name": "Jordan Smith",
    "source": "Landing Page Footer"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "status": 201,
    "message": "Thank you for subscribing to our newsletter!",
    "data": {
      "email": "subscriber@domain.example",
      "status": "Active",
      "subscribed_at": "2026-09-20T11:45:00.000000Z"
    }
  }
  ```

### 4.2 Public Unsubscribe
- **Route:** `POST /api/newsletter/unsubscribe`
- **Auth:** None (Public)
- **Request Body (JSON):**
  ```json
  {
    "email": "subscriber@domain.example"
  }
  ```
- **Response `200 OK`:** Sets `status = 'Unsubscribed'`, `unsubscribed_at = now()`.

### 4.3 Admin List Subscribers
- **Route:** `GET /api/admin/newsletter/subscribers`
- **Auth:** `auth:sanctum` + `role.admin`
- **Query Parameters:**
  - `status` *(string, optional)*: `Active`, `Unsubscribed`.
  - `search` *(string, optional)*: Search in email or name.
  - `page`, `per_page` *(int, optional)*.

### 4.4 Admin Broadcast Campaign
- **Route:** `POST /api/admin/newsletter/broadcast`
- **Auth:** `auth:sanctum` + `role.admin`
- **Request Body (JSON):**
  ```json
  {
    "subject": "Pitchprox Q3 Product Release & Voice Agent Updates",
    "content": "<p>Hello subscribers, we are excited to announce...</p>",
    "target_status": "Active"
  }
  ```
- **Response `200 OK`:** Queues email campaign to all active subscribers.

### 4.5 Admin Delete Subscriber
- **Route:** `DELETE /api/admin/newsletter/subscribers/{id}`
- **Auth:** `auth:sanctum` + `role.admin`

---

## 5. Discounts & Overage Rates Module (Admin Management)

Allows administrators to configure promo discount codes and per-minute / per-call overage rates for plans.

### 5.1 Admin List Discounts
- **Route:** `GET /api/admin/discounts`
- **Auth:** `auth:sanctum` + `role.admin`
- **Query Parameters:** `plan_id`, `is_active`, `search`.
- **Response `200 OK`:**
  ```json
  {
    "status": 200,
    "message": "Discounts retrieved successfully.",
    "data": [
      {
        "id": 1,
        "plan_id": 2,
        "plan": {
          "id": 2,
          "name": "Professional Tier"
        },
        "title": "Summer Launch 20% Off",
        "code": "SUMMER20",
        "percent": 20,
        "amount": null,
        "valid_until": "2026-10-31 23:59:59",
        "is_active": true
      }
    ]
  }
  ```

### 5.2 Admin Create Discount Code
- **Route:** `POST /api/admin/discounts`
- **Auth:** `auth:sanctum` + `role.admin`
- **Request Body (JSON):**
  ```json
  {
    "plan_id": 2,
    "title": "Enterprise Black Friday",
    "code": "BF2026",
    "percent": 25,
    "amount": null,
    "valid_until": "2026-12-01 00:00:00",
    "is_active": true
  }
  ```

### 5.3 Admin Update Discount Code
- **Route:** `PUT /api/admin/discounts/{id}`
- **Auth:** `auth:sanctum` + `role.admin`

### 5.4 Admin Toggle Discount Code Status
- **Route:** `POST /api/admin/discounts/{id}/toggle`
- **Auth:** `auth:sanctum` + `role.admin`

### 5.5 Admin Delete Discount Code
- **Route:** `DELETE /api/admin/discounts/{id}`
- **Auth:** `auth:sanctum` + `role.admin`

### 5.6 Admin List & Configure Overage Rates
- **Route:** `GET /api/admin/overages-rates`
- **Route:** `POST /api/admin/overages-rates`
- **Auth:** `auth:sanctum` + `role.admin`
- **Request Body (JSON):**
  ```json
  {
    "plan_id": 2,
    "overages_type": "Minute",
    "overages_rate": 0.08
  }
  ```
- **Response `200 OK`:** Configures or updates the billing rate per overage unit.
