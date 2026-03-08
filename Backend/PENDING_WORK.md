# CampusEventHub — Pending Work Tracker

> Last updated: 07 March 2026

---

## MILESTONE 2 — Admin & SuperAdmin Dashboard (Current)

### ✅ COMPLETED (Backend)

| # | Task | Status |
|---|------|--------|
| 1 | College Model + CRUD routes | ✅ Done |
| 2 | Club Model + normalization | ✅ Done |
| 3 | User model updated with `collegeId` / `clubId` refs | ✅ Done |
| 4 | Event model updated with `collegeId`, `isPublic`, `moderation` | ✅ Done |
| 5 | ERegistration model with `isCrossCollege`, `Pending_Approval` | ✅ Done |
| 6 | Notification model with `Submission_Update` type | ✅ Done |
| 7 | AdminController — event approval/rejection (same college) | ✅ Done |
| 8 | AdminController — college events/students/organizers/clubs | ✅ Done |
| 9 | AdminController — cross-college registration review | ✅ Done |
| 10 | AdminController — college analytics | ✅ Done |
| 11 | SuperAdminController — college CRUD (soft delete) | ✅ Done |
| 12 | SuperAdminController — admin CRUD (create/list/remove) | ✅ Done |
| 13 | SuperAdminController — platform analytics | ✅ Done |
| 14 | Admin & SuperAdmin routes mounted in `index.js` | ✅ Done |
| 15 | Public `/colleges` route for signup dropdown | ✅ Done |
| 16 | Updated AuthControl (signup → `collegeId`, login JWT, `/auth/me` populates) | ✅ Done |
| 17 | Updated EventController (auto-approve admin events, `isPublic` filter) | ✅ Done |
| 18 | Updated ERegistrationController (cross-college detection) | ✅ Done |
| 19 | Updated ProfileController (club ops via Club model) | ✅ Done |
| 20 | Seed script (`createUsers.js`) updated for new schema | ✅ Done |

### ✅ COMPLETED (Frontend — Student & Organizer only)

| # | Task | Status |
|---|------|--------|
| 1 | Registration page → college dropdown (fetches from `/colleges`) | ✅ Done |
| 2 | Student Events → filter by `collegeId` instead of `collegeName` | ✅ Done |
| 3 | Student Profile → display `collegeId.name`, remove college from edit | ✅ Done |
| 4 | Organizer Profile → use `collegeId.name`, `clubId.name`, Club model API | ✅ Done |
| 5 | ViewParticipants → `collegeId.name` in table/modal/search | ✅ Done |
| 6 | Organizer Notification page (inbox for approvals/registrations) | ✅ Done |
| 7 | Organizer Sidebar → Inbox link added | ✅ Done |

---

### 🔲 PENDING — Backend

| # | Task | Detail |
|---|------|--------|
| B1 | Promote student to organizer | Admin endpoint to change a student's `role` to `organizer`. Seen in Approvals mockup ("Promote to Organizer" button). |
| B2 | Admin: send notification to college | Endpoint for admin to send a notification to all students/organizers in their college (Notify page in mockup). |
| B3 | Admin: create event directly | Allow admin to create events via the admin dashboard (uses existing `/events` but from admin context). May need UI-specific tweaks. |
| B4 | Admin: delete/edit user | Endpoint to soft-delete or edit a user from admin panel (Users mockup shows edit/delete icons). |
| B5 | Registration trend data | Endpoint to return weekly/monthly registration counts for the analytics chart visible in the dashboard mockup. |
| B6 | Organizer status list | Return organizers grouped by club with their event counts (visible in dashboard "Organizer Status" widget). |
| B7 | Seed script testing | Run and verify the updated `createUsers.js` produces correct data with all new collections. |

### 🔲 PENDING — Frontend (Admin Dashboard)

| # | Task | Detail | Mockup Ref |
|---|------|--------|------------|
| F1 | **Admin Sidebar** | Sidebar with: Overview, Events, Users, Organizers, Approvals, Notify, Profile. Active state highlight. | All mockups |
| F2 | **Admin Layout** | Update `AdminLayout.jsx` to include the new sidebar + header with search bar and admin name badge. | All mockups |
| F3 | **Dashboard Overview** | Stats cards (Total Events, Total Students, Organizers, Pending Review), Registration Trend line chart, Organizer Status list, Recent Submissions table with status badges. | Mockup 1 |
| F4 | **Events Page** | Event cards grid with status badges (Active, Full Capacity, Draft). Tabs: All Events, Upcoming, Drafts, Completed. Category & Sort dropdowns. Pagination. "Create Event" button. | Mockup 2 |
| F5 | **Users Directory** | Stats header (Total Users, Students, Organizers). Filter by role/status. User table with name, role badge, email, joined date, status, edit/delete actions. Pagination. | Mockup 3 |
| F6 | **Organizers Page** | List organizers with their clubs, event counts, status. Filter/search capabilities. | Sidebar shows "Organizers" tab |
| F7 | **Approvals Page** | Three tabs: Event Approvals (approve/reject events), Student to Organizer (promote requests), Event Access Requests (cross-college registrations). Table with requester, details, date, actions. | Mockup 4 |
| F8 | **Notify Page** | Form to compose notification to college students/organizers. Select recipients, type, attach to event. | Sidebar shows "Notify" tab |
| F9 | **Admin Profile** | Profile card with avatar, stats (events managed, approvals). Tabs: Personal Info, Security, Access Levels. Edit form. | Mockup 5 |
| F10 | **Settings Page** | Settings management (if needed). | Sidebar shows "Settings" tab |

### 🔲 PENDING — Frontend (SuperAdmin Dashboard)

| # | Task | Detail |
|---|------|--------|
| F11 | **SuperAdmin Sidebar** | Update sidebar with: Dashboard, Colleges, Admins, Analytics. |
| F12 | **SuperAdmin Layout** | Update `SuperAdminLayout.jsx` with sidebar + header. |
| F13 | **SuperAdmin Dashboard** | Platform-wide analytics — total colleges, users, events, admins. |
| F14 | **Colleges Management** | CRUD interface for colleges — create/edit/delete with soft-delete warning. |
| F15 | **Admins Management** | Create admin form (name, email, phone, password, college dropdown). List admins with college badge. Remove button. |
| F16 | **Platform Analytics** | Detailed analytics view with charts. |

---

## MILESTONE 4 — Feedback, Comments & Verification

### 🔲 PENDING — Backend

| # | Task | Detail |
|---|------|--------|
| B8 | Feedback Model | Create `FeedbackModel` with fields: `userId`, `eventId`, `rating` (1-5), `comment`, `createdAt`. |
| B9 | Feedback CRUD routes | `POST /feedback` (submit), `GET /feedback/event/:eventId` (get all for event), `DELETE /feedback/:id` (delete own). |
| B10 | Event rating aggregation | Compute and return average rating for each event. Add virtual or stored field on Event model. |
| B11 | Comment/Discussion Model | Create `CommentModel` for event discussions with `userId`, `eventId`, `content`, `parentId` (for replies), `createdAt`. |
| B12 | Comment CRUD routes | `POST /comments`, `GET /comments/event/:eventId`, `PUT /comments/:id`, `DELETE /comments/:id`. |
| B13 | Admin feedback analytics | Endpoint for admin to see feedback summary: average ratings per event, most/least rated events, feedback volume trends. |
| B14 | Admin event ratings overview | Aggregate rating data for admin dashboard widget. |

### 🔲 PENDING — Frontend

| # | Task | Detail |
|---|------|--------|
| F17 | **Feedback form on event page** | Star rating + text comment form visible to registered students after event. |
| F18 | **Feedback display** | Show all feedback/reviews on event detail page with avatar, rating stars, comment text. |
| F19 | **Comment/Discussion section** | Threaded comment section on event pages for discussion before/after event. |
| F20 | **Admin feedback dashboard** | Charts showing ratings distribution, top-rated events, feedback trends. |
| F21 | **Admin event ratings view** | Table/cards showing events sorted by rating with detailed feedback. |
| F22 | **Component verification** | Verify every screen's interactive elements work end-to-end (buttons, forms, navigation, modals, toasts). |

---

## Quick Reference — API Endpoints Status

### Admin (`/admin`) — All ✅ Built
```
GET    /admin/events/pending          → Pending events for approval
PATCH  /admin/events/:id/approve      → Approve event
PATCH  /admin/events/:id/reject       → Reject event (with reason)
GET    /admin/events                  → All college events
GET    /admin/organizers              → College organizers
GET    /admin/students                → College students
GET    /admin/clubs                   → College clubs
GET    /admin/analytics               → College analytics
GET    /admin/registrations/pending   → Pending cross-college registrations
PATCH  /admin/registrations/:id/review → Approve/reject registration
```

### SuperAdmin (`/superadmin`) — All ✅ Built
```
POST   /superadmin/colleges           → Create college
GET    /superadmin/colleges           → List colleges
PUT    /superadmin/colleges/:id       → Update college
DELETE /superadmin/colleges/:id       → Soft-delete college
POST   /superadmin/admins             → Create admin
GET    /superadmin/admins             → List admins
DELETE /superadmin/admins/:id         → Remove admin
GET    /superadmin/analytics          → Platform analytics
```

### Needs to be built (Milestone 3)
```
PATCH  /admin/users/:id/promote       → Promote student → organizer
POST   /admin/notifications/send      → Send notification to college
DELETE /admin/users/:id               → Soft-delete user
PUT    /admin/users/:id               → Edit user details
GET    /admin/analytics/trend         → Weekly registration trend data
GET    /admin/organizers/status       → Organizers grouped by club with event counts
```

### Needs to be built (Milestone 4)
```
POST   /feedback                      → Submit feedback
GET    /feedback/event/:eventId       → Get event feedback
DELETE /feedback/:id                  → Delete own feedback
POST   /comments                      → Add comment
GET    /comments/event/:eventId       → Get event comments
PUT    /comments/:id                  → Edit comment
DELETE /comments/:id                  → Delete comment
GET    /admin/feedback/analytics      → Feedback analytics for admin
```
