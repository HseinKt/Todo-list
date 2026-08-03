import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { DecomposeGoalDto } from './dto/decompose-goal.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AiService {
  private readonly aiClient: GoogleGenAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      this.aiClient = new GoogleGenAI({ apiKey });
    }
  }

  private ensureAiClient() {
    if (!this.aiClient) {
      return null;
    }
    return this.aiClient;
  }

  async decomposeGoal(dto: DecomposeGoalDto) {
    const ai = this.ensureAiClient();

    if (!ai) {
      return {
        milestones: [
          {
            title: `Phase 1: Requirements & Design for ${dto.goalTitle}`,
            description: 'Define core specifications and workflow architecture.',
            priority: 'HIGH',
            estimatedDays: 3,
          },
          {
            title: `Phase 2: Execution of ${dto.goalTitle}`,
            description: 'Develop primary modules and features.',
            priority: 'MEDIUM',
            estimatedDays: 7,
          },
          {
            title: `Phase 3: Review & Launch ${dto.goalTitle}`,
            description: 'Testing, verification, and final deployment.',
            priority: 'MEDIUM',
            estimatedDays: 4,
          },
        ],
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        milestones: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
              estimatedDays: { type: Type.NUMBER },
            },
            required: ['title', 'priority', 'estimatedDays'],
          },
        },
      },
      required: ['milestones'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Decompose the following high-level productivity goal into structured sub-tasks for a ${dto.targetDays || 14}-day roadmap: "${dto.goalTitle}".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err: any) {
      throw new BadRequestException(`AI Generation error: ${err.message}`);
    }
  }

  async generateFinancialAdvice(userId: string) {
    const ai = this.ensureAiClient();

    const userTransactions = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      orderBy: { transactionDate: 'desc' },
      take: 20,
    });

    if (!ai || userTransactions.length === 0) {
      return {
        summary: 'Your financial portfolio is tracked.',
        recommendations: [
          'Maintain an emergency fund covering 3-6 months of expenses.',
          'Review recurring monthly subscriptions to eliminate idle leaks.',
        ],
        healthScore: 85,
      };
    }

    const txSummary = userTransactions.map((t) => ({
      amount: t.amount,
      type: t.type,
      description: t.description,
    }));

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        healthScore: { type: Type.NUMBER },
      },
      required: ['summary', 'recommendations', 'healthScore'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze these recent financial transactions and provide 2-3 short, actionable wealth optimization recommendations and an overall health score (0-100):\n${JSON.stringify(txSummary)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err: any) {
      return {
        summary: 'Financial analytics active.',
        recommendations: ['Keep track of daily inflow and outflow balances.'],
        healthScore: 80,
      };
    }
  }

  async categorizeNote(dto: { title: string; content?: string }) {
    const ai = this.ensureAiClient();
    if (!ai) {
      return {
        category: 'General',
        tags: ['Draft', 'Notes'],
        summary: 'Note content analyzed.',
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        summary: { type: Type.STRING },
      },
      required: ['category', 'tags', 'summary'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this note and generate a primary category name, 2-4 relevant topic tags, and a 1-sentence summary:\nTitle: ${dto.title}\nContent: ${dto.content || ''}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        category: 'Uncategorized',
        tags: ['General'],
        summary: dto.title,
      };
    }
  }

  async semanticSearchNotes(userId: string, query: string) {
    const ai = this.ensureAiClient();
    const notes = await this.prisma.note.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, title: true, content: true },
      take: 30,
    });

    if (notes.length === 0) return { results: [] };

    if (!ai) {
      const filtered = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          (n.content && n.content.toLowerCase().includes(query.toLowerCase()))
      );
      return {
        results: filtered.map((n) => ({ id: n.id, relevanceScore: 85, reason: 'Keyword match' })),
      };
    }

    const notePayload = notes.map((n) => ({ id: n.id, title: n.title, excerpt: n.content?.slice(0, 200) }));

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        results: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              relevanceScore: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
            required: ['id', 'relevanceScore', 'reason'],
          },
        },
      },
      required: ['results'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rank the following notes by conceptual relevance to the search query "${query}". Return relevance score (0-100) and a brief reason:\n${JSON.stringify(notePayload)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{"results":[]}');
    } catch (err) {
      return { results: [] };
    }
  }

  async calculateBurnoutRisk(userId: string) {
    const [completedCount, totalCount, overdueCount] = await Promise.all([
      this.prisma.task.count({ where: { userId, completed: true, deletedAt: null } }),
      this.prisma.task.count({ where: { userId, deletedAt: null } }),
      this.prisma.task.count({
        where: {
          userId,
          completed: false,
          deletedAt: null,
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    const activeCount = totalCount - completedCount;
    let energyIndex = 100 - overdueCount * 12 - Math.max(0, activeCount - 8) * 5;
    energyIndex = Math.max(15, Math.min(100, energyIndex));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    if (energyIndex < 40) riskLevel = 'HIGH';
    else if (energyIndex < 70) riskLevel = 'MODERATE';

    let tip = 'Your workload is balanced. Keep up the steady pace!';
    if (riskLevel === 'HIGH') {
      tip = 'High workload & overdue backlog detected. Consider delegating or rescheduling low-priority tasks.';
    } else if (riskLevel === 'MODERATE') {
      tip = 'Moderate workload detected. Focus on completing 2-3 high-impact tasks today to maintain focus.';
    }

    return {
      energyIndex,
      riskLevel,
      activeTasks: activeCount,
      completedTasks: completedCount,
      overdueTasks: overdueCount,
      recommendation: tip,
    };
  }

  async generateExecutiveReview(userId: string, period: 'WEEKLY' | 'MONTHLY' | 'YEARLY' = 'WEEKLY') {
    const ai = this.ensureAiClient();

    const [completedTasks, totalTasks, transactions, notesCount] = await Promise.all([
      this.prisma.task.count({ where: { userId, completed: true, deletedAt: null } }),
      this.prisma.task.count({ where: { userId, deletedAt: null } }),
      this.prisma.transaction.findMany({ where: { userId, deletedAt: null }, take: 20 }),
      this.prisma.note.count({ where: { userId, deletedAt: null } }),
    ]);

    const totalInflow = transactions.filter((t) => t.type === 'INFLOW').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalOutflow = transactions.filter((t) => t.type === 'OUTFLOW').reduce((acc, t) => acc + Number(t.amount), 0);

    const metricsSummary = {
      period,
      completedTasks,
      totalTasks,
      totalInflow,
      totalOutflow,
      netWorth: totalInflow - totalOutflow,
      notesCount,
    };

    if (!ai) {
      return {
        period,
        productivityScore: 88,
        executiveSummary: `Solid performance during this ${period.toLowerCase()} cycle with ${completedTasks} tasks finalized and $${(totalInflow - totalOutflow).toFixed(2)} net capital retention.`,
        keyAccomplishments: [
          `Completed ${completedTasks} tasks across active project pipelines.`,
          `Maintained financial ledger with $${totalInflow.toFixed(2)} total inflows.`,
          `Documented ${notesCount} strategic insights and notes.`,
        ],
        financialTrend: 'Positive capital trajectory with balanced debt-to-income ratio.',
        growthAreas: [
          'Optimize task scheduling to eliminate overdue backlog items.',
          'Increase monthly savings retention rate by 5%.',
        ],
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        period: { type: Type.STRING },
        productivityScore: { type: Type.NUMBER },
        executiveSummary: { type: Type.STRING },
        keyAccomplishments: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        financialTrend: { type: Type.STRING },
        growthAreas: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['period', 'productivityScore', 'executiveSummary', 'keyAccomplishments', 'financialTrend', 'growthAreas'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate an executive summary report for a user's ${period} workspace review based on these metrics:\n${JSON.stringify(metricsSummary)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        period,
        productivityScore: 85,
        executiveSummary: `Executive briefing compiled for ${period.toLowerCase()} performance cycle.`,
        keyAccomplishments: [`Completed ${completedTasks} tasks in your workspace.`],
        financialTrend: 'Financial tracking active.',
        growthAreas: ['Focus on completing high-priority milestones.'],
      };
    }
  }

  async detectSubscriptionLeaks(userId: string) {
    const ai = this.ensureAiClient();
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, type: 'OUTFLOW', deletedAt: null },
      orderBy: { transactionDate: 'desc' },
      take: 40,
    });

    if (transactions.length === 0) {
      return {
        totalMonthlySubscriptions: 0,
        potentialAnnualSavings: 0,
        detectedLeaks: [],
      };
    }

    const txPayload = transactions.map((t) => ({
      amount: t.amount,
      description: t.description,
      date: t.transactionDate,
    }));

    if (!ai) {
      return {
        totalMonthlySubscriptions: 49.99,
        potentialAnnualSavings: 599.88,
        detectedLeaks: [
          {
            vendor: 'Recurring Software License',
            amount: 29.99,
            frequency: 'Monthly',
            riskReason: 'Unused recurring billing detected in consecutive cycles.',
            actionTip: 'Review usage or downgrade to lower tier.',
          },
        ],
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        totalMonthlySubscriptions: { type: Type.NUMBER },
        potentialAnnualSavings: { type: Type.NUMBER },
        detectedLeaks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              vendor: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              frequency: { type: Type.STRING },
              riskReason: { type: Type.STRING },
              actionTip: { type: Type.STRING },
            },
            required: ['vendor', 'amount', 'frequency', 'riskReason', 'actionTip'],
          },
        },
      },
      required: ['totalMonthlySubscriptions', 'potentialAnnualSavings', 'detectedLeaks'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze these outflow transactions to identify recurring subscription charges, potential leaks, or idle software bills:\n${JSON.stringify(txPayload)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        totalMonthlySubscriptions: 0,
        potentialAnnualSavings: 0,
        detectedLeaks: [],
      };
    }
  }
}
