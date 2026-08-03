import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DecomposeGoalDto {
  @ApiProperty({ example: 'Launch SaaS MVP in 30 days' })
  @IsString()
  @IsNotEmpty({ message: 'Goal title must not be empty' })
  goalTitle!: string;

  @ApiPropertyOptional({ example: 14 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  targetDays?: number = 14;
}
