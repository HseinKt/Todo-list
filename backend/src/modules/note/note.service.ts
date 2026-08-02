import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteRepository } from './note.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from '@prisma/client';

@Injectable()
export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}

  async create(userId: string, dto: CreateNoteDto): Promise<Note> {
    return this.noteRepository.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content || '',
      },
    });
  }

  async findAll(userId: string): Promise<Note[]> {
    return this.noteRepository.findByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.noteRepository.findUnique({ where: { id } });
    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async update(id: string, userId: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id, userId);
    return this.noteRepository.update({
      where: { id: note.id },
      data: dto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
    await this.noteRepository.delete({ where: { id: note.id } });
  }
}
