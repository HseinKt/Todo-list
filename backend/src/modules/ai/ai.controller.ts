import { Controller, Post, Body, Get, Query } from '@nestjs/common';
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

  @Get('executive-review')
  @ApiOperation({ summary: 'Generate AI Executive Retrospective Briefing (Weekly, Monthly, Yearly)' })
  async getExecutiveReview(
    @CurrentUser('id') userId: string,
    @Query('period') period?: 'WEEKLY' | 'MONTHLY' | 'YEARLY',
  ) {
    return this.aiService.generateExecutiveReview(userId, period || 'WEEKLY');
  }

  @Get('finance/leaks')
  @ApiOperation({ summary: 'Scan transactions for recurring subscription leaks and potential savings' })
  async detectSubscriptionLeaks(@CurrentUser('id') userId: string) {
    return this.aiService.detectSubscriptionLeaks(userId);
  }

  @Post('planner/habit-plan')
  @ApiOperation({ summary: 'Generate recurring micro-habit schedule for study, workout, or reading goals' })
  async generateHabitPlan(@Body() dto: { habitGoal: string; daysPerWeek?: number }) {
    return this.aiService.generateHabitPlan(dto);
  }

  @Post('notes/summarize-actions')
  @ApiOperation({ summary: 'Summarize note content and extract actionable tasks' })
  async summarizeNoteAndExtractActions(@Body() dto: { title: string; content: string }) {
    return this.aiService.summarizeNoteAndExtractActions(dto);
  }

  @Get('tasks/eisenhower')
  @ApiOperation({ summary: 'Classify active tasks into the 4 Eisenhower Urgency/Impact Quadrants' })
  async prioritizeTasksWithEisenhower(@CurrentUser('id') userId: string) {
    return this.aiService.prioritizeTasksWithEisenhower(userId);
  }

  @Get('finance/predict-growth')
  @ApiOperation({ summary: 'Forecast net worth capital growth over 3, 6, and 12 months based on cash flow' })
  async predictNetWorthGrowth(@CurrentUser('id') userId: string) {
    return this.aiService.predictNetWorthGrowth(userId);
  }
}
