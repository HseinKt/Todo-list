import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.taskService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user tasks (paginated, with search and filters)' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.taskService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.taskService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a task' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.taskService.remove(userId, id);
  }
}
