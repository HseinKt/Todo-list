import { createContext, useEffect, useState } from "react";

export const TaskContext = createContext();

export function TaskProvider({children}) {

    const [tasks, setTasks] = useState(() => {
        const savedTasks = sessionStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });

    // Update sessionStorage whenever tasks state changes
    useEffect(() => {
        if (tasks.length > 0) {
            sessionStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }, [tasks]); 

    
    const addTask = (task) => {
        setTasks([...tasks, {text: task, completed: false}]);
    };
    
    const deleteTask = (index) => {
        const newTasks= [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
    };
        
    const toggleTask = (index) => {
        const newTasks= [...tasks];
        newTasks[index].completed =!newTasks[index].completed;
        setTasks(newTasks);
    };

    return (
        <TaskContext.Provider value={{tasks,addTask,deleteTask,toggleTask}}>
            {children}
        </TaskContext.Provider>
    )
}