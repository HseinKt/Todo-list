import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, userId, deletedAt: null },
      });
      if (!project) {
        throw new NotFoundException('Project not found or access denied');
      }
    }

    return this.taskRepository.create({
      data: {
        userId,
        text: dto.text,
        description: dto.description || null,
        status: dto.status || 'TODO',
        priority: dto.priority || 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        todoListId: dto.todoListId || null,
        categoryId: dto.categoryId || null,
        projectId: dto.projectId || null,
      },
    });
  }

  async findAll(userId: string, query: TaskQueryDto) {
    return this.taskRepository.findUserTasks(userId, query);
  }

  async findOne(userId: string, id: string) {
    const task = await this.taskRepository.findUnique({
      where: { id },
      include: { category: true, project: true },
    });
    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }
    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.findOne(userId, id);
    const completing = dto.completed === true && !task.completed;
    const undoing = dto.completed === false && task.completed;

    return this.prisma.$transaction(async (tx) => {
      const isCompleted = dto.status ? dto.status === 'COMPLETED' : dto.completed;

      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          text: dto.text,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          todoListId: dto.todoListId,
          categoryId: dto.categoryId,
          projectId: dto.projectId,
          completed: isCompleted,
        },
      });

      if (completing) {
        await this.awardXp(userId, 15, tx);
      } else if (undoing) {
        await this.awardXp(userId, -15, tx);
      }

      return updatedTask;
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.taskRepository.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async awardXp(userId: string, xpAmount: number, tx: any) {
    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) return;

    let newXp = profile.currentXp + xpAmount;
    let newLevel = profile.level;

    if (newXp < 0) {
      newXp = 0;
    }

    const xpNeeded = newLevel * 100;
    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
    }

    await tx.profile.update({
      where: { userId },
      data: { currentXp: newXp, level: newLevel },
    });
  }
}
