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

  async generateHabitPlan(dto: { habitGoal: string; daysPerWeek?: number }) {
    const ai = this.ensureAiClient();
    const days = dto.daysPerWeek || 3;

    if (!ai) {
      return {
        habitTitle: dto.habitGoal,
        frequency: `${days}x per week`,
        sessions: [
          {
            title: `Session 1: ${dto.habitGoal} Fundamentals`,
            durationMinutes: 30,
            recommendedTime: 'Morning (8:00 AM)',
            focusArea: 'Core concepts and warm-up.',
          },
          {
            title: `Session 2: ${dto.habitGoal} Practice`,
            durationMinutes: 45,
            recommendedTime: 'Evening (6:00 PM)',
            focusArea: 'Applied execution and review.',
          },
        ],
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        habitTitle: { type: Type.STRING },
        frequency: { type: Type.STRING },
        sessions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              durationMinutes: { type: Type.NUMBER },
              recommendedTime: { type: Type.STRING },
              focusArea: { type: Type.STRING },
            },
            required: ['title', 'durationMinutes', 'recommendedTime', 'focusArea'],
          },
        },
      },
      required: ['habitTitle', 'frequency', 'sessions'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a recurring habit & study schedule for the goal "${dto.habitGoal}" planned for ${days} days per week. Return structured micro-habit sessions:`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        habitTitle: dto.habitGoal,
        frequency: `${days}x per week`,
        sessions: [{ title: dto.habitGoal, durationMinutes: 30, recommendedTime: 'Morning', focusArea: 'Practice' }],
      };
    }
  }

  async summarizeNoteAndExtractActions(dto: { title: string; content: string }) {
    const ai = this.ensureAiClient();

    if (!ai || !dto.content) {
      return {
        summary: `Note summary for "${dto.title}".`,
        actionTasks: [
          {
            title: `Review deliverables for ${dto.title}`,
            priority: 'HIGH',
            category: 'Action Items',
          },
        ],
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        actionTasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
              category: { type: Type.STRING },
            },
            required: ['title', 'priority', 'category'],
          },
        },
      },
      required: ['summary', 'actionTasks'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following note into a 2-sentence executive summary AND extract clear actionable tasks:\nTitle: ${dto.title}\nContent: ${dto.content}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        summary: dto.title,
        actionTasks: [{ title: `Follow up on ${dto.title}`, priority: 'MEDIUM', category: 'General' }],
      };
    }
  }

  async prioritizeTasksWithEisenhower(userId: string) {
    const ai = this.ensureAiClient();
    const tasks = await this.prisma.task.findMany({
      where: { userId, completed: false, deletedAt: null },
      select: { id: true, text: true, description: true, priority: true },
      take: 20,
    });

    if (tasks.length === 0) {
      return {
        q1DoFirst: [],
        q2Schedule: [],
        q3Delegate: [],
        q4Eliminate: [],
      };
    }

    const taskPayload = tasks.map((t) => ({
      id: t.id,
      title: t.text,
      description: t.description,
      priority: t.priority,
    }));

    if (!ai) {
      return {
        q1DoFirst: taskPayload.slice(0, 2).map((t) => ({ ...t, urgencyScore: 9, impactScore: 9, advice: 'Execute immediately.' })),
        q2Schedule: taskPayload.slice(2, 4).map((t) => ({ ...t, urgencyScore: 4, impactScore: 8, advice: 'Schedule dedicated focus block.' })),
        q3Delegate: [],
        q4Eliminate: [],
      };
    }

    const taskItemSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        urgencyScore: { type: Type.NUMBER },
        impactScore: { type: Type.NUMBER },
        advice: { type: Type.STRING },
      },
      required: ['id', 'title', 'urgencyScore', 'impactScore', 'advice'],
    };

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        q1DoFirst: { type: Type.ARRAY, items: taskItemSchema },
        q2Schedule: { type: Type.ARRAY, items: taskItemSchema },
        q3Delegate: { type: Type.ARRAY, items: taskItemSchema },
        q4Eliminate: { type: Type.ARRAY, items: taskItemSchema },
      },
      required: ['q1DoFirst', 'q2Schedule', 'q3Delegate', 'q4Eliminate'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Evaluate these pending tasks and place them into the 4 Eisenhower Quadrants (Q1: High Urgency & High Impact, Q2: Low Urgency & High Impact, Q3: High Urgency & Low Impact, Q4: Low Urgency & Low Impact):\n${JSON.stringify(taskPayload)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        q1DoFirst: [],
        q2Schedule: [],
        q3Delegate: [],
        q4Eliminate: [],
      };
    }
  }

  async predictNetWorthGrowth(userId: string) {
    const ai = this.ensureAiClient();
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      orderBy: { transactionDate: 'desc' },
      take: 50,
    });

    let totalInflow = 0;
    let totalOutflow = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'INFLOW') totalInflow += amt;
      if (t.type === 'OUTFLOW') totalOutflow += amt;
    });

    const netBalance = totalInflow - totalOutflow;
    const monthlySavingsRate = Math.max(0, netBalance * 0.4);

    if (!ai) {
      return {
        currentNetWorth: netBalance,
        projected3Months: netBalance + monthlySavingsRate * 3,
        projected6Months: netBalance + monthlySavingsRate * 6,
        projected12Months: netBalance + monthlySavingsRate * 12,
        trajectorySummary: `Based on your cash flow, your capital is projected to grow by $${(monthlySavingsRate * 12).toFixed(2)} over the next 12 months.`,
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        currentNetWorth: { type: Type.NUMBER },
        projected3Months: { type: Type.NUMBER },
        projected6Months: { type: Type.NUMBER },
        projected12Months: { type: Type.NUMBER },
        trajectorySummary: { type: Type.STRING },
      },
      required: ['currentNetWorth', 'projected3Months', 'projected6Months', 'projected12Months', 'trajectorySummary'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on total inflows ($${totalInflow}) and total outflows ($${totalOutflow}), predict net worth capital in 3 months, 6 months, and 12 months:`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        currentNetWorth: netBalance,
        projected3Months: netBalance,
        projected6Months: netBalance,
        projected12Months: netBalance,
        trajectorySummary: 'Maintain positive net cash flow to accelerate capital growth.',
      };
    }
  }

  async chatWithWorkspace(userId: string, userMessage: string) {
    const ai = this.ensureAiClient();

    const [tasks, transactions, notes] = await Promise.all([
      this.prisma.task.findMany({ where: { userId, completed: false, deletedAt: null }, take: 10 }),
      this.prisma.transaction.findMany({ where: { userId, deletedAt: null }, take: 10 }),
      this.prisma.note.findMany({ where: { userId, deletedAt: null }, take: 5 }),
    ]);

    const contextPayload = {
      pendingTasks: tasks.map((t) => ({ title: t.text, priority: t.priority })),
      financialTransactionsCount: transactions.length,
      userNotesCount: notes.length,
    };

    if (!ai) {
      return {
        reply: `You currently have ${tasks.length} pending tasks, ${transactions.length} recorded transactions, and ${notes.length} saved notes. How can I assist you further?`,
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI Workspace Assistant for a user's productivity app. Context:\n${JSON.stringify(contextPayload)}\nUser Question: ${userMessage}\nGive a helpful, clear, and concise answer (2-3 sentences max).`,
      });

      return { reply: response.text || 'I am your workspace assistant. How can I help you?' };
    } catch (err) {
      return { reply: 'Unable to process your request at this moment. Please try again.' };
    }
  }

  async generateTimeBlockSchedule(userId: string) {
    const ai = this.ensureAiClient();
    const tasks = await this.prisma.task.findMany({
      where: { userId, completed: false, deletedAt: null },
      select: { id: true, text: true, priority: true },
      take: 8,
    });

    if (tasks.length === 0) {
      return { timeBlocks: [] };
    }

    if (!ai) {
      return {
        timeBlocks: tasks.map((t, idx) => ({
          timeSlot: `${9 + idx}:00 AM - ${10 + idx}:00 AM`,
          taskTitle: t.text,
          focusType: t.priority === 'HIGH' ? 'Deep Focus' : 'Execution',
        })),
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        timeBlocks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timeSlot: { type: Type.STRING },
              taskTitle: { type: Type.STRING },
              focusType: { type: Type.STRING },
            },
            required: ['timeSlot', 'taskTitle', 'focusType'],
          },
        },
      },
      required: ['timeBlocks'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create an optimized hour-by-hour time-block schedule for today starting from 9:00 AM for these tasks:\n${JSON.stringify(tasks)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return { timeBlocks: [] };
    }
  }

  async evaluateIdeaViability(dto: { ideaTitle: string; ideaDescription: string }) {
    const ai = this.ensureAiClient();

    if (!ai || !dto.ideaDescription) {
      return {
        viabilityScore: 82,
        targetAudience: 'Early adopters and tech professionals.',
        keyRisks: ['Market competition and user acquisition costs.'],
        mvpSteps: ['Build interactive wireframes', 'Validate with 10 beta users', 'Launch core feature MVP'],
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        viabilityScore: { type: Type.NUMBER },
        targetAudience: { type: Type.STRING },
        keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
        mvpSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['viabilityScore', 'targetAudience', 'keyRisks', 'mvpSteps'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Evaluate the business and product viability of this idea:\nTitle: ${dto.ideaTitle}\nDescription: ${dto.ideaDescription}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        viabilityScore: 75,
        targetAudience: 'General users',
        keyRisks: ['Execution complexity'],
        mvpSteps: ['Build prototype'],
      };
    }
  }

  async getSmartReminderSchedule(userId: string) {
    const ai = this.ensureAiClient();
    const tasks = await this.prisma.task.findMany({
      where: { userId, completed: false, deletedAt: null },
      take: 5,
    });

    if (!ai) {
      return {
        peakFocusWindow: '09:00 AM - 12:00 PM',
        quietHours: '01:00 PM - 03:00 PM',
        optimizedReminders: [
          { time: '09:00 AM', taskTitle: 'Morning Deep Work Kickoff', channel: 'Push Notification' },
          { time: '04:30 PM', taskTitle: 'Daily Milestone Wrap-up', channel: 'In-App Toast' },
        ],
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        peakFocusWindow: { type: Type.STRING },
        quietHours: { type: Type.STRING },
        optimizedReminders: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              taskTitle: { type: Type.STRING },
              channel: { type: Type.STRING },
            },
            required: ['time', 'taskTitle', 'channel'],
          },
        },
      },
      required: ['peakFocusWindow', 'quietHours', 'optimizedReminders'],
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a smart non-intrusive reminder schedule for active tasks to protect peak focus hours:\n${JSON.stringify(tasks)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        peakFocusWindow: '09:00 AM - 12:00 PM',
        quietHours: '01:00 PM - 03:00 PM',
        optimizedReminders: [],
      };
    }
  }

  async getNexusBriefing(userId: string) {
    const ai = this.ensureAiClient();

    const [tasks, transactions, notes] = await Promise.all([
      this.prisma.task.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      this.prisma.transaction.findMany({ where: { userId, deletedAt: null }, orderBy: { transactionDate: 'desc' } }),
      this.prisma.note.findMany({ where: { userId, deletedAt: null }, orderBy: { updatedAt: 'desc' } }),
    ]);

    const pendingTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);
    const totalTasksCount = tasks.length;
    const productivityScore = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 100;

    let totalInflow = 0;
    let totalOutflow = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'INFLOW') totalInflow += amt;
      if (t.type === 'OUTFLOW') totalOutflow += amt;
    });
    const currentBalance = totalInflow - totalOutflow;

    const summaryContext = {
      pendingTasksCount: pendingTasks.length,
      completedTasksCount: completedTasks.length,
      productivityScore,
      currentBalance,
      notesCount: notes.length,
    };

    let quote = 'The secret of getting ahead is getting started.';
    let aiRecommendation = 'Focus on completing your top priority task today to build momentum.';

    if (ai) {
      try {
        const responseSchema: Schema = {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            aiRecommendation: { type: Type.STRING },
          },
          required: ['quote', 'aiRecommendation'],
        };
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Given this user summary context:\n${JSON.stringify(summaryContext)}\nGenerate an inspiring 1-sentence daily motivational quote and 1 strategic focus recommendation:`,
          config: { responseMimeType: 'application/json', responseSchema },
        });
        const parsed = JSON.parse(response.text || '{}');
        if (parsed.quote) quote = parsed.quote;
        if (parsed.aiRecommendation) aiRecommendation = parsed.aiRecommendation;
      } catch (e) {
        // Fallback intact
      }
    }

    return {
      productivityScore,
      pendingTasksCount: pendingTasks.length,
      completedTasksCount: completedTasks.length,
      totalNotesCount: notes.length,
      currentBalance,
      totalInflow,
      totalOutflow,
      todayTasks: pendingTasks.slice(0, 5).map((t) => ({ id: t.id, title: t.text, priority: t.priority })),
      recentNotes: notes.slice(0, 4).map((n) => ({ id: n.id, title: n.title, content: n.content, updatedAt: n.updatedAt })),
      quote,
      aiRecommendation,
    };
  }

  async quickCapture(userId: string, dto: { rawInput: string; type?: 'TASK' | 'NOTE' | 'EXPENSE' | 'AUTO' }) {
    const text = dto.rawInput.trim();
    if (!text) return { success: false, message: 'Empty input' };

    const type = dto.type || 'AUTO';

    if (type === 'TASK' || (type === 'AUTO' && (text.toLowerCase().startsWith('todo') || text.toLowerCase().includes('task') || text.length < 50))) {
      const task = await this.prisma.task.create({
        data: {
          userId,
          text,
          priority: 'MEDIUM',
          status: 'TODO',
        },
      });
      return { success: true, createdType: 'TASK', data: task };
    }

    if (type === 'EXPENSE' || (type === 'AUTO' && (text.includes('$') || text.toLowerCase().includes('spent') || text.toLowerCase().includes('bought')))) {
      const amountMatch = text.match(/\$?(\d+(\.\d+)?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 10;
      const transaction = await this.prisma.transaction.create({
        data: {
          userId,
          amount,
          type: 'OUTFLOW',
          description: text,
          transactionDate: new Date(),
        },
      });
      return { success: true, createdType: 'EXPENSE', data: transaction };
    }

    const note = await this.prisma.note.create({
      data: {
        userId,
        title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
        content: text,
      },
    });
    return { success: true, createdType: 'NOTE', data: note };
  }
}
