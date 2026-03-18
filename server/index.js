/**
 * Standalone Socket.io server for real-time attendance code sync.
 * Run: node server/index.js (default port 3001).
 * Clients join room by classId; server emits code-update when API calls POST /broadcast.
 */

const http = require("http");
const { Server } = require("socket.io");

const PORT = Number(process.env.SOCKET_SERVER_PORT) || 3001;

const httpServer = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { classId, code, startTime } = JSON.parse(body);
        if (classId && code != null) {
          io.to(`class-${classId}`).emit("code-update", {
            code: String(code),
            startTime: startTime || null,
          });
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }
  if (req.method === "POST" && req.url === "/broadcast-record") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { classId, studentId, status } = JSON.parse(body);
        if (classId) {
          io.to(`class-${classId}`).emit("record-added", {
            studentId: studentId || null,
            status: status || "Present",
          });
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-class", (classId) => {
    const room = `class-${classId}`;
    socket.join(room);
  });
  socket.on("leave-class", (classId) => {
    socket.leave(`class-${classId}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});
