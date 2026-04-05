# CampusEventHub — Project Documentation

> Version 1.0 · Full-stack web application for college event management

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Repository Structure](#4-repository-structure)
5. [Environment Setup](#5-environment-setup)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Data Models](#7-data-models)
8. [Backend API Reference](#8-backend-api-reference)
9. [Frontend Routes & Pages](#9-frontend-routes--pages)
10. [Role System](#10-role-system)
11. [Core Workflows](#11-core-workflows)
12. [Security](#12-security)
13. [Deployment Notes](#13-deployment-notes)

**Additional documents:**
- [api-errors.md](./api-errors.md) — Full HTTP error response reference
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Development standards and workflow
- [CHANGELOG.md](./CHANGELOG.md) — Version history
- [admin-guide.md](./admin-guide.md) — Admin role user guide
- [organizer-guide.md](./organizer-guide.md) — Organizer role user guide
- [student-guide.md](./student-guide.md) — Student role user guide
- [superadmin-guide.md](./superadmin-guide.md) — Superadmin role user guide

---

## 1. Project Overview

CampusEventHub is a centralized multi-tenant platform that enables colleges to host, manage, and discover events. Students can browse and register for events from their own college or external institutions. Organizers manage their club events and communicate with participants. Admins govern their college's data. A Superadmin oversees the entire platform.

**Core capabilities:**
- Multi-college, multi-role event management
- Event submission and approval workflow
- Cross-college event registration with admin gating
- Real-time in-app and email notifications
- Student networking (search, connect, live chat)
- Star-based event feedback system
- Platform-wide analytics for superadmin

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│         React 19 + Vite + TailwindCSS v4             │
│              Port: 5173 (dev)                        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket (Socket.IO)
                       │ Axios (withCredentials: true)
                       │ JWT via httpOnly cookie + Bearer header
┌──────────────────────▼──────────────────────────────┐
│                  SERVER (Node.js)                    │
│           Express 4 + Socket.IO 4                    │
│              Port: 5000 (dev)                        │
│                                                      │
│  Middleware stack:                                   │
│    Helmet → Rate Limiter → CORS → JSON → Cookie      │
│                                                      │
│  Route groups:                                       │
│    /auth  /events  /registrations  /notifications    │
│    /profile  /admin  /superadmin  /feedback          │
│    /colleges  /dashboard                             │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│              MongoDB Atlas (Cloud)                   │
│   Collections: users, events, eregistrations,       │
│   notifications, colleges, clubs, feedbacks,        │
│   connections, eventcomments                        │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Cloudinary (Media Storage)              │
│   Folders: profiles/, events/, clubs/               │
└─────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | — | Runtime |
| Express | ^4.22 | HTTP framework |
| Mongoose | ^8.23 | MongoDB ODM |
| jsonwebtoken | ^9.0 | JWT auth |
| bcryptjs | ^3.0 | Password hashing |
| Cloudinary SDK | ^2.9 | Image upload/storage |
| Multer | ^2.1 | Multipart file handling |
| Socket.IO | ^4.8 | Real-time WebSocket |
| Helmet | ^8.1 | HTTP security headers |
| express-rate-limit | ^8.3 | Rate limiting |
| Joi | ^17.13 | Request validation |
| Nodemailer | ^8.0 | Email dispatch |
| dotenv | ^16.6 | Environment config |
| cookie-parser | ^1.4 | Cookie handling |
| cors | ^2.8 | Cross-origin requests |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | ^19.2 | UI framework |
| Vite | ^7.3 | Build tool / dev server |
| React Router DOM | ^7.13 | Client-side routing |
| Axios | ^1.13 | HTTP client |
| TailwindCSS | ^4.1 | Utility-first CSS |
| Recharts | ^3.8 | Charts and analytics |
| Socket.IO Client | ^4.8 | Real-time WebSocket |
| Lucide React | ^0.575 | Icon library |
| Sonner | ^2.0 | Toast notifications |

---

## 4. Repository Structure

```
CampusEventHub/
├── Backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── cloudinary.js          # Cloudinary config
│   ├── Controllers/
│   │   ├── AuthControl.js         # Signup, login, OTP, password reset
│   │   ├── AdminController.js     # All college-admin operations
│   │   ├── SuperAdminController.js# Platform-wide operations
│   │   ├── EventController.js     # CRUD + upcoming filter
│   │   ├── ERegistrationController.js # Register, cancel, comments
│   │   ├── NotificationController.js  # Send, receive, mark read
│   │   └── ProfileController.js   # Profile, club, avatar, password
│   ├── helpers/
│   │   └── emailTemplates/        # HTML email templates
│   ├── Middleware/
│   │   ├── AuthMiddleware.js      # verifyToken, checkRole, Joi validators
│   │   ├── AuthGuard.js           # protect() helper
│   │   └── RoleMiddleware.js      # checkOrganizerRole, checkProfileOwnership
│   ├── Models/
│   │   ├── users.js               # User schema (all roles)
│   │   ├── event.js               # Event schema
│   │   ├── ERegistration.js       # Registration schema
│   │   ├── Notification.js        # Notification schema
│   │   ├── college.js             # College schema
│   │   ├── club.js                # Club schema
│   │   ├── Connection.js          # Networking connection schema
│   │   └── EventComment.js        # Event comment schema
│   ├── Routes/
│   │   ├── AuthRoutes.js
│   │   ├── EventRoutes.js
│   │   ├── ERegistrationRoutes.js
│   │   ├── AdminRoutes.js
│   │   ├── AdminAnalyticsRoutes.js
│   │   ├── SuperAdminRoutes.js
│   │   ├── NotificationRoutes.js
│   │   ├── ProfileRoutes.js
│   │   ├── CollegeRoutes.js
│   │   ├── FeedbackRoutes.js
│   │   └── DashboardRoutes.js
│   ├── Sockets/
│   │   └── NetworkingSocket.js    # Socket.IO event handlers
│   ├── utils/
│   │   ├── sendEmail.js           # Nodemailer wrapper
│   │   └── uploadConfig.js        # Multer config (memory storage)
│   ├── index.js                   # App entry point
│   ├── .env                       # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api.js                 # Axios instance (baseURL + credentials)
│   │   ├── App.jsx                # Root router
│   │   ├── main.jsx               # React entry point
│   │   ├── components/            # Shared UI components
│   │   │   ├── ProtectedRoute.jsx # Role-based route guard
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── layouts/               # Role-specific shell layouts
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── OrganizerLayout.jsx
│   │   │   ├── StudentLayout.jsx
│   │   │   └── SuperAdminLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Register, Verify, Reset
│   │   │   ├── admin/             # Dashboard, Events, Users, Approvals, NotifyHub, Profile
│   │   │   ├── organizer/         # Dashboard, MyEvents, CreateEvent, ViewParticipants, Notifications, Profile
│   │   │   ├── student/           # Events, EventDetails, Registrations, Notification, Profile, Search, Network, Chat
│   │   │   └── superadmin/        # Dashboard, Events, CollegeSetup, ViewInstitutions, CollegeDetail
│   │   └── styles/                # Global and component CSS
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── README.md                  # This file — full project documentation
│   ├── admin-guide.md             # Admin role user guide
│   ├── organizer-guide.md         # Organizer role user guide
│   ├── student-guide.md           # Student role user guide
│   └── superadmin-guide.md        # Superadmin role user guide
└── README.md                      # Project root readme
```

---

## 5. Environment Setup

### Prerequisites
- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/eventhub

# JWT
JWT_SECRET_KEY=<your_64_char_secret>
JWT_EXPIRES_IN=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# CORS / Email
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

Server health check: `GET http://localhost:5000/check`

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_ITEM_PER_PAGE_IN_MY_EVENTS=10
```

Start the dev server:

```bash
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

### Seeding Initial Data

To create the first superadmin and colleges, use the `Backend/createUsers.js` script or call the superadmin API endpoints directly after manually inserting a superadmin user into MongoDB.

---

## 6. Authentication & Authorization

### Token Strategy

- JWT is issued on login and stored in two places simultaneously:
  - `httpOnly` cookie (`token`) — used by browser automatically
  - Response body `token` field — used by the frontend Axios instance via `Authorization: Bearer <token>` header
- Token expiry: **24 hours**
- `verifyToken` middleware checks cookie first, then `Authorization` header

### JWT Payload

```json
{
  "email": "user@college.edu",
  "_id": "mongoObjectId",
  "role": "student | organizer | admin | superadmin",
  "collegeId": "mongoObjectId",
  "clubId": "mongoObjectId | null"
}
```

### Middleware Chain

```
Request → verifyToken → checkRole(...roles) → Controller
```

- `verifyToken` — decodes JWT, attaches `req.user`
- `checkRole(...roles)` — variadic, accepts multiple allowed roles
- `checkOrganizerRole` — allows organizer, admin, superadmin
- `checkProfileOwnership` — allows own profile or admin/superadmin

### Auth Flow — Student Registration

```
POST /auth/signup
  → Validate fields (Joi)
  → Check college exists
  → Hash password (bcrypt, 10 rounds)
  → Set isEmailVerified: false, isApproved: false
  → Generate 6-digit OTP (10 min expiry)
  → Send OTP email
  → Save user

POST /auth/verify-email  { email, otp }
  → Validate OTP + expiry
  → Set isEmailVerified: true

[Admin approves student via PATCH /admin/students/:id/approve]
  → Set isApproved: true

POST /auth/login  { email, password }
  → Check isEmailVerified → 403 if not
  → Check isApproved → 403 if not
  → Compare bcrypt hash
  → Issue JWT → set cookie + return token
```

### Auth Flow — Password Reset

```
POST /auth/forgot-password  { email }
  → Generate 6-digit OTP (10 min expiry)
  → Send OTP email

POST /auth/verify-reset-otp  { otp }
  → Validate OTP + expiry

POST /auth/reset-password  { otp, newPassword }
  → Validate OTP + expiry
  → Hash new password
  → Clear reset token fields
```

### Protected Route (Frontend)

`ProtectedRoute` calls `GET /auth/me` on mount. If the response role is not in `allowedRoles`, it redirects to `/login`. Used on all `/admin` and `/organizer` routes. Student and superadmin routes currently use layout-level protection.

---

## 7. Data Models

### User

| Field | Type | Notes |
|---|---|---|
| fullName | String | required |
| email | String | unique, indexed |
| phoneNumber | String | required |
| password | String | bcrypt hashed, select: false |
| profilePicture | String | Cloudinary URL |
| role | Enum | superadmin, admin, organizer, student |
| collegeId | ObjectId → College | required for non-superadmin |
| clubId | ObjectId → Club | required for organizer |
| interests | [String] | student only |
| department | String | required for student |
| yearOfStudy | String | 4-digit year |
| stats | Object | eventsCreated, totalParticipants, activeEvents, completedEvents |
| isEmailVerified | Boolean | default false |
| isApproved | Boolean | default true (false for new students) |
| isDeleted | Boolean | soft delete flag |
| emailVerificationToken | String | 6-digit OTP |
| emailVerificationExpiry | Date | 10 min window |
| passwordResetToken | String | 6-digit OTP |
| passwordResetExpiry | Date | 10 min window |

### Event

| Field | Type | Notes |
|---|---|---|
| title | String | max 80 chars |
| category | Enum | Competition, Conference, Workshop, Seminar, Sports, Cultural, Other |
| location | String | required |
| description | String | max 1800 chars |
| eventDate | Date | required |
| startTime | String | required |
| endTime | String | optional |
| registrationDeadline | Date | required |
| maxSeats | Number | default 100 |
| seatsFilled | Number | default 0, atomic increment |
| posterUrl | String | Cloudinary URL |
| isPaidEvent | Boolean | default false |
| ticketPrice | Number | default 0 |
| createdBy | ObjectId → User | required |
| collegeId | ObjectId → College | required, indexed |
| isPublic | Boolean | default true |
| status | Enum | Draft, Submitted, Approved, Rejected |
| moderation.reviewedBy | ObjectId → User | set on approve/reject |
| moderation.reviewedAt | Date | |
| moderation.rejectionReason | String | required on reject |

Compound index: `{ collegeId: 1, status: 1 }`

### ERegistration (Event Registration)

| Field | Type | Notes |
|---|---|---|
| eventId | ObjectId → Event | required |
| userId | ObjectId → User | required |
| registrationDate | Date | default now |
| isCrossCollege | Boolean | true if student.collegeId ≠ event.collegeId |
| status | Enum | Registered, Waitlisted, Cancelled, Pending_Approval |
| ticketType | Enum | Free, Paid |
| payment.amount | Number | |
| payment.currency | String | default INR |
| payment.transactionId | String | |
| payment.status | Enum | Pending, Completed, Failed |
| seatNumber | Number | optional |

Unique index: `{ eventId: 1, userId: 1 }` — prevents duplicate registrations.

### Notification

| Field | Type | Notes |
|---|---|---|
| title | String | max 100 chars |
| message | String | max 1000 chars |
| event | ObjectId → Event | optional |
| club | ObjectId → Club | optional |
| type | Enum | Announcement, Reminder, Alert, Update, Submission_Update |
| channel | Enum | In-App, Email |
| recipientType | Enum | All Participants, Paid Only, Pending Payment, Waitlisted, Organizer |
| recipient | ObjectId → User | for direct/targeted notifications |
| sender | ObjectId → User | required |
| isScheduled | Boolean | default false |
| scheduledAt | Date | required if isScheduled |
| status | Enum | Sent, Failed |
| reachCount | Number | number of recipients |
| readBy | [{user, readAt}] | tracks per-user read state |

---

## 8. Backend API Reference

Base URL: `http://localhost:5000`

All protected routes require `Authorization: Bearer <token>` header or `token` cookie.

---

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register student account |
| POST | `/auth/verify-email` | Public | Verify email with OTP |
| POST | `/auth/resend-verification-otp` | Public | Resend email OTP |
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/logout` | Token | Clear auth cookie |
| POST | `/auth/forgot-password` | Public | Send password reset OTP |
| POST | `/auth/verify-reset-otp` | Public | Validate reset OTP |
| POST | `/auth/reset-password` | Public | Set new password |
| GET | `/auth/me` | Token | Get current user info |

---

### Events — `/events`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/events` | Token | All events (any status) |
| GET | `/events/upcoming` | Token | Events with open registration deadline |
| GET | `/events/my-college` | Token | Approved upcoming events from user's college |
| GET | `/events/external` | Token | Approved upcoming events from other colleges |
| GET | `/events/my-events` | organizer, admin | Events created by the current user |
| GET | `/events/:id` | Token | Single event detail |
| POST | `/events/create` | organizer, admin | Create event (status: Submitted) |
| PUT | `/events/:id` | organizer, admin | Update event |
| DELETE | `/events/:id` | organizer, admin | Delete event |
| PATCH | `/events/:id/payment` | Token | Update participant payment status |

---

### Registrations — `/registrations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/registrations/register` | student | Register for an event |
| GET | `/registrations/my` | Token | Current user's registrations |
| GET | `/registrations/` | Token | All registrations (admin use) |
| GET | `/registrations/event/:eventId` | Token | Participants for a specific event |
| GET | `/registrations/:id` | Token | Single registration detail |
| DELETE | `/registrations/:id` | Token | Cancel registration |
| PATCH | `/registrations/payment/:id` | Token | Update payment status |
| POST | `/registrations/comment/:id` | Token | Post comment on event |
| GET | `/registrations/comment/:id` | Token | Get comments for event |

---

### Notifications — `/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/notifications/send` | organizer, admin | Send notification to event participants |
| GET | `/notifications/sent` | organizer, admin | Sent notification history |
| GET | `/notifications/my-events` | organizer, admin | Organizer's events (for dropdown) |
| GET | `/notifications/my` | Token | Current user's received notifications |
| PATCH | `/notifications/read-all` | Token | Mark all notifications as read |
| PATCH | `/notifications/:id/read` | Token | Mark one notification as read |
| DELETE | `/notifications/:id` | organizer, admin | Delete a sent notification |

---

### Profile — `/profile`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile/:userId?` | Token | Get profile (own or by ID) |
| PUT | `/profile/basic` | Token | Update name, phone, department, year, interests |
| PUT | `/profile/club` | organizer+ | Update club name, category, description |
| POST | `/profile/upload/profile-picture` | Token | Upload profile picture (multipart) |
| DELETE | `/profile/profile-picture` | Token | Remove profile picture |
| POST | `/profile/upload/club-logo` | organizer+ | Upload club logo (multipart) |
| DELETE | `/profile/club-logo` | organizer+ | Remove club logo |
| PUT | `/profile/change-password` | Token | Change password |
| GET | `/profile/college-clubs` | Token | All clubs in user's college |
| GET | `/profile/active-connection` | Token | Active networking chat connection |

---

### Admin — `/admin`

All routes require `role: admin`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard-stats` | College stats for dashboard |
| GET | `/admin/events/pending` | Events with status: Submitted |
| PATCH | `/admin/events/:id/approve` | Approve submitted event |
| PATCH | `/admin/events/:id/reject` | Reject event (body: `{ reason }`) |
| GET | `/admin/events` | All events in admin's college |
| POST | `/admin/events` | Create event (auto-approved) |
| PUT | `/admin/events/:id` | Update event |
| GET | `/admin/organizers` | All organizers in college |
| GET | `/admin/students` | All students in college |
| GET | `/admin/clubs` | All clubs in college |
| POST | `/admin/clubs` | Create a club |
| GET | `/admin/clubs/:id` | Club detail with members |
| POST | `/admin/clubs/assign-organizer` | Assign organizer to club |
| POST | `/admin/clubs/remove-organizer` | Remove organizer from club |
| GET | `/admin/analytics` | College-level analytics |
| GET | `/admin/registrations/pending` | Cross-college registration requests |
| PATCH | `/admin/registrations/:id/review` | Approve/reject cross-college registration |
| GET | `/admin/promotions/pending` | Students requesting organizer promotion |
| PATCH | `/admin/promotions/:id/approve` | Promote student to organizer |
| PATCH | `/admin/promotions/:id/deny` | Deny promotion request |
| GET | `/admin/students/pending` | Students pending account approval |
| PATCH | `/admin/students/:id/approve` | Approve student account |
| PATCH | `/admin/students/:id/reject` | Reject student registration |
| GET | `/admin/access-requests/pending` | Cross-college event access requests |
| PATCH | `/admin/access-requests/:id/grant` | Grant event access |
| PATCH | `/admin/access-requests/:id/reject` | Reject access request |
| GET | `/admin/users` | All users in college |
| PUT | `/admin/users/:id` | Update user details |
| PATCH | `/admin/users/:id/delete` | Soft-delete user |
| GET | `/admin/profile` | Admin's own profile |

---

### Admin Analytics — `/admin/analytics`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/analytics/event-performance` | Registrations vs avg rating per event |

---

### Superadmin — `/superadmin`

All routes require `role: superadmin`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/superadmin/analytics` | Platform-wide stats + chart data |
| POST | `/superadmin/colleges` | Create a new college |
| GET | `/superadmin/colleges` | List all colleges |
| GET | `/superadmin/colleges/:id/details` | College detail (users, events, clubs) |
| PUT | `/superadmin/colleges/:id` | Update college info |
| DELETE | `/superadmin/colleges/:id` | Soft-delete college |
| POST | `/superadmin/admins` | Create admin for a college |
| GET | `/superadmin/admins` | List all admins |
| DELETE | `/superadmin/admins/:id` | Soft-delete admin |
| PUT | `/superadmin/users/:id` | Update any user |
| GET | `/superadmin/events` | All events across all colleges |
| PUT | `/superadmin/events/:id` | Update event details or status |

---

### Feedback — `/feedback`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/feedback/:eventId` | Token | Submit star rating for an event |
| GET | `/feedback/my/ratings` | Token | Current user's submitted ratings |

---

### Colleges — `/colleges`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/colleges` | Public | List all colleges (for signup dropdown) |

---

## 9. Frontend Routes & Pages

Base URL: `http://localhost:5173`

### Public Routes

| Path | Component | Description |
|---|---|---|
| `/` | LandingPage | Marketing landing page |
| `/login` | Login | Login form |
| `/register` | RegistrationPage | Student signup form |
| `/verify-email` | VerifyEmail | Email OTP verification |
| `/forgot-password` | ForgotPassword | Request password reset |
| `/verify-otp` | VerifyOtp | Verify reset OTP |
| `/reset-password` | ResetPassword | Set new password |

### Student Routes — `/student` (StudentLayout)

| Path | Component | Description |
|---|---|---|
| `/student/events` | StudentEvents | Event feed with My College / External tabs |
| `/student/events/:id` | EventDetails | Full event detail + register + comments |
| `/student/registrations` | Registrations | My event passes + cancel + star rating |
| `/student/notification` | Notification | In-app notification inbox |
| `/student/profile` | StudentProfile | Profile view + edit + avatar |
| `/student/search` | SearchUsers | Search other students by interest |
| `/student/network` | NetworkRoom | Networking connection requests |
| `/student/chat/:connectionId` | LiveChat | Real-time 1:1 chat |

### Organizer Routes — `/organizer` (OrganizerLayout, role: organizer)

| Path | Component | Description |
|---|---|---|
| `/organizer/dashboard` | OrganizerDashboard | Stats, upcoming queue, top events |
| `/organizer/create-event` | CreateEvent | Event submission form |
| `/organizer/myevents` | OrganizerMyEvents | Event table with edit/delete |
| `/organizer/view-participants` | ViewParticipants | Participant management per event |
| `/organizer/notifications` | SendNotification | Compose + send + history |
| `/organizer/inbox` | OrganizerNotification | Received notifications |
| `/organizer/profile` | OrganizerProfile | Profile + club info + password |

### Admin Routes — `/admin` (AdminLayout, role: admin or superadmin)

| Path | Component | Description |
|---|---|---|
| `/admin/dashboard` | AdminDashboard | Stats, charts, recent submissions |
| `/admin/approvals` | AdminApprovals | Review queue (events, promotions, access, students) |
| `/admin/events` | AdminEvents | College event management |
| `/admin/users` | AdminUsers | User directory + club management |
| `/admin/notify` | NotifyHub | Send notifications to college users |
| `/admin/profile` | AdminProfile | Admin profile + security |
| `/admin/analytics` | (placeholder) | Analytics page |

### Superadmin Routes — `/superadmin` (SuperAdminLayout)

| Path | Component | Description |
|---|---|---|
| `/superadmin/dashboard` | SuperAdminDashboard | Platform analytics + system health |
| `/superadmin/setup` | CollegeSetup | Onboard new college + create admin |
| `/superadmin/institutions` | ViewInstitutions | All colleges list |
| `/superadmin/institutions/:id` | CollegeDetail | College deep-dive with tabbed data |
| `/superadmin/events` | SuperAdminEvents | Platform-wide event management |

---

## 10. Role System

### Role Hierarchy

```
superadmin
    └── admin (per college)
            └── organizer (per club)
                    └── student
```

### Role Capabilities Summary

| Capability | student | organizer | admin | superadmin |
|---|---|---|---|---|
| Browse events | ✓ | ✓ | ✓ | ✓ |
| Register for events | ✓ | — | — | — |
| Create events | — | ✓ | ✓ (auto-approved) | — |
| Approve/reject events | — | — | ✓ (own college) | ✓ (all) |
| Manage participants | — | ✓ (own events) | ✓ (college) | ✓ (all) |
| Send notifications | — | ✓ (own events) | ✓ (college) | — |
| Manage clubs | — | — | ✓ (own college) | — |
| Manage users | — | — | ✓ (own college) | ✓ (all) |
| Manage colleges | — | — | — | ✓ |
| Platform analytics | — | — | ✓ (college) | ✓ (platform) |
| Create admins | — | — | — | ✓ |

### Role Assignment

- `student` — self-registered, requires admin approval
- `organizer` — promoted from student by admin, or directly assigned to a club
- `admin` — created by superadmin during college onboarding
- `superadmin` — manually seeded into the database

---

## 11. Core Workflows

### Event Lifecycle

```
Organizer creates event
        │
        ▼
  status: Submitted
        │
        ▼
Admin reviews (Approvals page)
        │
   ┌────┴────┐
   ▼         ▼
Approved   Rejected
   │         │
   │         └── Rejection reason sent as notification to organizer
   ▼
Visible to students in event feed
   │
   ▼
Students register (before deadline)
   │
   ├── Same college → status: Registered (immediate)
   └── Cross-college → status: Pending_Approval
                              │
                              ▼
                    Student's home admin reviews
                              │
                         ┌────┴────┐
                         ▼         ▼
                      Approved   Rejected
```

### Student Registration Flow

```
Student clicks "Confirm Registration"
        │
        ▼
POST /registrations/register { eventId }
        │
        ├── Check event status === "Approved"
        ├── Check registrationDeadline not passed
        ├── Check not already registered (unique index)
        ├── Atomic increment: seatsFilled < maxSeats
        │
        ├── isCrossCollege?
        │     ├── Yes → status: Pending_Approval
        │     └── No  → status: Registered
        │
        ├── Create notification for student ("Registration Confirmed")
        └── Create notification for organizer ("New Registration")
```

### Notification Delivery

```
Organizer composes notification
        │
        ▼
POST /notifications/send
        │
        ├── channel: "In-App"
        │     └── Saved to DB → appears in student /notifications/my
        │
        └── channel: "Email"
              └── Nodemailer sends HTML email to each recipient
```

### Seat Concurrency Safety

Seat allocation uses a MongoDB atomic `findOneAndUpdate` with a conditional filter:

```js
EventModel.findOneAndUpdate(
  { _id: eventId, seatsFilled: { $lt: maxSeats } },
  { $inc: { seatsFilled: 1 } },
  { new: true }
)
```

If the update returns `null`, the event is full. If the subsequent registration save fails, `seatsFilled` is decremented back.

### Cross-College Registration

1. Student registers for an event from a different college
2. `isCrossCollege: true`, `status: Pending_Approval`
3. Student's home college admin sees it in `GET /admin/registrations/pending`
4. Admin calls `PATCH /admin/registrations/:id/review` with `{ action: "approve" | "reject", reason? }`
5. Student receives notification with the outcome

### Password Reset

```
POST /auth/forgot-password { email }
  → 6-digit OTP stored with 10-min expiry
  → OTP emailed to user

POST /auth/verify-reset-otp { otp }
  → Validates OTP + expiry (does not consume it)

POST /auth/reset-password { otp, newPassword }
  → Re-validates OTP + expiry
  → Hashes new password (bcrypt, 10 rounds)
  → Clears reset token fields
```

---

## 12. Real-Time Features (Socket.IO)

The server creates an HTTP server wrapping Express and attaches Socket.IO to it.

```js
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_URL, credentials: true } });
networkingSocket(io);
```

**Networking Socket** (`Sockets/NetworkingSocket.js`) handles:
- Student-to-student connection requests
- Connection acceptance / rejection
- Live 1:1 chat messages within an accepted connection
- Chat expiry (connections have a `chatExpiresAt` field)

Frontend uses `socket.io-client` on the `/student/chat/:connectionId` and `/student/network` pages.

---

## 13. Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt, 10 salt rounds |
| JWT storage | httpOnly cookie (XSS-safe) + Bearer header fallback |
| CORS | Restricted to `CLIENT_URL` env variable |
| HTTP headers | Helmet (sets CSP, HSTS, X-Frame-Options, etc.) |
| Rate limiting | 10,000 req / 15 min per IP (express-rate-limit) |
| Input validation | Joi schemas on auth routes; controller-level checks elsewhere |
| Role enforcement | `checkRole()` middleware on every protected route group |
| Soft deletes | `isDeleted: true` flag — data is never hard-deleted |
| File uploads | Multer memory storage → direct Cloudinary stream upload (no disk writes) |
| Seat concurrency | Atomic MongoDB `$inc` with conditional filter prevents overselling |
| Duplicate registration | Unique compound index `{ eventId, userId }` at DB level |

---

## 14. Deployment Notes

### Backend (Node.js)

- Set `NODE_ENV=production` in environment
- JWT cookie becomes `secure: true, sameSite: "none"` in production
- Ensure `CLIENT_URL` matches the deployed frontend domain exactly
- MongoDB Atlas: whitelist server IP or use `0.0.0.0/0` for dynamic IPs
- Cloudinary credentials must be set — images are uploaded directly from server memory

### Frontend (Vite)

```bash
npm run build   # outputs to dist/
```

- Set `VITE_API_BASE_URL` to the production backend URL
- Deploy `dist/` to any static host (Vercel, Netlify, S3+CloudFront)
- Configure the host to redirect all routes to `index.html` (SPA routing)

### Environment Variables Checklist

**Backend (required for production):**
- `MONGO_URI`
- `JWT_SECRET_KEY` (min 32 chars, random)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CLIENT_URL` (frontend origin)
- `FRONTEND_URL` (used in email links)
- `NODE_ENV=production`

**Frontend (required for production):**
- `VITE_API_BASE_URL` (backend origin)

---

## Related Documents

| Document | Description |
|---|---|
| [api-errors.md](./api-errors.md) | Full HTTP error response reference for all endpoints |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Branch naming, commit conventions, PR process, coding standards |
| [CHANGELOG.md](./CHANGELOG.md) | Version history — what changed and when |
| [admin-guide.md](./admin-guide.md) | Full admin role user guide |
| [organizer-guide.md](./organizer-guide.md) | Full organizer role user guide |
| [student-guide.md](./student-guide.md) | Full student role user guide |
| [superadmin-guide.md](./superadmin-guide.md) | Full superadmin role user guide |
