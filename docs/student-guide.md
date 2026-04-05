# Student — User Guide

> Role: `student` · Access: College-scoped + cross-college event browsing

---

## Overview

Students are the primary end-users of the platform. They browse and register for events, track their registrations, receive notifications from organizers, and manage their profile. Students can attend both their own college's events and external events from other colleges (with admin approval for cross-college registrations).

**Login:** `/login` — the system detects the `student` role and redirects to `/student/events`.

**Registration:** Students self-register at `/signup`. New accounts require admin approval before they can log in.

---

## Navigation

| Menu Item | Route | Purpose |
|---|---|---|
| Events | `/student/events` | Browse and register for events |
| My Registrations | `/student/registrations` | View all your event passes |
| Notifications | `/student/notifications` | Inbox for event updates |
| Profile | `/student/profile` | Manage your account |

---

## Pages

### 1. Events (`/student/events`)

The main event discovery feed. Loads from `GET /events/my-college` and `GET /events/external` in parallel. Only shows upcoming events (event date >= today).

**College context tabs:**

- My College — events created by organizers at your college
- External — events from other colleges (registering triggers admin approval flow)

**Filters:**
- Search bar — filter by event title, category, or venue
- Category dropdown — All, Competition, Conference, Workshop, Seminar, Sports, Cultural, Other
- Sort dropdown — Date (Soonest), Date (Latest), Title A–Z, Title Z–A

**Event card shows:**
- Poster image (or category abbreviation placeholder)
- Date badge (top-left)
- Category badge (bottom-left)
- Globe icon (top-right) if the event is from another college
- "REGISTERED" badge (bottom-right) if you've already registered
- Event title, location, time, seat count
- Registration deadline progress bar (green = open, red = passed)
- "VIEW & REGISTER" button or "CLOSED" if deadline passed
- Share button

**Clicking a card** navigates to the event detail page at `/student/events/:id`.

**Registering for an event:**
1. Click "VIEW & REGISTER" on any card (or click the card itself)
2. On the detail page, review event info: date, time, location, capacity, deadline, ticket price (if paid), organizer
3. Click "Confirm Registration" → calls `POST /registrations/register` with `{ eventId }`
4. On success: you receive an in-app notification confirming registration; the organizer is also notified
5. The card immediately shows the "REGISTERED" badge

**Cross-college registration:**
- Registering for an external event sets your registration status to `Pending_Approval`
- Your home college admin must approve it before it's confirmed
- You'll receive a notification once reviewed

**Sharing an event:**
- Click the share icon on any card
- Uses the Web Share API if available, otherwise copies event details to clipboard

---

### 2. My Registrations (`/student/registrations`)

Your personal event pass tracker. Calls `GET /registrations/my`.

**Stat cards (top):**
- Total Registrations
- Upcoming Events (event date in the future)
- Finished Events (event date in the past)

**Filters:**
- Search — by event name, category, or venue
- Status tabs — ALL / UPCOMING / FINISHED

**Each registration is displayed as a ticket with:**
- Status bar (green = UPCOMING, gray = FINISHED)
- Pseudo QR code pattern (generated from registration ID)
- Registration ID: `RX-{last 8 chars}`
- Event title, category, date, location, time, registration date
- PASS_ACTIVE or PASS_EXPIRED stamp

**Cancelling a registration:**
- Only available for upcoming events
- Click "CANCEL_REG" → confirmation dialog → calls `DELETE /registrations/:id`
- The seat is freed immediately (seat count decremented on the event)

**Rating a finished event:**
- After an event's date has passed, a 5-star rating widget appears on the ticket
- Hover over stars to preview, click to submit → calls `POST /feedback/:eventId` with `{ rating }`
- Once submitted, the stars lock and show "RATED"
- Each event can only be rated once

---

### 3. Notifications (`/student/notifications`)

Your in-app inbox. Calls `GET /notifications/my`.

You receive notifications when:
- You register for an event (auto-generated "Registration Confirmed" notification)
- An organizer sends an announcement, reminder, alert, or update to event participants
- Your admin approves or rejects your account, promotion request, or cross-college access

**Notification types and colors:**
| Type | Color |
|---|---|
| Announcement | Green (#B6FF60) |
| Reminder | Blue (#c2d9ff) |
| Alert | Red (#ff6b6b) |
| Update | Yellow (#fff35c) |

**Filter tabs:** All, Unread, Announcement, Alert, Update, Reminder

**Auto-clear behavior:** Read notifications are automatically hidden 24 hours after being marked as read, keeping your inbox clean.

**Marking as read:**
- Click "Mark Read" on any individual notification → calls `PATCH /notifications/:id/read`
- Click "Mark All Read" → calls `PATCH /notifications/read-all`
- Read notifications show a "// auto-clears in 24h" label

**Unread count badge** appears in the header showing how many new notifications you have.

---

### 4. Profile (`/student/profile`)

Your account management page. Calls `GET /profile`.

**What's displayed:**
- Profile picture (or initials avatar)
- Full name, role badge, email verified status
- Contact info: email, phone, account status
- Academic info: college name, department, year of study
- Networking interests (tags)
- System role and member since date

**Editing your profile:**
1. Click "EDIT PROFILE"
2. A modal opens with editable fields:
   - Full Name
   - Phone Number
   - Department
   - Year of Study
   - Networking Interests (add with Enter or + button, click a tag to remove it)
3. Click "SAVE CHANGES" → calls `PUT /profile/basic`

**Updating your profile picture:**
1. Hover over your avatar — camera and trash icons appear
2. Click the camera icon → file picker opens
3. Select an image → calls `POST /profile/upload/profile-picture` (multipart)
4. Old image is automatically deleted from Cloudinary
5. Click the trash icon to remove your current picture → calls `DELETE /profile/profile-picture`

**Logging out:**
- Click "LOGOUT" → calls `POST /auth/logout` → redirects to `/login`

> Note: Email address and college name are read-only. Contact your admin to change them.

---

## Auth Flows

**Signup (`/signup`):**
- Fill in: full name, email, phone, password, college, department, year of study
- An OTP is sent to your email for verification
- After email verification, your account is pending admin approval
- Once approved by your college admin, you can log in

**Forgot Password (`/forgot-password`):**
1. Enter your registered email
2. An OTP is sent to your email
3. Verify the OTP at `/verify-otp`
4. Set a new password at `/reset-password`

---

## API Reference

All routes require a valid JWT token (except auth routes).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new student account |
| POST | `/auth/verify-email` | Verify email with OTP |
| POST | `/auth/resend-verification-otp` | Resend email verification OTP |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Request password reset OTP |
| POST | `/auth/verify-reset-otp` | Verify reset OTP |
| POST | `/auth/reset-password` | Set new password |
| GET | `/auth/me` | Get current user info |
| GET | `/events/my-college` | Upcoming events from your college |
| GET | `/events/external` | Upcoming events from other colleges |
| GET | `/events/:id` | Single event detail |
| POST | `/registrations/register` | Register for an event (body: `{ eventId }`) |
| GET | `/registrations/my` | Your registrations |
| DELETE | `/registrations/:id` | Cancel a registration |
| POST | `/feedback/:eventId` | Submit star rating (body: `{ rating }`) |
| GET | `/feedback/my/ratings` | Your submitted ratings |
| GET | `/notifications/my` | Your in-app notifications |
| PATCH | `/notifications/:id/read` | Mark one notification as read |
| PATCH | `/notifications/read-all` | Mark all notifications as read |
| GET | `/profile` | Your profile data |
| PUT | `/profile/basic` | Update name, phone, department, year, interests |
| POST | `/profile/upload/profile-picture` | Upload profile picture (multipart) |
| DELETE | `/profile/profile-picture` | Remove profile picture |
| PUT | `/profile/change-password` | Change password (body: `{ currentPassword, newPassword }`) |

---

## Key Rules & Constraints

- Only `Approved` events with open registration deadlines appear in the event feed
- You cannot register for the same event twice
- You cannot register for an event if it is full (`seatsFilled >= maxSeats`)
- You cannot register after the registration deadline
- Cancellation is only allowed for upcoming events (not finished ones)
- Cross-college registrations start as `Pending_Approval` and require your home college admin to approve
- Star ratings can only be submitted once per event and only after the event date has passed
- Read notifications auto-clear from your inbox 24 hours after being marked as read
- Email and college name cannot be changed from the profile page
