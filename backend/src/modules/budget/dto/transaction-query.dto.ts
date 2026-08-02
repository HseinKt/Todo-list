import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class TransactionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['INFLOW', 'OUTFLOW'] })
  @IsEnum(['INFLOW', 'OUTFLOW'])
  @IsOptional()
  type?: 'INFLOW' | 'OUTFLOW';

  @ApiPropertyOptional()
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;
}
