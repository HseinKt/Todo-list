import { Injectable } from '@nestjs/common';
import { Note } from '@prisma/client';
import { BaseRepository } from '../../common/prisma/base.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NoteRepository extends BaseRepository<Note> {
  constructor(prisma: PrismaService) {
    super(prisma, 'note');
  }

  async findByUserId(userId: string): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
