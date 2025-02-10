import React from "react";

const TaskList = React.memo((props) => {
    return ( 
        <>
            <h1>Task List</h1>
            <ul>
                {props.tasks.map((task,index)=> (
                    <li key={index}>
                        {/* We use stopPropagation() in event handling when we want to prevent an event from bubbling up the DOM tree, meaning it stops the event from being triggered on parent elements.*/}
                        {task.text}
                        <button onClick={(e) => {e.stopPropagation() ;props.deleteTask(index)}}>
                            ❌
                        </button>
                    </li>
                ))}
            </ul>
        </>
     );
});
 
export default TaskList;