import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned?: boolean;
  isArchived?: boolean;
  updatedAt: string;
}

const NOTES_QUERY_KEY = ['notes'];

export const useNotes = () => {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading, error } = useQuery<Note[]>({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get('/notes');
      return data.data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes for instant page navigation
  });

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: Omit<Note, 'id' | 'updatedAt'>) => {
      const { data } = await api.post('/notes', newNote);
      return data.data;
    },
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);

      const optimisticNote: Note = {
        ...newNote,
        id: `optimistic-${Date.now()}`,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (old = []) => [
        optimisticNote,
        ...old,
      ]);

      return { previousNotes };
    },
    onError: (_err, _newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data } = await api.patch(`/notes/${id}`, updates);
      return data.data;
    },
    onMutate: async (updatedNote) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);

      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (old = []) =>
        old.map((n) => (n.id === updatedNote.id ? { ...n, ...updatedNote } : n))
      );

      return { previousNotes };
    },
    onError: (_err, _updatedNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);

      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (old = []) =>
        old.filter((n) => n.id !== id)
      );

      return { previousNotes };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });

  return {
    notes,
    isLoading,
    error,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
  };
};
