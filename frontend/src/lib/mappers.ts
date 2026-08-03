export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'INFLOW' | 'OUTFLOW';
  category: string;
  description?: string;
  date: string;
}

export const mapDbTaskToTask = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.text || dbTask.title || 'Untitled Task',
  description: dbTask.description || '',
  status: dbTask.status || (dbTask.completed ? 'COMPLETED' : 'TODO'),
  priority: (dbTask.priority as any) || 'MEDIUM',
  category: dbTask.category?.name || dbTask.category || 'General',
});

export const mapDbTxToTransaction = (dbTx: any): Transaction => ({
  id: dbTx.id,
  amount: parseFloat(dbTx.amount) || 0,
  type: dbTx.type || 'OUTFLOW',
  category: dbTx.category?.name || 'General',
  description: dbTx.description || dbTx.category?.name || 'Transaction',
  date: dbTx.transactionDate ? new Date(dbTx.transactionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});
