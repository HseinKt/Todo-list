import React, { useState, FormEvent } from "react";

interface TaskInputProps {
    addTask: (text: string) => void;
}

const TaskInput = React.memo(({ addTask }: TaskInputProps) => {

    const [taskText, setTaskText] = useState("");

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();// Prevent page reload
        const trimmed = taskText.trim();
        if(trimmed === "") return;
        addTask(trimmed);
        setTaskText("");
    }
    
    return ( 
        <div className="task-input">
            <p>Add new task: </p>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    placeholder="Enter a new task..."
                />
                <button type="submit">ADD</button>
            </form>
        </div>
     );
});
 
export default TaskInput;