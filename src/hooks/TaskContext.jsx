import { createContext, useCallback, useState } from "react";

export const TaskContext = createContext();

export function TaskProvider({children}) {

    const [tasks, setTasks] = useState([]);
    
    const addTask = useCallback((task) => {
        setTasks([...tasks, {text: task, completed: false}]);
    },[]);
    
    const deleteTask = useCallback((index) => {
        const newTasks= [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
    },[]);
        
    const toggleTask = useCallback((index) => {
        const newTasks= [...tasks];
        newTasks[index].completed =!newTasks[index].completed;
        setTasks(newTasks);
    },[]);

    return (
        <TaskContext.Provider value={{tasks,addTask,deleteTask,toggleTask}}>
            {children}
        </TaskContext.Provider>
    )
}