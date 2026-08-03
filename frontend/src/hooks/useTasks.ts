import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { type Task, mapDbTaskToTask } from '../lib/mappers';

export type { Task };

const TASKS_QUERY_KEY = ['tasks'];

export const useTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: TASKS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get('/tasks');
      const items = data.data?.data || [];
      return items.map(mapDbTaskToTask);
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes for instant page navigation
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id'>) => {
      const payload = {
        text: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
      };
      const { data } = await api.post('/tasks', payload);
      return mapDbTaskToTask(data.data);
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      const optimisticTask: Task = {
        ...newTask,
        id: `optimistic-${Date.now()}`,
      };

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => [
        ...old,
        optimisticTask,
      ]);

      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status, title, ...updates }: Partial<Task> & { id: string }) => {
      const payload: any = {};
      if (title) payload.text = title;
      if (status !== undefined) {
        payload.status = status;
        payload.completed = status === 'COMPLETED';
      }
      if (updates.description) payload.description = updates.description;
      if (updates.priority) payload.priority = updates.priority;

      const { data } = await api.patch(`/tasks/${id}`, payload);
      return mapDbTaskToTask(data.data);
    },
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) =>
        old.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );

      return { previousTasks };
    },
    onError: (_err, _updatedTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) =>
        old.filter((t) => t.id !== id)
      );

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
  };
};
