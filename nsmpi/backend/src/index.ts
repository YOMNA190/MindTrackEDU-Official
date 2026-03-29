import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { authRouter } from './routes/auth';
import { screeningRouter } from './routes/screening';
import { errorHandler } from './middleware/errorHandler';

// ── Validate critical env vars at startup ─────────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[MindTrackEDU] Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const app = express();
const httpServer = createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', socket => {
  const userId = socket.handshake.auth.userId as string | undefined;
  if (userId) socket.join(`user:${userId}`);

  socket.on('disconnect', () => {
    if (userId) socket.leave(`user:${userId}`);
  });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? '*',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ── Health check (used by Railway) ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter);
app.use('/api/screening', screeningRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[MindTrackEDU] Server running on port ${PORT}`);
});

export { io };
