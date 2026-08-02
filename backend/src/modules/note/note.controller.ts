import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notes')
@ApiBearerAuth()
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.noteService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user notes' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.noteService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific note by ID' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.noteService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note by ID' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.noteService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note by ID' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.noteService.remove(id, userId);
    return { message: 'Note deleted successfully' };
  }
}
