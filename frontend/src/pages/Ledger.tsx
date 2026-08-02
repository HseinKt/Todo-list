import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, DollarSign, Tag, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

interface Transaction {
  id: string;
  amount: number;
  type: 'INFLOW' | 'OUTFLOW';
  category: string;
  description?: string;
  date: string;
}

export const Ledger: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', amount: 5000, type: 'INFLOW', category: 'Salary', description: 'Monthly primary paycheck', date: '2026-08-01' },
    { id: '2', amount: 120, type: 'OUTFLOW', category: 'Food', description: 'Grocery shopping', date: '2026-08-02' },
    { id: '3', amount: 80, type: 'OUTFLOW', category: 'Transport', description: 'Fuel refill', date: '2026-08-03' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INFLOW' | 'OUTFLOW'>('OUTFLOW');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !category.trim()) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      amount: numAmount,
      type,
      category,
      description: description || undefined,
      date: new Date().toISOString().split('T')[0],
    };

    setTransactions((prev) => [newTx, ...prev]);
    setAmount('');
    setCategory('');
    setDescription('');
    setIsOpen(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6">
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
            ${getNetWorth().toLocaleString()}
          </h2>
          <p className="text-[10px] text-muted-foreground">Current calculated capital balance</p>
        </Card>

        <Card hoverEffect glass className="text-left space-y-2.5">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inflow</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-emerald-500">
            ${getInflows().toLocaleString()}
          </h2>
          <p className="text-[10px] text-muted-foreground">Active positive revenue channels</p>
        </Card>

        <Card hoverEffect glass className="text-left space-y-2.5">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Outflow</span>
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-red-500">
            ${getOutflows().toLocaleString()}
          </h2>
          <p className="text-[10px] text-muted-foreground">Categorized wealth deductions</p>
        </Card>
      </div>

      <Card className="text-left space-y-4">
        <h3 className="text-sm font-semibold text-foreground tracking-tight border-b border-border/40 pb-2.5">
          Transactions History
        </h3>

        <div className="divide-y divide-border/40 overflow-hidden">
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
                      {tx.type === 'INFLOW' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition p-0.5 rounded cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No ledger transactions logged yet
              </div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Log New Transaction">
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('INFLOW')}
                className={`py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  type === 'INFLOW'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Inflow
              </button>
              <button
                type="button"
                onClick={() => setType('OUTFLOW')}
                className={`py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  type === 'OUTFLOW'
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Spent on grocery run"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
