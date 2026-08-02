import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Budgets & Transactions')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post('transactions')
  @ApiOperation({ summary: 'Log a new transaction (inflow or outflow)' })
  async createTransaction(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.budgetService.createTransaction(userId, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated financial transactions' })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query() query: TransactionQueryDto,
  ) {
    return this.budgetService.getTransactions(userId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget limit for a category' })
  async createBudget(
    @CurrentUser('id') userId: string,
    @Body('categoryId') categoryId: string,
    @Body('amount') amount: number,
    @Body('period') period: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.budgetService.createBudget(userId, categoryId, amount, period, startDate, endDate);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active budgets for the user' })
  async getBudgets(@CurrentUser('id') userId: string) {
    return this.budgetService.getBudgets(userId);
  }

  @Post('seed-categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed default financial categories' })
  async seedCategories() {
    await this.budgetService.seedCategories();
    return { message: 'Expense categories seeded successfully' };
  }
}
