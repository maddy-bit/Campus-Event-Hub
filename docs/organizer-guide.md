# Organizer — User Guide

> Role: `organizer` · Access: College-scoped, own events only

---

## Overview

Organizers create and manage events for their college club. They submit events for admin approval, track registrations, communicate with participants via notifications, and manage their club profile. Each organizer is linked to exactly one club within their college.

**How to become an organizer:**
- A student requests promotion via the platform (promotion request workflow)
- The college admin approves the request — the student's role is upgraded to `organizer`
- Alternatively, the admin can directly assign a student as organizer of a club from the Users page

**Login:** `/login` — the system detects the `organizer` role and redirects to `/organizer/dashboard`.

---

## Navigation

| Menu Item | Route | Purpose |
|---|---|---|
| Dashboard | `/organizer/dashboard` | Overview of your events and stats |
| My Events | `/organizer/myevents` | Full event list with edit/delete |
| Create Event | `/organizer/create-event` | Submit a new event |
| View Participants | `/organizer/view-participants` | Manage registrations per event |
| Send Notification | `/organizer/notifications` | Notify your event participants |
| Profile | `/organizer/profile` | Manage your account and club info |

---

## Pages

### 1. Dashboard (`/organizer/dashboard`)

The control center. Loads data from `GET /events/my-events` and computes all stats client-side.

**Stat cards:**
| Card | What it shows |
|---|---|
| Active Events | Events with `status: Approved` |
| Upcoming | Approved events with a future event date |
| Participants | Total registrations across all your events |
| Pending | Events with `status: Draft` or `Submitted` awaiting admin review |

**Upcoming Queue panel:**
- Lists up to 5 upcoming approved events
- Shows event title, date, and a seat fill progress bar (`seatsFilled / maxSeats`)

**Quick Actions panel:**
- Create New Event → `/organizer/create-event`
- Manage Participants → `/organizer/view-participants`
- Send Notifications → `/organizer/notifications`
- View All Events → `/organizer/myevents`

**Top Events panel:**
- Top 5 approved events ranked by total registrations
- Shows rank emoji (🏆🥈🥉), event title, category, and registration count

**Recent Events section (bottom):**
- Last 4 events created (any status), sorted by creation date
- Each card shows status badge, event date, title, category, and registration count

---

### 2. My Events (`/organizer/myevents`)

Full event management table. Calls `GET /events/my-events`.

**Stat filter tabs (clickable):**
- All Events (total count)
- Pending (Draft status)
- Approved
- Rejected

**Search:** Filter by event name, category, or location.

**Table columns:** Poster initial, Event Name + Category, Date + Time, Seats Filled (with progress bar and %), Status badge, Actions.

**Pagination:** Configurable via `VITE_ITEM_PER_PAGE_IN_MY_EVENTS` env variable (default: 10 per page).

**Status badge colors:**
- Approved → green (#B6FF60)
- Draft / Submitted → yellow (#FFF6A0)
- Rejected → red (#FF8A8A)

**Editing an event:**
1. Click the edit (pencil) icon on any row
2. A modal opens with editable fields:
   - Title, Category, Location, Description
   - Event Date, Start Time, Max Seats
   - Registration Deadline
3. Click "Save Changes" → calls `PUT /events/:id`
4. The table refreshes automatically

**Deleting an event:**
1. Click the trash icon on any row
2. A confirmation dialog appears
3. Confirm → calls `DELETE /events/:id`
4. The event is removed from the list immediately

**Viewing participants:**
- Click the eye icon on any row → navigates to `/organizer/view-participants`

> Note: Only events you created appear here. You cannot see or edit other organizers' events.

---

### 3. Create Event (`/organizer/create-event`)

Submit a new event for admin approval. Uses the `CreateEvent` component.

**Form fields:**
- Title (required)
- Category — Competition, Conference, Workshop, Seminar, Sports, Cultural, Other
- Location (required)
- Description (required)
- Event Date (required)
- Start Time (required)
- End Time (optional)
- Registration Deadline (required)
- Max Seats (default: 100)
- Paid Event toggle — if enabled, shows Ticket Price field
- Public Event toggle — controls visibility
- Poster image upload (optional, max 5MB)

**What happens on submit:**
1. Calls `POST /events/create` (multipart if poster included)
2. Event is created with `status: Submitted`
3. Your college admin receives it in their approval queue
4. You receive a notification once the admin approves or rejects it

> Admin-created events skip this queue and are auto-approved. Organizer-created events always require admin approval.

---

### 4. View Participants (`/organizer/view-participants`)

Participant management for your events. Loads events from `GET /events/my-events`, then loads participants for the selected event from `GET /registrations/event/:eventId`.

**Event selector:**
- Search bar to filter your events by title
- Shows up to 3 events by default; more appear as you type
- Click an event button to load its participants

**Stats row (per selected event):**
- Registrations — total registered count vs max seats
- Seats Left — remaining capacity
- Pending — participants with pending payment (paid events only) / "ACTIVE" for free events
- Colleges — number of unique colleges represented

**Participant table columns:**
- # (row number)
- Participant name
- College
- Payment Status (paid events) or Phone Number (free events)
- Actions

**Payment status management (paid events only):**
- A dropdown per participant: Pending / Completed / Failed
- Changing it calls `PATCH /events/:participantId/payment` with `{ paymentStatus }`
- Completed rows turn green, Pending rows turn yellow

**Participant actions:**
- Email icon — opens a compose modal to send a direct email to that participant
- Eye icon — opens a detail modal showing: full name, email, college, registration ID, payment status (if paid)

**Search participants:**
- Filter by name, email, or college name

**Empty states:**
- No events created yet → prompt to create first event
- No participants yet → informational message
- Search returns nothing → "no matching participants" message

---

### 5. Send Notification (`/organizer/notifications`)

Notify your event participants. Loads your events from `GET /notifications/my-events` and sent history from `GET /notifications/sent`.

**Stats row:**
- Total Sent
- In-App count
- Email count
- Total Reach (sum of all recipient counts)

**Channel tabs:**
- In-App — delivered to student notification inboxes
- Email — sent via email (ZeptoMail)

**Compose form fields:**

| Field | Options |
|---|---|
| Select Event | Dropdown of your events |
| Notification Type | Announcement, Reminder, Alert, Update |
| Send To | All Participants, Paid Only, Pending Payment, Waitlisted |
| Title | Max 100 characters |
| Message | Max 1000 characters |

**Live preview:** Appears below the form as you type the title, showing exactly how the notification will look to recipients.

**Sending:**
1. Fill all required fields (event, title, message)
2. Click "SEND_NOW" → calls `POST /notifications/send`
3. Recipients are determined server-side based on the "Send To" filter
4. For Email channel, emails are dispatched to each recipient's address
5. Success toast shows how many recipients were reached

**Sent history (right panel):**
- Shows all sent notifications for the active channel tab
- Each entry shows: type tag, event name, time ago, title, message preview, channel, recipient type, reach count
- Hover over an entry to reveal the delete button

**Deleting a notification:**
1. Hover over a history entry → trash icon appears
2. Click it → confirmation dialog appears
3. Confirm → calls `DELETE /notifications/:id`
4. The notification is removed from all student inboxes

---

### 6. Profile (`/organizer/profile`)

Account and club management. Calls `GET /profile` and `GET /profile/college-clubs`.

**Left column:**
- Profile picture with upload/remove buttons
- Name, role, ID (last 6 chars)
- Email, phone, college, club name
- Organizer stats: Events Created, Total Participants, Active Events, Completed Events

**Right column — Profile Information panel:**

Editable fields:
- Full Name (required)
- Phone Number (required)
- Department

Read-only fields (set by admin):
- Email Address
- College / Institution
- Year of Study

Club fields:
- Club Name — if already assigned by admin, shown as read-only; otherwise a dropdown of existing college clubs or a text input for a new name
- Club Category — Technical, Cultural, Sports, Literary, Social Service, Other (read-only if assigned)
- Club Description (read-only if assigned)

**Saving profile:**
- Click "Save Changes" → calls `PUT /profile/basic` (personal info) + `PUT /profile/club` (club info) in sequence

**Club Logo panel:**
- Upload a logo image (PNG, JPG, SVG, max 2MB, recommended 256×256px)
- Click upload button → calls `POST /profile/upload/club-logo` (multipart)
- Click "REMOVE LOGO" → calls `DELETE /profile/club-logo`
- The logo appears on event pages and participant communications

**Profile picture:**
- Click the upload button on the avatar → calls `POST /profile/upload/profile-picture`
- Click "REMOVE PHOTO" → calls `DELETE /profile/profile-picture`

**Change Password panel:**
- Current Password, New Password, Confirm Password
- Live password requirements checker: 8+ chars, uppercase, number, special character
- Click "Change Password" → calls `PUT /profile/change-password` with `{ currentPassword, newPassword }`

---

## API Reference

All routes require a valid JWT token with `role: organizer`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/events/my-events` | All events you created (with seatsFilled data) |
| POST | `/events/create` | Submit a new event for approval |
| PUT | `/events/:id` | Update your event details |
| DELETE | `/events/:id` | Delete your event |
| GET | `/registrations/event/:eventId` | Participants for one of your events |
| PATCH | `/events/:participantId/payment` | Update participant payment status |
| POST | `/notifications/send` | Send notification to event participants |
| GET | `/notifications/sent` | Your sent notification history |
| GET | `/notifications/my-events` | Your events (for notification dropdown) |
| DELETE | `/notifications/:id` | Delete a sent notification |
| GET | `/notifications/my` | Your received notifications |
| PATCH | `/notifications/:id/read` | Mark a notification as read |
| PATCH | `/notifications/read-all` | Mark all notifications as read |
| GET | `/profile` | Your profile data |
| PUT | `/profile/basic` | Update name, phone, department |
| PUT | `/profile/club` | Update club name, category, description |
| POST | `/profile/upload/profile-picture` | Upload profile picture (multipart) |
| DELETE | `/profile/profile-picture` | Remove profile picture |
| POST | `/profile/upload/club-logo` | Upload club logo (multipart) |
| DELETE | `/profile/club-logo` | Remove club logo |
| PUT | `/profile/change-password` | Change password |
| GET | `/profile/college-clubs` | All clubs in your college (for profile dropdown) |

---

## Key Rules & Constraints

- Organizers can only see and manage events they personally created
- All organizer-created events start with `status: Submitted` and require admin approval before students can register
- You cannot approve your own events — only the college admin can
- Rejection always includes a reason, delivered to you as an in-app notification
- Deleting an event is permanent — all associated registrations are also removed
- Notifications can only be sent for events you created
- Deleting a notification removes it from all student inboxes immediately
- Club name, category, and description are read-only once the admin has formally assigned you to a club
- Email address and college name cannot be changed from the profile page — contact your admin
- Payment status updates are reflected immediately in the UI (optimistic update) and then persisted to the backend
- The seat fill progress bar in My Events and Dashboard is calculated as `seatsFilled / maxSeats`
