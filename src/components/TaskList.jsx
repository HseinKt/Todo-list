import React, { useState } from "react";

const TaskList = React.memo((props) => {
    const [editIndex, setEditIndex] = useState(null);
    const [newText, setNewText] = useState("");

    return ( 
        <div className="task-list">
            <h1>Task List</h1>
            <ul>
                {props.tasks.map((task,index)=> (
                    
                    <li key={index}>
                        {editIndex === index ? (
                            <form action="">
                                <input 
                                    type="text" 
                                    value={newText} 
                                    onChange={(e) => {setNewText(e.target.value)}}
                                    placeholder="Edit Task"
                                />
                                <div className="task-actions">
                                    <button className="save-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        if(newText === "") {
                                            return;
                                        };
                                        props.editTask(index, newText),
                                        setEditIndex(null),
                                        setNewText("")
                                    }}>
                                        Save
                                    </button>
                                    <button className="cancel-btn" onClick={() => {setNewText(""), setEditIndex(null)}}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ):
                        (
                            <div className="task-lists">
                                {/* We use stopPropagation() in event handling when we want to prevent an event from bubbling up the DOM tree, meaning it stops the event from being triggered on parent elements.*/}
                                <p>{task.text}</p>
                                <div className="task-actions">
                                    <button className="delete-btn" onClick={(e) => {e.stopPropagation() ;props.deleteTask(index)}}>
                                        ❌
                                    </button>
                                    <button className="edit-btn" onClick={() => setEditIndex(index)}>
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