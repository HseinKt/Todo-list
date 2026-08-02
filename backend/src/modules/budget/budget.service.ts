import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    const transactionDate = dto.transactionDate ? new Date(dto.transactionDate) : new Date();

    if (dto.categoryId) {
      const category = await this.prisma.expenseCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Expense category not found');
      }
    }

    const amountDecimal = new Decimal(dto.amount);

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          description: dto.description,
          amount: amountDecimal.toString(),
          type: dto.type,
          transactionDate,
          categoryId: dto.categoryId || null,
        },
      });

      let budgetAlert = false;
      let budgetMessage = '';

      if (dto.type === 'OUTFLOW' && dto.categoryId) {
        const activeBudget = await tx.budget.findFirst({
          where: {
            userId,
            categoryId: dto.categoryId,
            startDate: { lte: transactionDate },
            endDate: { gte: transactionDate },
            deletedAt: null,
          },
        });

        if (activeBudget) {
          const transactionsInPeriod = await tx.transaction.findMany({
            where: {
              userId,
              categoryId: dto.categoryId,
              type: 'OUTFLOW',
              transactionDate: {
                gte: activeBudget.startDate,
                lte: activeBudget.endDate,
              },
              deletedAt: null,
            },
          });

          const totalOutflow = transactionsInPeriod.reduce((sum: Decimal, t: any) => {
            return sum.plus(new Decimal(t.amount));
          }, new Decimal(0));

          const budgetLimit = new Decimal(activeBudget.amount);

          if (totalOutflow.greaterThan(budgetLimit)) {
            budgetAlert = true;
            budgetMessage = `Warning: You have exceeded your budget limit of $${budgetLimit.toFixed(2)} for this category. Total spent: $${totalOutflow.toFixed(2)}.`;
          }
        }
      }

      return {
        transaction,
        budgetAlert,
        budgetMessage,
      };
    });
  }

  async getTransactions(userId: string, query: TransactionQueryDto) {
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.description = { contains: query.search, mode: 'insensitive' };
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.transactionDate = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.limit,
        include: {
          category: true,
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, total };
  }

  async createBudget(
    userId: string,
    categoryId: string,
    amount: number,
    period: string,
    startDate: string,
    endDate: string,
  ) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount: new Decimal(amount).toString(),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
  }

  async getBudgets(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId, deletedAt: null },
      include: { category: true },
    });
  }

  async seedCategories() {
    const defaultCategories = [
      { name: 'Housing', color: '#EF4444' },
      { name: 'Groceries', color: '#F59E0B' },
      { name: 'Transport', color: '#10B981' },
      { name: 'Entertainment', color: '#3B82F6' },
      { name: 'Savings & Investment', color: '#8B5CF6' },
    ];

    for (const cat of defaultCategories) {
      await this.prisma.expenseCategory.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }
  }
}
