# Backend (Express + MongoDB + Socket.IO)

## Setup
```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, admin seed values
npm run seed              # creates the first admin + sample courses
npm run dev               # http://localhost:5000
```
Generate a JWT secret:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Public registration only ever creates **students**. Admin accounts are created with `npm run seed`
(uses `ADMIN_EMAIL` / `ADMIN_PASSWORD`, password 12+ characters).

## Endpoints (all under `/api/v1`)
| Method | Path | Access |
| --- | --- | --- |
| POST | /auth/register | public (student) |
| POST | /auth/login | public, rate limited (10 / 15 min) |
| GET / PUT | /profile | logged in (own profile only) |
| GET, POST | /students | admin |
| GET, PUT, DELETE | /students/:id | admin |
| GET | /courses, /courses/:id | public (`?page=&limit=`, max 100) |
| POST, PUT, DELETE | /courses, /courses/:id | admin |
| GET | /courses/:courseId/content | enrolled student or admin |
| POST | /courses/:courseId/content/modules | admin |
| POST | /courses/:courseId/content/modules/:moduleId/lessons | admin |
| GET, POST | /enrollments | logged in (students see only their own) |
| GET, PATCH | /enrollments/:id | owner or admin (students may set `completed` / `withdrawn` on their own) |
| DELETE | /enrollments, /enrollments/:id | admin ("Clear All" / one record) |
| GET | /progress, /progress/:courseId | student |
| POST | /progress/:courseId/lessons/:lessonId | enrolled student (marks a lesson complete) |
| GET | /messages/contacts | logged in (admins: everyone; students: admins + classmates) |
| GET | /messages/:userId | logged in (own conversation) |
| GET | /notifications | logged in |
| PATCH | /notifications/:id/read | logged in (own only) |
| GET | /health | public |

Socket.IO (same port): connect with `auth: { token }`. Events: `send_message` -> `receive_message`, `new_notification`.
Chat rules: students can only message admins and classmates; each socket is limited to 20 messages / 10 seconds.

Rate limits: login 10 / 15 min, every other `/api` route 300 / 15 min per IP (`API_RATE_LIMIT`, `LOGIN_RATE_LIMIT` to change).

## Testing
Import `docs/postman/Course-Management-API.postman_collection.json` into Postman and run it in order
(register -> login saves the token automatically).


## Student course requests and email notifications

Students can submit a course request from the Student Dashboard using **Request a Course**. The request is stored in MongoDB (`courserequests` collection), and an in-app notification is created for every admin. Admins can approve or reject requests from the Admin Dashboard. Approving a request creates the course in the normal `courses` collection. Students can see the status under **My Course Requests**.

Email delivery is optional until SMTP is configured. Add these values to `backend/.env` (never commit this file):

```env
ADMIN_EMAIL=your-admin-email@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-16-character-google-app-password
SMTP_FROM=SkillMatrix <your-gmail-address@gmail.com>
```

For Gmail, enable 2-Step Verification and create a Google **App Password**. Use that App Password for `SMTP_PASS`; do not use your normal Gmail password. Install the mail package from the backend folder with `npm install nodemailer`, then restart the backend. If SMTP is not configured, requests are still saved and appear in the admin dashboard, but email is not sent.

New API endpoints (all require a valid JWT):
- `POST /api/v1/course-requests` — student submits a request.
- `GET /api/v1/course-requests` — admin sees all requests; student sees only their own.
- `PATCH /api/v1/course-requests/:id/review` — admin approves or rejects a pending request.
