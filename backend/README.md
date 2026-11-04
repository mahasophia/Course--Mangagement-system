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
| GET | /messages/:userId | logged in (own conversation) |
| GET | /notifications | logged in |
| PATCH | /notifications/:id/read | logged in (own only) |
| GET | /health | public |

Socket.IO (same port): connect with `auth: { token }`. Events: `send_message` -> `receive_message`, `new_notification`.

## Testing
Import `docs/postman/Course-Management-API.postman_collection.json` into Postman and run it in order
(register -> login saves the token automatically).
