import { Controller, Post, Body, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { DecomposeGoalDto } from './dto/decompose-goal.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Intelligence')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('decompose')
  @ApiOperation({ summary: 'Decompose a high-level goal into structured Kanban sub-tasks' })
  async decomposeGoal(@Body() dto: DecomposeGoalDto) {
    return this.aiService.decomposeGoal(dto);
  }

  @Get('finance/advice')
  @ApiOperation({ summary: 'Generate AI financial advice and anomaly recommendations' })
  async getFinancialAdvice(@CurrentUser('id') userId: string) {
    return this.aiService.generateFinancialAdvice(userId);
  }
}
