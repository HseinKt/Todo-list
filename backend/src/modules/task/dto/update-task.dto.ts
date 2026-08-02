import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH'] })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsUUID('4')
  @IsOptional()
  todoListId?: string;

  @ApiPropertyOptional()
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsUUID('4')
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
