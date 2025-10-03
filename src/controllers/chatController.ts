import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// 채팅방 목록 조회
export const getChatRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId: req.user!.id
          }
        }
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            status: true,
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true,
            members: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json({ chatRooms });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 특정 채팅방 정보 조회
export const getChatRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: req.user!.id
          }
        }
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            status: true,
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!chatRoom) {
      res.status(404).json({ error: 'Chat room not found or access denied' });
      return;
    }

    res.json({ chatRoom });
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 채팅방 메시지 조회 (페이지네이션)
export const getChatMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // 채팅방 멤버인지 확인
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: req.user!.id
          }
        }
      }
    });

    if (!chatRoom) {
      res.status(404).json({ error: 'Chat room not found or access denied' });
      return;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          chatRoomId: id
        },
        skip,
        take,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.message.count({
        where: {
          chatRoomId: id
        }
      })
    ]);

    // 시간 순으로 정렬 (오래된 것부터)
    messages.reverse();

    res.json({
      messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 메시지 전송 (REST API용 - Socket.IO와 별도)
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    // 채팅방 멤버인지 확인
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: req.user!.id
          }
        }
      }
    });

    if (!chatRoom) {
      res.status(404).json({ error: 'Chat room not found or access denied' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: req.user!.id,
        chatRoomId: id
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
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 채팅방 나가기
export const leaveChatRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 채팅방 멤버인지 확인
    const member = await prisma.chatRoomMember.findFirst({
      where: {
        userId: req.user!.id,
        chatRoomId: id
      }
    });

    if (!member) {
      res.status(404).json({ error: 'Not a member of this chat room' });
      return;
    }

    await prisma.chatRoomMember.delete({
      where: {
        id: member.id
      }
    });

    res.json({ message: 'Left chat room successfully' });
  } catch (error) {
    console.error('Leave chat room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};