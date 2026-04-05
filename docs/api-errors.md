# API Error Reference

> Standard error responses returned by the CampusEventHub backend.

All error responses follow this shape:

```json
{
  "message": "Human-readable error description"
}
```

Or for validation errors:

```json
{
  "message": "Validation Error",
  "error": "Invalid input"
}
```

---

## HTTP Status Codes Used

| Code | Meaning | When it occurs |
|---|---|---|
| 200 | OK | Successful GET, PATCH, PUT, DELETE |
| 201 | Created | Successful POST that creates a resource |
| 400 | Bad Request | Missing fields, invalid input, business rule violation |
| 401 | Unauthorized | No token, invalid token, expired token |
| 403 | Forbidden | Valid token but insufficient role or account not approved |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Unhandled exception, DB error, Cloudinary failure |

---

## Auth Errors — `/auth`

| Scenario | Status | Message |
|---|---|---|
| Missing required signup fields | 400 | `"All fields are required"` |
| Phone number too short | 400 | `"Please enter a valid phone number"` |
| College ID not found | 404 | `"College not found"` |
| Email already registered and verified | 400 | `"An account with this email already exists."` |
| Email send failure during signup | 500 | `"Could not send verification email. Please try again later."` |
| Invalid or expired OTP (verify-email) | 400 | `"Invalid or expired OTP"` |
| Email not registered (login) | 404 | `"Please register first"` |
| Wrong password | 400 | `"Invalid credentials"` |
| Email not verified (login) | 403 | `"Please register first"` |
| Account pending admin approval | 403 | `"Your account is pending approval by your college admin."` |
| No token provided | 401 | `"Access denied. No token provided."` |
| Invalid or expired token | 401 | `"Invalid or expired token"` |
| Invalid or expired reset OTP | 400 | `"Invalid or expired OTP"` |
| User not found (forgot-password) | 404 | `"User not found"` |

---

## Event Errors — `/events`

| Scenario | Status | Message |
|---|---|---|
| Missing required event fields | 400 | `"All required fields must be provided"` |
| Image upload to Cloudinary fails | 500 | `"Image upload failed"` |
| Event not found | 404 | `"Event not found"` |
| Update/delete by non-owner non-admin | 403 | `"You don't have permission to update/delete this event"` |

---

## Registration Errors — `/registrations`

| Scenario | Status | Message |
|---|---|---|
| Missing eventId | 400 | `"Event ID is required"` |
| Event not found | 404 | `"Event not found"` |
| Event not approved | 400 | `"Event is not yet approved for registration"` |
| Registration deadline passed | 400 | `"Registration deadline has passed"` |
| Already registered | 400 | `"You are already registered for this event"` |
| Event is full (no seats) | 400 | `"Event is full"` |
| Registration not found | 404 | `"Registration not found"` |
| Cancel by non-owner non-admin | 403 | `"You don't have permission to cancel this registration"` |
| Comment text missing | 400 | `"Comment text is required"` |
| Event not found (comment) | 404 | `"Event not found"` |

---

## Notification Errors — `/notifications`

| Scenario | Status | Message |
|---|---|---|
| Missing title or message | 400 | `"Title and message are required"` |
| Neither eventId nor clubId provided | 400 | `"Either eventId or clubId is required"` |
| Event not found | 404 | `"Event not found"` |
| Club not found | 404 | `"Club not found"` |
| Notification not found | 404 | `"Notification not found"` |
| Delete by non-sender non-admin | 403 | `"You don't have permission to delete this notification"` |

---

## Profile Errors — `/profile`

| Scenario | Status | Message |
|---|---|---|
| User not found | 404 | `"User not found"` |
| No club linked to user (club update) | 400 | `"No club linked to this user"` |
| No file uploaded | 400 | `"No file uploaded"` |
| No profile picture to delete | 404 | `"No profile picture to delete"` |
| No club logo to delete | 404 | `"No club logo to delete"` |
| Missing current or new password | 400 | `"Current password and new password are required"` |
| New password too short | 400 | `"New password must be at least 6 characters"` |
| Current password incorrect | 400 | `"Current password is incorrect"` |
| No college found for user (clubs) | 400 | `"No college found for this user"` |

---

## Admin Errors — `/admin`

| Scenario | Status | Message |
|---|---|---|
| Event not found | 404 | `"Event not found"` |
| Approve event from different college | 403 | `"You can only approve events from your college"` |
| Event not in Submitted state | 400 | `"Event is not in submitted state"` |
| Reject without reason | 400 | `"Rejection reason is required"` |
| Reject event from different college | 403 | `"You can only reject events from your college"` |
| Club name missing (create club) | 400 | `"Club name is required"` |
| Duplicate club name in college | 400 | `"A club with this name already exists in your college"` |
| Club not found | 404 | `"Club not found"` |
| Club belongs to different college | 403 | `"Club does not belong to your college"` |
| User not found (assign organizer) | 404 | `"User not found"` |
| User is deleted | 400 | `"User is deleted"` |
| User from different college | 403 | `"User does not belong to your college"` |
| User not assigned to club (remove) | 400 | `"User is not assigned to this club"` |
| Review cross-college reg from wrong college | 403 | `"You can only review registrations from your college students"` |

---

## Superadmin Errors — `/superadmin`

| Scenario | Status | Message |
|---|---|---|
| College name missing | 400 | `"College name is required"` |
| Duplicate college name | 400 | `"College already exists"` |
| College not found | 404 | `"College not found"` |
| Delete college with active events | 400 | `"Cannot delete college with {n} active events. Reject them first."` |
| Missing admin fields | 400 | `"All fields are required"` |
| College not found (create admin) | 404 | `"College not found"` |
| Email already in use | 400 | `"Email already in use"` |
| Admin not found | 404 | `"Admin not found"` |
| Target user is not an admin | 400 | `"User is not an admin"` |

---

## Role / Auth Middleware Errors

| Scenario | Status | Message |
|---|---|---|
| No token in cookie or header | 401 | `"Access denied. No token provided."` |
| Token invalid or expired | 401 | `"Invalid or expired token"` |
| Role not in allowed list | 403 | `"Access denied. Insufficient permissions."` |
| No user on request (role check) | 401 | `"Unauthorized"` |
| Profile ownership violation | 403 | `"Access denied. You can only update your own profile."` |
| Non-organizer accessing organizer route | 403 | `"Access denied. Only organizers can update club information."` |

---

## Global Error Handler

Unhandled errors bubble up to the Express global error handler in `index.js`:

```json
{
  "success": false,
  "message": "Error message or Internal Server Error"
}
```

Status defaults to `500` unless `err.status` is set.
