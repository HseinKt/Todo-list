import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface Transaction {
  id: string;
  amount: number;
  type: 'INFLOW' | 'OUTFLOW';
  category: string;
  description?: string;
  date: string;
}

const LEDGER_QUERY_KEY = ['transactions'];

const mapDbTxToTransaction = (dbTx: any): Transaction => ({
  id: dbTx.id,
  amount: parseFloat(dbTx.amount) || 0,
  type: dbTx.type || 'OUTFLOW',
  category: dbTx.category?.name || 'General',
  description: dbTx.description || dbTx.category?.name || 'Transaction',
  date: dbTx.transactionDate ? new Date(dbTx.transactionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});

export const useLedger = () => {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: LEDGER_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get('/budgets/transactions');
      const items = data.data?.data || [];
      return items.map(mapDbTxToTransaction);
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes for instant page navigation
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (newTx: Omit<Transaction, 'id' | 'date'>) => {
      const payload = {
        amount: newTx.amount,
        type: newTx.type,
        description: newTx.description || newTx.category || 'General Transaction',
      };
      const { data } = await api.post('/budgets/transactions', payload);
      return mapDbTxToTransaction(data.data.transaction || data.data);
    },
    onMutate: async (newTx) => {
      await queryClient.cancelQueries({ queryKey: LEDGER_QUERY_KEY });
      const previousTxs = queryClient.getQueryData<Transaction[]>(LEDGER_QUERY_KEY);

      const optimisticTx: Transaction = {
        ...newTx,
        id: `optimistic-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
      };

      queryClient.setQueryData<Transaction[]>(LEDGER_QUERY_KEY, (old = []) => [
        optimisticTx,
        ...old,
      ]);

      return { previousTxs };
    },
    onError: (_err, _newTx, context) => {
      if (context?.previousTxs) {
        queryClient.setQueryData(LEDGER_QUERY_KEY, context.previousTxs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY });
    },
  });

  return {
    transactions,
    isLoading,
    error,
    createTransaction: createTransactionMutation.mutate,
  };
};
