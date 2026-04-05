# Admin — User Guide

> Role: `admin` · Access: College-scoped (your college only)

---

## Overview

The Admin is the college-level operator of the platform. Every admin is tied to exactly one college and can only see and manage data belonging to that college. Admins are created by the Superadmin during college onboarding — they cannot self-register.

**Login:** Same login page as all roles (`/login`). The system detects the `admin` role and redirects to `/admin/dashboard`.

---

## Navigation

The sidebar has 5 sections:

| Menu Item | Route | Purpose |
|---|---|---|
| Dashboard | `/admin/dashboard` | College stats, pending submissions, charts |
| Approvals | `/admin/approvals` | Review queue for events, promotions, access, students |
| Events | `/admin/events` | Manage all college events |
| Users | `/admin/users` | Manage students, organizers, clubs |
| Notify Hub | `/admin/notify-hub` | Send notifications to users |

---

## Pages

### 1. Dashboard (`/admin/dashboard`)

The main overview. Loads data from `GET /admin/dashboard-stats`, `GET /admin/events/pending`, and `GET /admin/analytics/event-performance`.

**Stat cards (top row):**

| Card | What it shows |
|---|---|
| Total Events | All events ever created in your college |
| Total Students | All enrolled students |
| Ongoing Events | Events currently active |
| Pending Review | Events awaiting your approval — shown in dark card as an action signal |

**Charts (middle row):**

Two chart tabs:

- Trend — Area chart of student registrations over the last 7 months
- Performance — Composed chart showing total registrations vs average rating per event (bar + line)

Alongside the charts, an Ongoing Events card shows a bar chart of active events broken down by category, plus a list of the 3 most recent ongoing events.

**Recent Submissions table (bottom):**

Shows the top 5 pending event submissions with:
- Event name
- Organizer name (with initials avatar)
- Submission date
- Status badge
- Actions menu (Approve / Reject)

Clicking "Review All Requests" navigates to `/admin/approvals`.

**Approving from the dashboard:**
1. Click the `⋯` button on any submission row
2. Click "Approve Event" — calls `PATCH /admin/events/:id/approve`
3. The organizer receives an in-app notification automatically

**Rejecting from the dashboard:**
1. Click `⋯` → "Reject Event"
2. A modal appears — enter a rejection reason (required)
3. Click "Send & Reject" — calls `PATCH /admin/events/:id/reject` with `{ reason }`
4. The organizer receives a notification with the reason

---

### 2. Approvals (`/admin/approvals`)

The full review queue. All four approval types are loaded in parallel on page load. Paginated at 6 items per page.

**Four tabs:**

#### Event Approvals
Pending events submitted by organizers (`status: Submitted`).

Each row shows:
- Event title + organizer name
- Category, seat count, venue
- Submission date and time
- Approve / Reject buttons

Actions:
- "Approve Event" → `PATCH /admin/events/:id/approve` — sets status to Approved, notifies organizer
- "Reject" → opens reason modal → `PATCH /admin/events/:id/reject` — sets status to Rejected, sends reason as notification

> Only events with `status: Submitted` appear here. You cannot approve/reject already-approved or draft events from this queue.

#### Student to Organizer
Students who have requested a promotion to the organizer role.

Each row shows:
- Student name + ID (last 5 chars of MongoDB ID)
- Their stated reason for requesting promotion
- Request date and time

Actions:
- "Promote to Organizer" → `PATCH /admin/promotions/:id/approve` — upgrades the student's role
- "Deny" → opens reason modal → `PATCH /admin/promotions/:id/deny`

#### Event Access Requests
Students requesting access to events from other colleges (cross-college registrations).

Each row shows:
- Student name + which event they want access to
- Department info
- Request date

Actions:
- "Grant Access" → `PATCH /admin/access-requests/:id/grant`
- "Reject Request" → opens reason modal → `PATCH /admin/access-requests/:id/reject`

> You only see requests from students belonging to your college, regardless of which college's event they want to attend.

#### Student Registrations
New students who have registered on the platform and are pending account approval.

Each row shows:
- Student name + email
- Department + year of study
- Registration date

Actions:
- "Approve Student" → `PATCH /admin/students/:id/approve` — activates the account
- "Reject" → opens reason modal → `PATCH /admin/students/:id/reject`

---

### 3. Events (`/admin/events`)

Full event management for your college. Calls `GET /admin/events`.

**Filters:**
- Search bar — filter by title, location, or organizer name
- Status filter — All, Approved, Submitted, Draft, Rejected
- Category filter — All, Competition, Conference, Workshop, Seminar, Sports, Cultural, Other

**Event card shows:**
- Poster image (or category icon placeholder)
- Status badge (color-coded)
- Category tag
- Paid event badge with price (if applicable)
- Event title, date, location
- Creator name

**Actions (⋯ menu on each card):**

- Edit Event — opens a full edit modal
- Change Status — directly set to Approved / Submitted / Draft / Rejected

**Creating an event (admin-created events are auto-approved):**
1. Click the "+ Create Event" button
2. Fill in: title, category, location, description, event date, start/end time, registration deadline, max seats
3. Toggle "Paid Event" to add a ticket price
4. Toggle "Public Event" to control visibility
5. Optionally upload a poster (image, max 5MB)
6. Submit → calls `POST /admin/events` — event is created with `status: Approved` automatically

**Editing an event:**
1. Click ⋯ → "Edit Event"
2. Modify any field including poster
3. Save → calls `PUT /admin/events/:id`

**Changing event status:**
1. Click ⋯ on any card
2. Under "Status" section, click the target status
3. Calls `PUT /admin/events/:id` with `{ status: "..." }`

---

### 4. Users (`/admin/users`)

Manages all people in your college. Calls `GET /admin/users`.

**Three tabs:**

#### Students
All students in your college. Shows name, email, department, year, status.

Actions per student:
- Edit (pencil icon) — opens edit modal
- Delete (trash icon) — soft-deletes the user (`PATCH /admin/users/:id/delete`)

#### Organizers
All organizers in your college. Shows name, email, club assignment.

Same edit/delete actions as students.

#### Clubs
All clubs in your college. Shows club name, category, assigned organizer.

**Creating a club:**
1. Click "+ New Club"
2. Enter club name (required), category, description
3. Submit → calls `POST /admin/clubs`

**Viewing club details:**
1. Click the "→" arrow on any club card
2. Opens a detail modal showing club info, current organizer, and members
3. You can assign a student as organizer from this modal

**Assigning an organizer to a club:**
1. Open club detail modal
2. Search for a student by name or email
3. Select them from the dropdown
4. Click "Assign as Organizer" → calls `POST /admin/clubs/assign-organizer` with `{ clubId, userId }`
5. The student's role is automatically upgraded to `organizer`

**Removing an organizer from a club:**
1. Open club detail modal
2. Click "Remove Organizer" → calls `POST /admin/clubs/remove-organizer` with `{ clubId, userId }`
3. The organizer is demoted back to `student` and their club association is cleared

**Editing a user:**
1. Click the edit icon on any user row
2. Modify: full name, email, role, department, year of study
3. Save → calls `PUT /admin/users/:id`

> Changing a user's role via the edit modal directly updates their access level. Use the Approvals page for the formal promotion workflow.

---

### 5. Notify Hub (`/admin/notify-hub`)

Send notifications to users in your college. Calls `POST /admin/notifications` (or equivalent notification endpoint).

Compose a notification with:
- Target audience (all students, all organizers, specific event participants)
- Title
- Message body

Sent notifications appear in the history list below the composer.

---

## API Reference

All routes require a valid JWT token with `role: admin`. The middleware automatically scopes all queries to `req.user.collegeId`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard-stats` | College stats for dashboard |
| GET | `/admin/events/pending` | Events with status: Submitted |
| PATCH | `/admin/events/:id/approve` | Approve a submitted event |
| PATCH | `/admin/events/:id/reject` | Reject with reason (body: `{ reason }`) |
| GET | `/admin/events` | All events in your college |
| POST | `/admin/events` | Create event (auto-approved) |
| PUT | `/admin/events/:id` | Update event fields or status |
| GET | `/admin/organizers` | All organizers in your college |
| GET | `/admin/students` | All students in your college |
| GET | `/admin/clubs` | All clubs in your college |
| POST | `/admin/clubs` | Create a new club |
| GET | `/admin/clubs/:id` | Club detail with organizers and members |
| POST | `/admin/clubs/assign-organizer` | Assign organizer to club (body: `{ clubId, userId }`) |
| POST | `/admin/clubs/remove-organizer` | Remove organizer from club (body: `{ clubId, userId }`) |
| GET | `/admin/analytics` | College-level analytics |
| GET | `/admin/registrations/pending` | Cross-college registration requests from your students |
| PATCH | `/admin/registrations/:id/review` | Approve or reject cross-college registration (body: `{ action, reason }`) |
| GET | `/admin/promotions/pending` | Students requesting organizer promotion |
| PATCH | `/admin/promotions/:id/approve` | Promote student to organizer |
| PATCH | `/admin/promotions/:id/deny` | Deny promotion with reason |
| GET | `/admin/students/pending` | Students pending account approval |
| PATCH | `/admin/students/:id/approve` | Approve student account |
| PATCH | `/admin/students/:id/reject` | Reject student registration |
| GET | `/admin/access-requests/pending` | Cross-college event access requests |
| PATCH | `/admin/access-requests/:id/grant` | Grant event access |
| PATCH | `/admin/access-requests/:id/reject` | Reject access request |
| GET | `/admin/users` | All users in your college |
| PUT | `/admin/users/:id` | Update any user's details |
| PATCH | `/admin/users/:id/delete` | Soft-delete a user |
| GET | `/admin/profile` | Admin's own profile data |

---

## Key Rules & Constraints

- All data is strictly scoped to your college — you cannot see or modify users or events from other colleges
- You can only approve/reject events that belong to your college and have `status: Submitted`
- Admin-created events skip the approval queue and are set to `Approved` immediately
- Rejection always requires a reason — it is sent as a notification to the affected user
- Deleting a user is a soft delete — the record is retained with `isDeleted: true`
- Assigning a student as club organizer automatically upgrades their role to `organizer`
- Removing an organizer from a club automatically demotes them back to `student`
- Cross-college registration requests are reviewed by the student's home college admin, not the event's college admin
- Admin accounts are created by the Superadmin only — admins cannot create other admins
