import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'Grocery shopping at Market' })
  @IsString()
  @IsNotEmpty({ message: 'Transaction description is required' })
  description!: string;

  @ApiProperty({ example: 45.50 })
  @IsNumber({}, { message: 'Amount must be a numeric value' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount!: number;

  @ApiProperty({ enum: ['INFLOW', 'OUTFLOW'], default: 'OUTFLOW' })
  @IsEnum(['INFLOW', 'OUTFLOW'], { message: 'Type must be INFLOW or OUTFLOW' })
  type!: 'INFLOW' | 'OUTFLOW';

  @ApiPropertyOptional()
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: '2026-07-30T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;
}
