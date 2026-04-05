# Super Admin — User Guide

> Role: `superadmin` · Access: Platform-wide (all colleges, all users, all events)

---

## Overview

The Super Admin is the root-level operator of the platform. They have full visibility and control over every college, user, and event across the entire system. No college-level restrictions apply.

**Login:** Same login page as other roles (`/login`). The system detects the `superadmin` role and redirects to `/superadmin/dashboard`.

---

## Navigation

The sidebar has 4 sections:

| Menu Item | Route | Purpose |
|---|---|---|
| Dashboard | `/superadmin/dashboard` | Platform-wide analytics & system health |
| Events | `/superadmin/events` | View & manage all events across all colleges |
| College Setup | `/superadmin/setup` | Register a new college + create its admin |
| Institutions | `/superadmin/institutions` | Browse all registered colleges |

---

## Pages

### 1. Dashboard (`/superadmin/dashboard`)

The main control center. Loads live data from `GET /superadmin/analytics`.

**What you see:**

- **Stat cards** — Total colleges, users, events, organizers, admins, clubs
- **Platform Growth chart** — Toggle between "Events Created" (area chart) and "User Registrations" (bar chart) over the last 6 months
- **System Core Status** — Live health checks for: API server, Database, Auth services, File storage (Cloudinary)
- **Event Status Breakdown** — Count of Approved / Submitted / Rejected / Draft events
- **Recent Events** — Last 5 events created across the platform with status and college name
- **Recent Users** — Last 5 registered users with role, college, and email
- **Events by Category** — Progress bars showing distribution across Competition, Workshop, Cultural, etc.
- **Pending Alert Banner** — Appears at the bottom if any events are in `Submitted` (pending review) state

---

### 2. College Setup (`/superadmin/setup`)

Used to onboard a new institution. This is a two-step form that creates both the college record and its first admin account in one submission.

**Form fields:**

Section 1 — College Infrastructure:
- `College Name` (required) — Official name of the institution
- `Location / City` — e.g. "Mangalore, Karnataka"
- `Institutional Domain` — e.g. `bits-pilani.ac.in` (used for domain-based email verification)

Section 2 — Admin Identity & Security:
- `Admin Full Name` (required)
- `Admin Email` (required) — This becomes the admin's login email
- `Phone Number` (required) — Must be exactly 10 digits
- `Initial Password` (required) — Minimum 8 characters. Admin can reset later from their profile.

**What happens on submit:**
1. Calls `POST /superadmin/colleges` → creates the college (auto-marked as verified)
2. Calls `POST /superadmin/admins` → creates a user with `role: admin` linked to that college
3. An email is sent to the admin with their login credentials and a link to the platform

**Validations:**
- All required fields must be filled
- Phone must be exactly 10 digits
- Password must be at least 8 characters
- Duplicate college names are rejected by the backend

---

### 3. Institutions (`/superadmin/institutions`)

Lists all registered colleges as cards. Calls `GET /superadmin/colleges`.

Each card shows:
- College logo (or a default icon)
- College name
- Location
- Verification status badge

Click any card to go to that college's detail page.

---

### 4. College Detail (`/superadmin/institutions/:id`)

Deep-dive view for a single college. Calls `GET /superadmin/colleges/:id/details`.

**Top section:**
- College logo, name, location, domain, verified status
- Primary Administrator card (first admin's name + email)
- Ecosystem Breakdown — Total Students, Events, Organizers, Admins

**Tabbed data table** (5 tabs):

| Tab | What it shows |
|---|---|
| Admins | All admin users of this college |
| Organizers | All organizers, with their club name |
| Students | All students |
| Events | All events with date and status badge |
| Clubs | All clubs with category |

**Search bar** — Filters the active tab by name, email, or phone (for users) or title/category/status (for events/clubs).

**Clicking a user row** (Admins / Organizers / Students) opens a modal with:
- Profile picture / initials avatar
- Role badge
- Full Name, Email, Phone, Role, Department, Year of Study (all editable)
- Read-only info: User ID, Email Verified, Status, Join Date, Club (if organizer), Events Created

**Editing a user:**
1. Click the user row to open the modal
2. Click "Edit User"
3. Modify any field (name, email, phone, role, department, year)
4. Click "Save Changes" → calls `PUT /superadmin/users/:id`
5. The page refreshes automatically with updated data

> Note: Superadmin cannot modify other superadmin accounts.

---

### 5. Events (`/superadmin/events`)

Platform-wide event management. Calls `GET /superadmin/events`.

**Filters:**
- Tab filter: `All Events` / `Upcoming` / `Drafts` / `Completed`
- Search: by event title, location, or college name
- Category dropdown: All, Competition, Conference, Workshop, Seminar, Sports, Cultural, Other

**Event card shows:**
- Poster image (or category icon placeholder)
- Status badge (Approved / Submitted / Draft / Rejected)
- Category, title, date, location, college name
- Creator name
- Paid event badge with ticket price (if applicable)

**Actions (⋮ menu on each card):**

- `Edit Event` — Opens a modal to edit all event fields including poster upload
- `Change Status` — Directly set status to Approved / Submitted / Draft / Rejected

**Editing an event:**
1. Click ⋮ → "Edit Event"
2. Modify fields: title, category, location, description, date, times, seats, paid/public flags
3. Optionally upload a new poster (max 5MB image)
4. Click "Save Changes" → calls `PUT /superadmin/events/:id`

**Changing event status:**
1. Click ⋮ on any event card
2. Under "Status" section, click the desired status
3. Calls `PUT /superadmin/events/:id` with `{ status: "..." }`
4. Card updates immediately after refresh

---

## API Reference (Backend)

All routes require a valid JWT token with `role: superadmin`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/superadmin/analytics` | Platform-wide stats + chart data |
| GET | `/superadmin/colleges` | List all colleges |
| POST | `/superadmin/colleges` | Create a new college |
| PUT | `/superadmin/colleges/:id` | Update college info |
| DELETE | `/superadmin/colleges/:id` | Soft-delete a college (blocked if active events exist) |
| GET | `/superadmin/colleges/:id/details` | Full college detail (users, events, clubs) |
| GET | `/superadmin/admins` | List all admins across platform |
| POST | `/superadmin/admins` | Create an admin for a college |
| DELETE | `/superadmin/admins/:id` | Soft-delete an admin |
| PUT | `/superadmin/users/:id` | Update any user's details |
| GET | `/superadmin/events` | List all events across all colleges |
| PUT | `/superadmin/events/:id` | Update event details or status |

---

## Key Rules & Constraints

- Superadmin **cannot** modify another superadmin account
- A college **cannot be deleted** if it has active (Approved) events — reject them first
- Admin accounts are created with `isEmailVerified: true` by default (no OTP needed)
- College domain is used for email-based user verification during student/organizer registration
- Deleting a college or admin is a **soft delete** — data is retained in the database with `isDeleted: true`
