# SkillMatrix - Student Course Management System

A full-stack course platform: students register, browse courses, enroll, learn from course content, track progress and chat; admins manage students, courses, content and enrollments.

| Layer | Technology |
| --- | --- |
| Frontend | React (Vite), React Router, Axios, Socket.IO client |
| Backend | Node.js, Express, JWT auth, Socket.IO |
| Database | MongoDB (Mongoose) |
| Hosting | Frontend on Vercel, backend on Render, database on MongoDB Atlas |

## Project structure
```
backend/          Express API + Socket.IO  (see backend/README.md for every endpoint)
react-frontend/   React app
docs/             database-schema.md, postman/ collection
```

## Run locally
**1. Backend**
```bash
cd backend
npm install
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET and the admin seed values
npm run seed             # creates the first admin account
npm run dev              # http://localhost:5000  (health check: /api/health)
```
**2. Frontend**
```bash
cd react-frontend
npm install
cp .env.example .env     # VITE_BACKEND_URL and VITE_SOCKET_URL (defaults point at localhost:5000)
npm run dev              # http://localhost:5173
```

## Environment variables
| Where | Variable | Purpose |
| --- | --- | --- |
| backend | `MONGO_URI` | Atlas / local MongoDB connection string |
| backend | `JWT_SECRET`, `JWT_EXPIRES_IN` | token signing (use a long random secret) |
| backend | `CLIENT_URL` | allowed frontend origin(s), comma separated (CORS + Socket.IO) |
| backend | `ADMIN_*` | used only by `npm run seed` |
| frontend | `VITE_BACKEND_URL` | REST base URL **including** `/api/v1` |
| frontend | `VITE_SOCKET_URL` | backend origin **without** `/api/v1` |

Never commit `.env` files. `.env.example` files contain placeholders only.

## Deploy
1. **MongoDB Atlas** - create a cluster and a database user, allow Render's IPs (or `0.0.0.0/0` while testing), copy the connection string.
2. **Render (backend)** - new Web Service, root directory `backend`, build `npm install`, start `npm start`. Set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your Vercel URL) and `NODE_ENV=production`. Open a Render shell and run `npm run seed` once.
3. **Vercel (frontend)** - import the repo, root directory `react-frontend`. Set `VITE_BACKEND_URL=https://<render-app>.onrender.com/api/v1` and `VITE_SOCKET_URL=https://<render-app>.onrender.com`. `vercel.json` already rewrites all routes to `index.html`.
4. Put the live URLs here:
   - Frontend: _add Vercel URL_
   - Backend: _add Render URL_

## Test checklist (tick each box after you have run it)
- [ ] Import `docs/postman/Course-Management-API.postman_collection.json`, set `baseUrl`, run folders 1 to 8 - all tests green
- [ ] Student: register, log in, enroll in a course, open its content, mark a lesson and the course complete
- [ ] Admin: add / edit / delete a course, add modules and lessons, Clear All enrollments
- [ ] Chat: a student can message an admin and a classmate, not other students; messages arrive in real time
- [ ] Production: login works from the Vercel URL (no CORS errors), `/api/health` returns OK on Render

## Security notes
- Passwords are hashed with bcrypt (12 rounds); JWTs are signed with `JWT_SECRET`; role checks run on the server.
- CORS is limited to `CLIENT_URL`; helmet is enabled; login is limited to 10 attempts / 15 min and the rest of `/api` to 300 requests / 15 min per IP; sockets are limited to 20 messages / 10 s.
- If a secret was ever committed or shared, rotate it (new Atlas password, new `JWT_SECRET`).
