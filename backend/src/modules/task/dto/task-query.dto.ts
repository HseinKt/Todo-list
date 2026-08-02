import { IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class TaskQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional()
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsUUID('4')
  @IsOptional()
  projectId?: string;
}
