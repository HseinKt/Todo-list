import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, TrendingUp, TrendingDown, DollarSign, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useLedger } from '../hooks/useLedger';
import { api } from '../lib/axios';

const transactionSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  type: z.enum(['INFLOW', 'OUTFLOW']),
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export const Ledger: React.FC = () => {
  const { transactions, isLoading, error, createTransaction } = useLedger();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'INFLOW' | 'OUTFLOW'>('OUTFLOW');

  const { data: aiAdvice } = useQuery({
    queryKey: ['ai-finance-advice'],
    queryFn: async () => {
      const { data } = await api.get('/ai/finance/advice');
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: leakData } = useQuery({
    queryKey: ['ai-finance-leaks'],
    queryFn: async () => {
      const { data } = await api.get('/ai/finance/leaks');
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      type: 'OUTFLOW',
      category: '',
      description: '',
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    createTransaction({
      ...data,
      amount: parseFloat(data.amount),
    });
    reset();
    setSelectedType('OUTFLOW');
    setIsOpen(false);
  };

  const getInflows = () =>
    transactions
      .filter((t) => t.type === 'INFLOW')
      .reduce((sum, t) => sum + t.amount, 0);

  const getOutflows = () =>
    transactions
      .filter((t) => t.type === 'OUTFLOW')
      .reduce((sum, t) => sum + t.amount, 0);

  const getNetWorth = () => getInflows() - getOutflows();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2 text-sm font-medium">
        <AlertCircle size={24} />
        <span>Failed to load financial records from the database.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ledger Wealth</h1>
          <p className="text-xs text-muted-foreground">
            Track double-precision balance sheets, inflows, and outflows.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 self-start">
          <Plus size={14} />
          <span>Log Transaction</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect glass className="text-left space-y-2.5">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Worth</span>
            <DollarSign size={16} className="text-accent" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isLoading ? '$...' : `$${getNetWorth().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </h2>
          <p className="text-[10px] text-muted-foreground">Current calculated capital balance</p>
        </Card>

        <Card hoverEffect glass className="text-left space-y-2.5">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inflow</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-emerald-500">
            {isLoading ? '$...' : `$${getInflows().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </h2>
          <p className="text-[10px] text-muted-foreground">Active positive revenue channels</p>
        </Card>

        <Card hoverEffect glass className="text-left space-y-2.5">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Outflow</span>
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-red-500">
            {isLoading ? '$...' : `$${getOutflows().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </h2>
          <p className="text-[10px] text-muted-foreground">Categorized wealth deductions</p>
        </Card>
      </div>

      {aiAdvice && (
        <Card glass className="p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-primary/20 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">AI Financial Intelligence Advisor</h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
              <span>Health Score: {aiAdvice.healthScore}/100</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{aiAdvice.summary}</p>
          {aiAdvice.recommendations?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {aiAdvice.recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 bg-card/60 border border-border/40 p-2.5 rounded-lg text-xs">
                  <span className="text-amber-400 font-bold">•</span>
                  <span className="text-foreground/90">{rec}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {leakData && leakData.detectedLeaks?.length > 0 && (
        <Card glass className="p-4 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border-red-500/20 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-400" />
              <h3 className="text-sm font-bold text-foreground">AI Subscription Leak & Recurring Bill Detector</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Est. Annual Savings:</span>
              <span className="font-bold text-emerald-500">${leakData.potentialAnnualSavings}/yr</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {leakData.detectedLeaks.map((leak: any, idx: number) => (
              <div key={idx} className="p-3 bg-card/70 border border-border/50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">{leak.vendor}</span>
                  <span className="font-bold text-red-400">${leak.amount}/mo</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{leak.riskReason}</p>
                <p className="text-[10px] text-amber-400 font-semibold">💡 Action Tip: {leak.actionTip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="text-left space-y-4">
        <h3 className="text-sm font-semibold text-foreground tracking-tight border-b border-border/40 pb-2.5">
          Transactions History
        </h3>

        <div className="divide-y divide-border/40 overflow-hidden">
          {isLoading ? (
            [...Array(4)].map((_, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3 w-1/2">
                  <div className="w-8 h-8 bg-secondary rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-secondary rounded w-16" />
              </div>
            ))
          ) : (
            <AnimatePresence>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.type === 'INFLOW'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {tx.type === 'INFLOW' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">{tx.description || tx.category}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Tag size={10} />
                            {tx.category}
                          </span>
                          <span>•</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <span
                        className={`text-xs font-bold font-mono ${
                          tx.type === 'INFLOW' ? 'text-emerald-500' : 'text-foreground'
                        }`}
                      >
                        {tx.type === 'INFLOW' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No ledger transactions logged yet
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Log New Transaction">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedType('INFLOW');
                  setValue('type', 'INFLOW');
                }}
                className={`py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  selectedType === 'INFLOW'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Inflow
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedType('OUTFLOW');
                  setValue('type', 'OUTFLOW');
                }}
                className={`py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  selectedType === 'OUTFLOW'
                    ? 'bg-red-500/10 border-red-500 text-red-500'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Outflow
              </button>
            </div>
          </div>

          <Input
            label="Category"
            placeholder="e.g. Salary, Rent, Groceries"
            error={errors.category?.message}
            {...register('category')}
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Spent on grocery run"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex justify-end gap-2.5 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Log Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
