import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';

// 라우트 import
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import uploadRoutes from './routes/uploadRoutes';
import chatRoutes from './routes/chatRoutes';

// 서비스 import
import { initializeSocket } from './services/socketService';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 기본 미들웨어
app.use(helmet());
app.use(morgan('combined'));

// CORS 설정
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (업로드된 파일들)
const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadsDir)));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'BaeYo Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

// Health check 라우트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 핸들러
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// 글로벌 에러 핸들러
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// HTTP 서버 및 Socket.IO 설정
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// 서버 시작
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 BaeYo Backend server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Server listening on: http://0.0.0.0:${PORT}`);
  console.log(`🔌 Local access: http://localhost:${PORT}`);
  console.log(`🔌 Network access: http://112.170.204.205:${PORT}`);
  console.log(`🔒 CORS origins: ${process.env.CORS_ORIGIN}`);
  console.log(`💬 Socket.IO initialized for real-time chat`);
});

export default app;