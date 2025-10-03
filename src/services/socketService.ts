import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

import { Socket } from 'socket.io';

export const initializeSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true
    }
  });

  // Socket.IO 인증 미들웨어
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // 연결 처리
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // 채팅방 입장
    socket.on('join-room', async (data: { chatRoomId: string }) => {
      try {
        const { chatRoomId } = data;

        // 사용자가 해당 채팅방 멤버인지 확인
        const member = await prisma.chatRoomMember.findFirst({
          where: {
            userId: socket.userId!,
            chatRoomId
          }
        });

        if (!member) {
          socket.emit('error', { message: 'Access denied to chat room' });
          return;
        }

        socket.join(chatRoomId);
        socket.emit('joined-room', { chatRoomId });
        
        console.log(`User ${socket.userId} joined room ${chatRoomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // 채팅방 나가기
    socket.on('leave-room', (data: { chatRoomId: string }) => {
      const { chatRoomId } = data;
      socket.leave(chatRoomId);
      socket.emit('left-room', { chatRoomId });
      
      console.log(`User ${socket.userId} left room ${chatRoomId}`);
    });

    // 메시지 전송
    socket.on('send-message', async (data: { chatRoomId: string; content: string }) => {
      try {
        const { chatRoomId, content } = data;

        if (!content || content.trim() === '') {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // 채팅방 멤버인지 확인
        const member = await prisma.chatRoomMember.findFirst({
          where: {
            userId: socket.userId!,
            chatRoomId
          }
        });

        if (!member) {
          socket.emit('error', { message: 'Access denied to chat room' });
          return;
        }

        // 메시지 저장
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            senderId: socket.userId!,
            chatRoomId
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true
              }
            }
          }
        });

        // 채팅방 업데이트 시간 갱신
        await prisma.chatRoom.update({
          where: { id: chatRoomId },
          data: { updatedAt: new Date() }
        });

        // 채팅방의 모든 멤버에게 메시지 전송
        io.to(chatRoomId).emit('new-message', message);
        
        console.log(`Message sent in room ${chatRoomId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // 타이핑 상태 전송
    socket.on('typing-start', (data: { chatRoomId: string }) => {
      socket.to(data.chatRoomId).emit('user-typing', {
        userId: socket.userId,
        chatRoomId: data.chatRoomId
      });
    });

    socket.on('typing-stop', (data: { chatRoomId: string }) => {
      socket.to(data.chatRoomId).emit('user-stop-typing', {
        userId: socket.userId,
        chatRoomId: data.chatRoomId
      });
    });

    // 연결 해제 처리
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    // 에러 처리
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};