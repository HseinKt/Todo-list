import React, { useState, MouseEvent } from "react";
import { Task } from "../hooks/TaskContext";

interface TaskListProps {
    tasks: Task[];
    editTask: (index: number, newText: string) => void;
    deleteTask: (index: number) => void;
    toggleTask: (index: number) => void;
}

const TaskList = React.memo(({ tasks, editTask, deleteTask, toggleTask }: TaskListProps) => {
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [newText, setNewText] = useState("");

    return ( 
        <div className="task-list">
            <h1>Task List</h1>
            <ul>
                {tasks.map((task, index) => (
                    
                    <li key={index}>
                        {editIndex === index ? (
                            <form action="" onSubmit={(e) => e.preventDefault()}>
                                <input 
                                    type="text" 
                                    value={newText} 
                                    onChange={(e) => {setNewText(e.target.value)}}
                                    placeholder="Edit Task"
                                />
                                <div className="task-actions">
                                    <button 
                                        className="save-btn" 
                                        type="button"
                                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                            e.stopPropagation();
                                            const trimmed = newText.trim();
                                            if(trimmed === "") {
                                                return;
                                            };
                                            editTask(index, trimmed);
                                            setEditIndex(null);
                                            setNewText("");
                                        }}>
                                        Save
                                    </button>
                                    <button 
                                        className="cancel-btn" 
                                        type="button"
                                        onClick={() => {setNewText(""), setEditIndex(null)}}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ):
                        (
                            <div className="task-lists">
                                <input 
                                    type="checkbox" 
                                    checked={task.completed}
                                    onChange={(e) => { e.stopPropagation(); toggleTask(index); }}
                                    className="checkbox-tasks"
                                />
                                <p style={{ textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.6 : 1 }}>
                                    {task.text}
                                </p>
                                <div className="task-actions">
                                    <button className="delete-btn" onClick={(e: MouseEvent<HTMLButtonElement>) => {e.stopPropagation() ;deleteTask(index)}}>
                                        ❌
                                    </button>
                                    <button className="edit-btn" onClick={() => {setEditIndex(index); setNewText(task.text);}}>
                                        ✏️
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
     );
});
 
export default TaskList;