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

  @Post('notes/categorize')
  @ApiOperation({ summary: 'Auto-categorize note content with tags and summary' })
  async categorizeNote(@Body() dto: { title: string; content?: string }) {
    return this.aiService.categorizeNote(dto);
  }

  @Post('notes/search')
  @ApiOperation({ summary: 'Perform AI conceptual semantic search over user notes' })
  async semanticSearchNotes(@CurrentUser('id') userId: string, @Body('query') query: string) {
    return this.aiService.semanticSearchNotes(userId, query || '');
  }

  @Get('burnout-risk')
  @ApiOperation({ summary: 'Calculate real-time user Energy Index and Burnout Risk Guard metrics' })
  async getBurnoutRisk(@CurrentUser('id') userId: string) {
    return this.aiService.calculateBurnoutRisk(userId);
  }
}
