# WorkSite Portal — Demo

Mobile-first HR & operations portal for a Dubai construction company. This is the
10-user pilot/demo build covering: role-based profiles & directory, material
(procurement) requests, petty cash claims with receipt photos, and in-system
self check-in/out attendance with office vs. site overtime logic.

Designed for older, less tech-savvy field workers: large touch targets, plain
language, obvious flows, and a clear status badge + timeline on every request.

## Tech

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with lightweight shadcn-style UI components
- **Prisma** ORM
- **SQLite** for the demo (zero external setup). Swap to Postgres/Supabase for
  production — see `.env.example`.
- **NextAuth** Credentials provider (admin-generated User ID + password, no email)
- Receipt uploads stored on local disk under `public/uploads` (maps to Supabase
  Storage in production)

## Quick start

```bash
npm install
npm run setup     # creates the SQLite DB + seeds 10 demo users and sample data
npm run dev       # http://localhost:3000
```

If you ever want a clean slate: `npm run db:reset`.

## Demo logins

All users share the password **`Welcome@123`**. First login forces a password
reset (this is the intended security flow).

| User ID | Name          | Role               |
| ------- | ------------- | ------------------ |
| EMP1001 | Aisha Khan    | Admin / HR         |
| EMP1002 | Rajesh Kumar  | Manager (Site)     |
| EMP1003 | Mohammed Ali  | Manager (Procurement) |
| EMP1004 | Priya Nair    | Finance            |
| EMP1005 | Suresh Babu   | Employee (Site)    |
| EMP1006 | Abdul Rahman  | Employee (Site)    |
| EMP1007 | Ramesh Singh  | Employee (Site)    |
| EMP1008 | Lakshmi Menon | Employee (Office)  |
| EMP1009 | John David    | Employee (Office)  |
| EMP1010 | Bilal Ahmed   | Employee (Site)    |

Roles to try:
- **EMP1005 (Site employee):** submit a material request / petty cash claim; sees
  only basic info in the directory; self check-in/out shows overtime after 8h.
- **EMP1003 (Procurement manager):** approve/reject material requests; sees full
  profile details in the directory.
- **EMP1004 (Finance):** approve petty cash claims and mark them Paid.

## Roles & access

| Role     | Procurement approve | Petty cash approve/pay | Full profile details |
| -------- | ------------------- | ---------------------- | -------------------- |
| ADMIN_HR | yes                 | yes                    | yes                  |
| MANAGER  | yes                 | —                      | yes                  |
| FINANCE  | —                   | yes                    | yes                  |
| EMPLOYEE | —                   | —                      | own profile only     |

## Attendance rules (demo)

- **Office:** expected start 08:00, 15-min grace, fixed 10-hour day, no overtime.
- **Site:** expected start 07:00, 15-min grace, overtime counted beyond 8 hours.
- Late check-in and overtime hours are flagged automatically.

## Not in this demo (deferred, by design)

WhatsApp/SMS credential delivery (credentials handed out manually), supervisor-
proxy attendance, GPS geofence + selfie verification, multi-level approvals,
UAE overtime-law/Friday rules, visa/labor-card expiry reminders.

## Notes

- The demo uses SQLite, so Prisma enums are stored as strings (constrained in
  `src/lib/enums.ts`). On Postgres these become native enums.
- UI copy lives in `src/lib/i18n.ts` so additional languages (Arabic/RTL, Hindi,
  etc.) can be added later without touching components.
```
