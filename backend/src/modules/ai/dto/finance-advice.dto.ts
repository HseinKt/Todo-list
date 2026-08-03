import { IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FinanceAdviceDto {
  @ApiPropertyOptional({ description: 'Optional explicit transaction subset to evaluate' })
  @IsArray()
  @IsOptional()
  transactions?: any[];
}
