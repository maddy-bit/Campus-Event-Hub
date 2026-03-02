# Backend Setup

1.  **Install Dependencies:** Run `npm install` to install required packages.
2.  **Configure Environment:** Copy `.env.example` to a new file named `.env`.
3.  **Run Server:** Execute `npm start` (or `npm run dev` for development with reload) to start the backend server.

# Club Event Management System
## Simplified Architecture (Without Services Layer)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Root Structure](#root-structure)
3. [Backend Architecture](#backend-architecture)
4. [Admin Frontend](#admin-frontend)
5. [User Frontend](#user-frontend)
6. [Technology Stack](#technology-stack)

---

## Project Overview

This document outlines a simplified folder structure for the Club Event Management System without a separate Services layer. Business logic is integrated directly into Controllers.

---

## Root Structure

```
club-event-management/
│
├── Backend/                    # Node.js/Express API Server
├── Admin-Frontend/             # Super Admin Portal (React/Next.js)
├── Frontend/                   # User-facing Application (React/Next.js)
├── package.json               # Root package configuration
├── README.md                  # Project documentation
├── Structure.md               # System workflow documentation
├── Architecture-Simple.md     # This file
└── .gitignore                # Git ignore rules
```

---

## Backend Architecture

### Simplified Folder Structure

```
Backend/
│
├── Config/
│   ├── db.js                  # Database connection configuration
│   ├── cloudinary.js          # Image upload configuration
│   ├── payment.js             # Payment gateway configuration (Razorpay/Stripe)
│   └── email.js               # Email service configuration (Nodemailer)
│
├── Models/
│   ├── User.js                # Base user model
│   ├── Admin.js               # Super admin model
│   ├── Faculty.js             # Faculty/Club authority model
│   ├── Student.js             # Student model
│   ├── Club.js                # Club model
│   ├── ClubAuthority.js       # Club authority roles (President, VP, Secretary, Treasurer)
│   ├── CoreTeam.js            # Core team model
│   ├── CoreTeamMember.js      # Core team member details
│   ├── EndMember.js           # End member model
│   ├── Event.js               # Event model
│   ├── EventApproval.js       # Event approval workflow
│   ├── Registration.js        # Event registration model
│   ├── Payment.js             # Payment transaction model (furture plan)
│   └── Notification.js        # Notification model
│
├── Controllers/
│   ├── Auth/
│   │   ├── AdminAuthController.js      # Admin authentication + business logic
│   │   ├── FacultyAuthController.js    # Faculty authentication + business logic
│   │   ├── StudentAuthController.js    # Student authentication + business logic
│   │   └── AuthController.js           # Common auth logic (JWT, password hashing)
│   │
│   ├── Admin/
│   │   ├── ClubController.js           # Club CRUD + business logic
│   │   ├── FacultyController.js        # Faculty management + assignment logic
│   │   ├── UserController.js           # User management + business logic
│   │   └── DashboardController.js      # Admin dashboard stats + analytics
│   │
│   ├── ClubAuthority/
│   │   ├── CoreTeamController.js       # Core team creation + management logic
│   │   ├── ApprovalController.js       # Event approval workflow + notifications
│   │   └── ClubDashboardController.js  # Club authority dashboard + stats
│   │
│   ├── CoreTeam/
│   │   ├── EventController.js          # Event CRUD + submission logic
│   │   ├── EndMemberController.js      # End member selection + management
│   │   └── TeamDashboardController.js  # Core team dashboard + stats
│   │
│   ├── Student/
│   │   ├── EventViewController.js      # View published events + filtering
│   │   ├── RegistrationController.js   # Event registration + payment logic
│   │   └── ProfileController.js        # Student profile management
│   │
│   └── Common/
│       ├── NotificationController.js   # Notification CRUD + sending logic
│       ├── PaymentController.js        # Payment processing + verification (future plan)
│       └── UploadController.js         # File upload + Cloudinary integration
│
├── Routes/
│   ├── authRoutes.js          # Authentication routes
│   ├── adminRoutes.js         # Admin-specific routes
│   ├── clubAuthorityRoutes.js # Club authority routes
│   ├── coreTeamRoutes.js      # Core team routes
│   ├── studentRoutes.js       # Student routes
│   ├── eventRoutes.js         # Event-related routes
│   ├── paymentRoutes.js       # Payment routes (future plan)
│   └── index.js               # Route aggregator
│
├── Middleware/
│   ├── AuthMiddleware.js      # JWT token verification
│   ├── RoleMiddleware.js      # Role-based access control
│   ├── PermissionMiddleware.js # Permission checking
│   ├── ValidationMiddleware.js # Request validation (Joi/Express-validator)
│   ├── ErrorMiddleware.js     # Global error handling
│   ├── UploadMiddleware.js    # Multer file upload handling
│   └── RateLimitMiddleware.js # API rate limiting
│
├── Utils/
│   ├── validators.js          # Input validation helpers
│   ├── helpers.js             # Common utility functions
│   ├── constants.js           # Application constants (roles, statuses, etc.)
│   ├── errorHandler.js        # Error handling utilities
│   ├── emailTemplates.js      # Email HTML templates
│   ├── pdfGenerator.js        # PDF generation utilities
│   └── logger.js              # Logging utility (Winston/Morgan)
│
├── Tests/(Manually)
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
│
├── .env                       # Environment variables
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── index.js                   # Application entry point
├── server.js                  # Server configuration
├── package.json               # Dependencies
└── README.md                  # Backend documentation
```

### Key Differences from Service-Based Architecture

**Controllers now handle:**
- Business logic directly
- Email sending (using Nodemailer from Config)
- Payment processing (using Razorpay/Stripe from Config)
- File uploads (using Cloudinary from Config)
- Notifications (direct database operations)
- PDF generation (using Utils)

