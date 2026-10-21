# CampusVoice API Reference — v1 (Deprecated)

> ⚠️ **ARCHIVED**: This API version is no longer active.
> Current endpoints are handled internally by the Express proxy in `server.ts`.
> This document is retained for historical reference only.

---

## Base URL (Old)

```
http://campusvoice-dev.local:4000/api/v1
```

---

## Endpoints (Deprecated)

### POST /complaints/submit
Submit a new student grievance ticket.

**Request Body:**
```json
{
  "studentId": "string",
  "category": "Hostel | Classroom | Canteen | WiFi | Library | Other",
  "title": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "ticketId": "CV-2025-XXXXX",
  "status": "Submitted",
  "message": "Complaint received."
}
```

---

### GET /complaints/:ticketId
Fetch a single complaint by ticket ID.

**Response:**
```json
{
  "ticketId": "CV-2025-00123",
  "status": "In Review",
  "assignedTo": "warden",
  "createdAt": "2025-04-10T08:30:00Z"
}
```

---

### GET /admin/tickets
Fetch all complaints. Admin access only.

**Headers:**
```
Authorization: Bearer <token>
```

---

### DELETE /admin/tickets/:id
Delete a complaint permanently.

---

## Authentication (Old System)

All admin endpoints previously required a static Bearer token.
This approach was replaced by Firebase Auth in v2.

---

## Changelog

| Version | Date       | Notes                              |
|---------|------------|------------------------------------|
| v1.0    | 2025-01-15 | Initial prototype API              |
| v1.2    | 2025-03-28 | Added admin delete endpoint        |
| v1.5    | 2025-06-01 | Deprecated in favour of Firebase   |

---

*This document is archived. Do not use these endpoints in production.*
