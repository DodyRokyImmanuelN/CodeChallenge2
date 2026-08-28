import { Test, TestingModule } from '@nestjs/testing';
import { ThreadsService } from './threads.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ThreadsService', () => {
  let threadsService: ThreadsService;
  let prisma: {
    thread: {
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      thread: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreadsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    threadsService = module.get<ThreadsService>(ThreadsService);
  });

  it('should be defined', () => {
    expect(threadsService).toBeDefined();
  });
    describe('update', () => {
    it('should update the thread if the user is the owner', async () => {
      prisma.thread.findUnique.mockResolvedValue({
        id: 'thread-1',
        title: 'Old Title',
        content: 'Old Content',
        user_id: 'owner-id',
      });
      prisma.thread.update.mockResolvedValue({
        id: 'thread-1',
        title: 'New Title',
        content: 'New Content',
        user_id: 'owner-id',
      });

      const result = await threadsService.update('thread-1', 'owner-id', {
        title: 'New Title',
        content: 'New Content',
      });

      expect(result.title).toBe('New Title');
      expect(prisma.thread.update).toHaveBeenCalledWith({
        where: { id: 'thread-1' },
        data: { title: 'New Title', content: 'New Content' },
      });
    });

    it('should throw NotFoundException if thread does not exist', async () => {
      prisma.thread.findUnique.mockResolvedValue(null);

      await expect(
        threadsService.update('thread-1', 'owner-id', { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.thread.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      prisma.thread.findUnique.mockResolvedValue({
        id: 'thread-1',
        title: 'Old Title',
        content: 'Old Content',
        user_id: 'owner-id',
      });

      await expect(
        threadsService.update('thread-1', 'someone-else-id', { title: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.thread.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete the thread if the user is the owner', async () => {
      prisma.thread.findUnique.mockResolvedValue({
        id: 'thread-1',
        title: 'Title',
        content: 'Content',
        user_id: 'owner-id',
      });
      prisma.thread.delete.mockResolvedValue({
        id: 'thread-1',
        title: 'Title',
        content: 'Content',
        user_id: 'owner-id',
      });

      const result = await threadsService.remove('thread-1', 'owner-id');

      expect(result.id).toBe('thread-1');
      expect(prisma.thread.delete).toHaveBeenCalledWith({
        where: { id: 'thread-1' },
      });
    });

    it('should throw NotFoundException if thread does not exist', async () => {
      prisma.thread.findUnique.mockResolvedValue(null);

      await expect(
        threadsService.remove('thread-1', 'owner-id'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.thread.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      prisma.thread.findUnique.mockResolvedValue({
        id: 'thread-1',
        title: 'Title',
        content: 'Content',
        user_id: 'owner-id',
      });

      await expect(
        threadsService.remove('thread-1', 'someone-else-id'),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.thread.delete).not.toHaveBeenCalled();
    });
  });
});