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
}
