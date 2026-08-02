import { Injectable } from '@nestjs/common';
import { Task, Prisma } from '@prisma/client';
import { BaseRepository } from '../../common/prisma/base.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TaskQueryDto } from './dto/task-query.dto';

@Injectable()
export class TaskRepository extends BaseRepository<Task> {
  constructor(prisma: PrismaService) {
    super(prisma, 'task');
  }

  async findUserTasks(userId: string, query: TaskQueryDto): Promise<{ data: Task[]; total: number }> {
    const where: Prisma.TaskWhereInput = {
      userId,
      deletedAt: null,
    };

    if (query.completed !== undefined) {
      where.completed = query.completed;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.search) {
      where.OR = [
        { text: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (query.sortBy) {
      (orderBy as any)[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.limit,
        include: {
          category: true,
          project: true,
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data, total };
  }
}
