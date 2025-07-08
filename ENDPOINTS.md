API ENDPOINTS DOCUMENTATION
===========================

This document describes all available API endpoints for authentication, user management, and verification workflows. All endpoints return JSON responses. For protected endpoints, include your JWT token in the `Authorization` header as `Bearer <token>`.

AUTHENTICATION ENDPOINTS
------------------------

POST   /auth/register
    - Register a new user
    - Public access
    - Body:
        {
          "email": "string",
          "password": "string",
          "fullName": "string",
          "phone": "string"
        }

POST   /auth/login
    - Login user
    - Public access
    - Body:
        {
          "email": "string",
          "password": "string"
        }

POST   /auth/forgot-password
    - Request password reset
    - Public access
    - Body:
        {
          "email": "string"
        }

POST   /auth/reset-password
    - Reset password
    - Public access
    - Body:
        {
          "token": "string",
          "newPassword": "string"
        }

PATCH  /auth/update-password
    - Update password
    - Requires authentication
    - Body:
        {
          "oldPassword": "string",
          "newPassword": "string"
        }

PATCH  /auth/update-profile
    - Update user profile (email, phone, etc.)
    - Requires authentication
    - Body:
        {
          "email": "string",      // optional
          "phone": "string",      // optional
          "fullName": "string"    // optional
        }

PATCH  /auth/set-user-status
    - Lock/disable or enable a user account
    - Admin only
    - Body:
        {
          "userId": "string",
          "status": "active" | "locked" | "disabled"
        }

GET    /auth/users
    - Get all users
    - Admin only
    - Body: none

GET    /auth/user
    - Get user by ID
    - Requires authentication
    - Query/body: none (uses JWT to identify user)

POST   /auth/refresh-token
    - Refresh JWT token
    - Public access
    - Body:
        {
          "refreshToken": "string"
        }

VERIFICATION ENDPOINTS
----------------------

POST   /verification/create
    - Create a new verification instance
    - Requires authentication
    - Body:
        {
          "type": "string", // e.g. "identity", "address"
          "details": { ... } // object, depends on verification type
        }

POST   /verification/add-document
    - Add a document (file upload) to a verification
    - Requires authentication
    - Use multipart/form-data with the 'file' field
    - Body:
        file: <PDF/IMG>,
        verificationId: "string"

PATCH  /verification/update-document-status
    - Update document status
    - Admin only
    - Body:
        {
          "documentId": "string",
          "status": "pending" | "approved" | "rejected",
          "reason": "string" // optional, for rejection
        }

POST   /verification/add-comment
    - Add a comment to a document
    - Requires authentication
    - Body:
        {
          "documentId": "string",
          "comment": "string"
        }

GET    /verification/all
    - Get all verifications (paginated)
    - Admin only
    - Query params: ?page=<number>&limit=<number>
    - Body: none

GET    /verification/user/:userId
    - Get all verifications for a specific user (paginated)
    - Requires authentication
    - Query params: ?page=<number>&limit=<number>
    - Body: none

GET    /verification/:verificationId
    - Get a verification with all documents and comments
    - Requires authentication
    - Body: none

GET    /verification/:verificationId/timeline
    - Get the timeline/history for a verification
    - Requires authentication
    - Body: none

GENERAL NOTES
-------------
- All endpoints return JSON.
- For file uploads, use multipart/form-data with the 'file' field.
- Pagination: use query parameters ?page=<number>&limit=<number> where applicable.
- Admin-only endpoints require an admin JWT token.
- Path parameters:
    - :userId = User's unique ID
    - :verificationId = Verification instance ID

ERROR RESPONSE FORMAT
---------------------
All errors follow this format:

    {
      "success": false,
      "message": "Error message.",
      "error": { ... }
    }

EXAMPLE: ADD DOCUMENT TO VERIFICATION
-------------------------------------
Request:
    POST /verification/add-document
    Headers: Authorization: Bearer <token>
    Content-Type: multipart/form-data
    Body: file=<PDF/IMG>, verificationId=<id>

Response:
    {
      "success": true,
      "message": "Document uploaded successfully.",
      "data": { ... }
    }

For more details or request/response examples, contact the backend team.

