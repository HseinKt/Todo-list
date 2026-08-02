import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNoteDto {
  @ApiProperty({ description: 'The title of the note', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'The content of the note', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Whether the note is pinned', required: false })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @ApiProperty({ description: 'Whether the note is archived', required: false })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
