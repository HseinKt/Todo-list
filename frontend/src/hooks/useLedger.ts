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

export const useLedger = () => {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: LEDGER_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get('/budgets/transactions');
      return data.data || [];
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (newTx: Omit<Transaction, 'id' | 'date'>) => {
      const { data } = await api.post('/budgets/transactions', newTx);
      return data.data;
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
