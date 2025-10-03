import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// 게시글 목록 조회 (페이지네이션, 필터링)
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'RECRUITING',
      location,
      minPrice,
      maxPrice 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // 필터 조건 구성
    const where: any = {};
    
    if (status) {
      where.status = status as string;
    }
    
    if (location) {
      where.pickupLocation = {
        contains: location as string,
        mode: 'insensitive'
      };
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          participations: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true
                }
              }
            }
          },
          _count: {
            select: {
              participations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 게시글 상세 조회
export const getPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            createdAt: true
          }
        },
        participations: {
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
        },
        chatRoom: {
          select: {
            id: true
          }
        }
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 게시글 생성
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      price,
      minPeople,
      maxPeople,
      pickupLocation,
      pickupLatitude,
      pickupLongitude,
      deadline,
      imageUrl
    } = req.body;

    // 필수 필드 검증
    if (!title || !description || !price || !minPeople || !maxPeople || !pickupLocation || !deadline) {
      res.status(400).json({ 
        error: 'Title, description, price, people counts, pickup location, and deadline are required' 
      });
      return;
    }

    // 날짜 검증
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      res.status(400).json({ error: 'Deadline must be in the future' });
      return;
    }

    // 인원수 검증
    if (minPeople < 1 || maxPeople < minPeople) {
      res.status(400).json({ error: 'Invalid people count' });
      return;
    }

    const post = await prisma.post.create({
      data: {
        title,
        description,
        price: Number(price),
        minPeople: Number(minPeople),
        maxPeople: Number(maxPeople),
        pickupLocation,
        pickupLatitude: pickupLatitude ? Number(pickupLatitude) : null,
        pickupLongitude: pickupLongitude ? Number(pickupLongitude) : null,
        deadline: deadlineDate,
        imageUrl: imageUrl || null,
        authorId: req.user!.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // 게시글 생성과 함께 채팅룸도 생성
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name: `${title} 채팅방`,
        postId: post.id,
        members: {
          create: {
            userId: req.user!.id
          }
        }
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        ...post,
        chatRoom: { id: chatRoom.id }
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 게시글 수정
export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      minPeople,
      maxPeople,
      pickupLocation,
      pickupLatitude,
      pickupLongitude,
      deadline,
      imageUrl,
      status
    } = req.body;

    // 게시글 존재 및 권한 확인
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (existingPost.authorId !== req.user!.id) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    // 업데이트할 데이터 구성
    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = Number(price);
    if (minPeople) updateData.minPeople = Number(minPeople);
    if (maxPeople) updateData.maxPeople = Number(maxPeople);
    if (pickupLocation) updateData.pickupLocation = pickupLocation;
    if (pickupLatitude !== undefined) updateData.pickupLatitude = pickupLatitude ? Number(pickupLatitude) : null;
    if (pickupLongitude !== undefined) updateData.pickupLongitude = pickupLongitude ? Number(pickupLongitude) : null;
    if (deadline) updateData.deadline = new Date(deadline);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (status) updateData.status = status;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        participations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 게시글 삭제
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 게시글 존재 및 권한 확인
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (existingPost.authorId !== req.user!.id) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    await prisma.post.delete({
      where: { id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 게시글 참여
export const joinPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        participations: true
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // 모집 상태 확인
    if (post.status !== 'RECRUITING') {
      res.status(400).json({ error: 'Post is not accepting participants' });
      return;
    }

    // 작성자는 참여할 수 없음
    if (post.authorId === req.user!.id) {
      res.status(400).json({ error: 'Post author cannot join their own post' });
      return;
    }

    // 이미 참여했는지 확인
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_postId: {
          userId: req.user!.id,
          postId: id
        }
      }
    });

    if (existingParticipation) {
      res.status(400).json({ error: 'Already participating in this post' });
      return;
    }

    // 최대 참여자 수 확인
    if (post.currentPeople >= post.maxPeople) {
      res.status(400).json({ error: 'Post is full' });
      return;
    }

    // 참여 등록 및 현재 참여자 수 업데이트
    const [participation] = await Promise.all([
      prisma.participation.create({
        data: {
          userId: req.user!.id,
          postId: id
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }),
      prisma.post.update({
        where: { id },
        data: {
          currentPeople: {
            increment: 1
          }
        }
      }),
      // 채팅방에 사용자 추가
      prisma.chatRoomMember.create({
        data: {
          userId: req.user!.id,
          chatRoomId: (await prisma.chatRoom.findUnique({ where: { postId: id } }))!.id
        }
      })
    ]);

    res.json({
      message: 'Successfully joined the post',
      participation
    });
  } catch (error) {
    console.error('Join post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 게시글 참여 취소
export const leavePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const participation = await prisma.participation.findUnique({
      where: {
        userId_postId: {
          userId: req.user!.id,
          postId: id
        }
      }
    });

    if (!participation) {
      res.status(404).json({ error: 'Not participating in this post' });
      return;
    }

    // 참여 삭제 및 현재 참여자 수 업데이트
    await Promise.all([
      prisma.participation.delete({
        where: {
          userId_postId: {
            userId: req.user!.id,
            postId: id
          }
        }
      }),
      prisma.post.update({
        where: { id },
        data: {
          currentPeople: {
            decrement: 1
          }
        }
      }),
      // 채팅방에서 사용자 제거
      prisma.chatRoomMember.deleteMany({
        where: {
          userId: req.user!.id,
          chatRoom: {
            postId: id
          }
        }
      })
    ]);

    res.json({ message: 'Successfully left the post' });
  } catch (error) {
    console.error('Leave post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 내가 작성한 게시글 조회
export const getMyPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      authorId: req.user!.id
    };

    if (status) {
      where.status = status as string;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        include: {
          participations: {
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
          _count: {
            select: {
              participations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 내가 참여한 게시글 조회
export const getMyParticipations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      participations: {
        some: {
          userId: req.user!.id
        }
      }
    };

    if (status) {
      where.status = status as string;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          participations: {
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
          _count: {
            select: {
              participations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Get my participations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};