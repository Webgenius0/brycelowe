# Memoooxy System & Admin Dashboard

Memoooxy is a Laravel + React (Inertia.js & Vite) platform for managing users, membership passes, business attractions, point redemptions, payouts, and financial analytics.

## Key Features & Architecture

### 📊 System Overview & Analytics Dashboard
- **Period & Lifetime Mode**: Toggle between Lifetime Total metrics and Selected Period metrics.
- **Date Presets & Filtering**: Fast presets for Today, Yesterday, This Week, This Month, Previous Month, Last 30 Days, Last 6 Months, Last Year, and Custom Date Ranges.
- **System Activity Chart**: Real-time breakdown of signups, registered businesses, and point redemptions.
- **Role Breakdown**: Live breakdown of Admins, Partners, and Customers for selected time periods.

### 🎟️ Membership Passes
- **Pass Management**: Create, edit, list, and soft-delete membership passes.
- **Rich HTML Descriptions**: Integrated rich text HTML editor for pass benefits and terms.
- **Attractions Association**: Link pass tiers to participating business attractions.

### 👥 Users & Account Analytics
- **User Analytics Grid**: Top metric cards showing Total Users, Active Users, Admins, Partners, and New Users Registered This Month.
- **Role & Status Controls**: Admin, Partner, and User role management.
- **Data Export**: Export user datasets to CSV and Excel formats.

### 💳 Payments, Payouts & Redemptions
- **Stripe & Payment Tracking**: Payment records and subscription status tracking.
- **Point Redemptions**: Approval workflow for customer point redemptions at business attractions.
- **Partner Payouts**: Payout history tracking for attraction partners.

## Tech Stack
- **Backend**: PHP 8.2+ / Laravel 11
- **Frontend**: React 18 / TypeScript / Inertia.js / Vite
- **Styling**: TailwindCSS / Lucide Icons / Recharts / Shadcn UI components
