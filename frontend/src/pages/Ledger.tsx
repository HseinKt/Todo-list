import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Plus } from 'lucide-react';

export const Ledger: React.FC = () => {
  const [transactions, setTransactions] = useState([
    { id: '1', description: 'Supabase Freelance Payment', amount: 850.0, type: 'INFLOW', date: 'July 30' },
    { id: '2', description: 'SaaS Hosting Bill', amount: 15.0, type: 'OUTFLOW', date: 'July 29' },
    { id: '3', description: 'Grocery shopping', amount: 62.40, type: 'OUTFLOW', date: 'July 28' },
  ]);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INFLOW' | 'OUTFLOW'>('OUTFLOW');

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim()) return;
    setTransactions([
      {
        id: Date.now().toString(),
        description,
        amount: parseFloat(amount),
        type,
        date: 'Today',
      },
      ...transactions,
    ]);
    setDescription('');
    setAmount('');
  };

  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === 'INFLOW') {
        acc.inflow += t.amount;
      } else {
        acc.outflow += t.amount;
      }
      return acc;
    },
    { inflow: 0, outflow: 0 }
  );

  const netBalance = totals.inflow - totals.outflow;

  return (
    <div className="flex-1 bg-white dark:bg-neutral-950 p-8 overflow-y-auto text-neutral-800 dark:text-neutral-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Ledger Wealth</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Log transactions, configure budgets, and track assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">Net Balance</p>
            <h2 className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              ${netBalance.toFixed(2)}
            </h2>
          </div>
          <div className="p-3 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-full">
            <Wallet size={20} />
          </div>
        </div>

        <div className="p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">Total Inflows</p>
            <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              +${totals.inflow.toFixed(2)}
            </h2>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-full">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">Total Outflows</p>
            <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">
              -${totals.outflow.toFixed(2)}
            </h2>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400 rounded-full">
            <ArrowDownRight size={20} />
          </div>
        </div>
      </div>

      <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <input
          type="text"
          placeholder="Transaction details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="sm:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg text-sm focus:outline-violet-500 text-neutral-800 dark:text-white"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg text-sm focus:outline-violet-500 text-neutral-800 dark:text-white"
        />
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'INFLOW' | 'OUTFLOW')}
            className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 focus:outline-none"
          >
            <option value="OUTFLOW">Outflow</option>
            <option value="INFLOW">Inflow</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center bg-violet-600 hover:bg-violet-750 text-white p-2.5 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Plus size={18} />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="flex justify-between items-center p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.description}</p>
              <p className="text-[10px] text-neutral-500">{t.date}</p>
            </div>
            <div className={`text-sm font-bold ${t.type === 'INFLOW' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {t.type === 'INFLOW' ? '+' : '-'}${t.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
