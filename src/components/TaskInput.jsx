import { useState } from "react";

const TaskInput = (props) => {

    const [taskText, setTaskText] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();// Prevent page reload
        if(taskText === "") return;
        props.addTask(taskText);
        setTaskText("");
    }
    
    return ( 
        <>
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
        </>
     );
}
 
export default TaskInput;