# Attendance Socket Server

Real-time sync for the attendance 6-digit code. Run alongside the Next.js app so lecturer and student clients stay in sync.

- **Run:** `npm run socket` (or `node server/index.js`)
- **Port:** `3001` (or set `SOCKET_SERVER_PORT`)
- **Client URL:** Set `NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001` in `.env.local` so the app can connect.

The Next.js API calls this server’s `POST /broadcast` when the code rotates and `POST /broadcast-record` when a student submits attendance.
