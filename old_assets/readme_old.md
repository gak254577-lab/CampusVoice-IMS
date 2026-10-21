# CampusVoice - Legacy README (Archived)

> **⚠️ This document is archived and outdated.**
> The current, up-to-date README is located at `/README.md` in the project root.

---

## What Was CampusVoice (v0.9 Beta)?

CampusVoice was originally planned as a simple grievance form submission system for IMS Engineering College. The initial prototype was a static HTML form that emailed submissions to the administration.

---

## Original v0.9 Feature Scope

- Basic HTML form for complaint submission
- Email delivery via SMTP (later scrapped)
- Simple admin view (password-protected static page)
- No real-time updates
- No file attachments
- No AI analysis

---

## Why Was This Version Archived?

The v0.9 prototype was replaced entirely by the current React + Firebase architecture due to:

- Need for real-time ticket status updates
- Requirement for multi-role access (Student / Admin / Warden)
- AI-powered severity tagging using Gemini
- Better scalability for the college community
- Demand for anonymous complaint submission

---

## Old Tech Stack (Deprecated)

| Layer      | Old Technology       | Current Replacement           |
|------------|---------------------|-------------------------------|
| Frontend   | Plain HTML/CSS/JS   | React 19 + Tailwind CSS       |
| Backend    | PHP mailer script   | Express.js + Firebase Admin   |
| Database   | None (email only)   | Cloud Firestore               |
| Auth       | Simple password     | Firebase Authentication       |
| Deployment | Shared cPanel host  | Netlify                       |

---

## Archived Contact (No Longer Active)

- Old project email: campusvoice-dev@placeholder.example
- Old repo path: /var/www/campusvoice-v0

---

*Last updated: August 2025. This file is retained for archival purposes only.*
