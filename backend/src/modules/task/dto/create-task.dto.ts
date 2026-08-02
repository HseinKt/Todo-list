import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete database migration' })
  @IsString()
  @IsNotEmpty({ message: 'Task text must not be empty' })
  text!: string;

  @ApiPropertyOptional({ example: 'Run npx prisma migrate deploy against Supabase' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'], { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  @IsOptional()
  priority?: string = 'MEDIUM';

  @ApiPropertyOptional({ example: '2026-08-01T12:00:00.000Z' })
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
}
