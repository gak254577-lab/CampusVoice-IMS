# CampusVoice — Meeting Minutes (Archived)

---

## Meeting 1 — Project Kickoff
**Date:** 15 January 2025  
**Attendees:** Project Lead, 2 Frontend Devs, 1 Backend Dev, Faculty Coordinator  
**Location:** CS Dept Lab, Room 204

### Discussion Points
- Project goal: Build a transparent grievance management portal for IMSEC students
- Decided on web-first approach (no mobile app in v1)
- Firebase selected for real-time database capabilities
- Target launch: End of semester (June 2025)

### Action Items
| Owner          | Task                                  | Due Date   |
|----------------|---------------------------------------|------------|
| Frontend Team  | Design wireframes for login & dashboard | 25 Jan 2025 |
| Backend Dev    | Set up Firebase project and Firestore  | 28 Jan 2025 |
| Project Lead   | Draft feature requirements document   | 22 Jan 2025 |
| Faculty Coord  | Get approval from Dean Student Welfare | 30 Jan 2025 |

---

## Meeting 2 — Design Review
**Date:** 10 February 2025  
**Attendees:** Project Lead, Frontend Team  
**Location:** Online (Google Meet)

### Discussion Points
- Reviewed wireframes — approved dark theme UI
- Agreed on Tailwind CSS for rapid styling
- Complaint categories finalised: Hostel, Classroom, Canteen, WiFi, Library, Admin, Other
- Role system: Student vs Admin (Warden, Dean, Registrar)

### Action Items
| Owner         | Task                              | Due Date   |
|---------------|-----------------------------------|------------|
| Frontend Dev 1 | Implement login screen UI        | 20 Feb 2025 |
| Frontend Dev 2 | Build complaint submission form   | 20 Feb 2025 |
| Backend Dev   | Set up Firestore rules and auth   | 18 Feb 2025 |

---

## Meeting 3 — Beta Testing Review
**Date:** 5 May 2025  
**Attendees:** All team members + 3 student testers  
**Location:** CS Dept Lab, Room 204

### Feedback from Student Testers
- Login page is clean and intuitive ✅
- Complaint form needs better validation messages
- Admin dashboard loads slowly on mobile
- Anonymous submission feature appreciated
- Requested: Email notification on ticket update

### Decisions Made
- Email notifications deferred to v2
- Mobile performance to be addressed before launch
- Validation messages to be improved immediately

---

## Meeting 4 — Final Sign-off
**Date:** 2 June 2025  
**Attendees:** Project Lead, Faculty Coordinator, Dean Student Welfare  
**Location:** Dean's Office

### Outcome
- Project approved for deployment ✅
- Netlify chosen as hosting platform
- Domain: campussvoice.netlify.app (live)
- Maintenance responsibility: CS Dept Technical Team

---

*These minutes are archived. The project is now in active maintenance mode.*
