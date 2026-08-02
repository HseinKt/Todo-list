import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { NoteRepository } from './note.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository],
  exports: [NoteService],
})
export class NoteModule {}
