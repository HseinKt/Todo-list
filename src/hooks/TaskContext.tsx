import { createContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "./supabaseClient";

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    created_at?: string;
    user_id?: string;
}

export interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    addTask: (text: string) => Promise<void>;
    deleteTask: (index: number) => Promise<void>;
    toggleTask: (index: number) => Promise<void>;
    editTask: (index: number, newText: string) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType>({
    tasks: [],
    loading: false,
    addTask: async () => {},
    deleteTask: async () => {},
    toggleTask: async () => {},
    editTask: async () => {}
});

// Check if credentials are set up and aren't placeholders
const isSupabaseConfigured = !!(
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL.includes("supabase.co")
);

interface TaskProviderProps {
    children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Initial load
    useEffect(() => {
        async function loadTasks() {
            setLoading(true);
            if (isSupabaseConfigured) {
                console.log("Supabase is configured. Fetching tasks from cloud database...");
                try {
                    const { data, error } = await supabase
                        .from('tasks')
                        .select('*')
                        .order('created_at', { ascending: true });
                    
                    if (error) {
                        console.error("Supabase fetch error, falling back to LocalStorage:", error.message);
                        loadLocalTasks();
                    } else if (data) {
                        setTasks(data);
                    }
                } catch (err) {
                    console.error("Supabase connection error, falling back to LocalStorage:", err);
                    loadLocalTasks();
                }
            } else {
                console.log("Supabase is not configured yet. Running in offline mode (LocalStorage).");
                loadLocalTasks();
            }
            setLoading(false);
        }

        function loadLocalTasks() {
            const savedTasks = localStorage.getItem('tasks');
            if (savedTasks) {
                try {
                    setTasks(JSON.parse(savedTasks));
                } catch (e) {
                    console.error("Failed to parse LocalStorage tasks:", e);
                    setTasks([]);
                }
            }
        }

        loadTasks();
    }, []);

    // Save to LocalStorage ONLY as a backup / when offline
    useEffect(() => {
        if (!isSupabaseConfigured) {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    const addTask = async (taskText: string) => {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('tasks')
                    .insert([{ text: taskText, completed: false }])
                    .select();
                
                if (error) {
                    throw error;
                }
                if (data && data.length > 0) {
                    setTasks((prev) => [...prev, data[0]]);
                }
            } catch (err) {
                console.error("Failed to add task to Supabase:", err);
            }
        } else {
            const newLocalTask: Task = {
                id: Math.random().toString(36).substring(2, 9),
                text: taskText,
                completed: false,
                created_at: new Date().toISOString()
            };
            setTasks((prev) => [...prev, newLocalTask]);
        }
    };
    
    const deleteTask = async (index: number) => {
        const taskToDelete = tasks[index];
        if (isSupabaseConfigured && taskToDelete.id) {
            try {
                const { error } = await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', taskToDelete.id);
                
                if (error) throw error;
                setTasks((prev) => prev.filter((_, i) => i !== index));
            } catch (err) {
                console.error("Failed to delete task from Supabase:", err);
            }
        } else {
            setTasks((prev) => prev.filter((_, i) => i !== index));
        }
    };
        
    const toggleTask = async (index: number) => {
        const taskToToggle = tasks[index];
        const newCompletedVal = !taskToToggle.completed;
        
        if (isSupabaseConfigured && taskToToggle.id) {
            try {
                const { error } = await supabase
                    .from('tasks')
                    .update({ completed: newCompletedVal })
                    .eq('id', taskToToggle.id);
                
                if (error) throw error;
                setTasks((prev) => {
                    const newTasks = [...prev];
                    newTasks[index] = { ...newTasks[index], completed: newCompletedVal };
                    return newTasks;
                });
            } catch (err) {
                console.error("Failed to toggle task in Supabase:", err);
            }
        } else {
            setTasks((prev) => {
                const newTasks = [...prev];
                newTasks[index] = { ...newTasks[index], completed: newCompletedVal };
                return newTasks;
            });
        }
    };

    const editTask = async (index: number, newText: string) => {
        const taskToEdit = tasks[index];
        
        if (isSupabaseConfigured && taskToEdit.id) {
            try {
                const { error } = await supabase
                    .from('tasks')
                    .update({ text: newText })
                    .eq('id', taskToEdit.id);
                
                if (error) throw error;
                setTasks((prev) => {
                    const newTasks = [...prev];
                    newTasks[index] = { ...newTasks[index], text: newText };
                    return newTasks;
                });
            } catch (err) {
                console.error("Failed to edit task in Supabase:", err);
            }
        } else {
            setTasks((prev) => {
                const newTasks = [...prev];
                newTasks[index] = { ...newTasks[index], text: newText };
                return newTasks;
            });
        }
    };
    
    return (
        <TaskContext.Provider value={{ tasks, loading, addTask, deleteTask, editTask, toggleTask }}>
            {children}
        </TaskContext.Provider>
    );
}