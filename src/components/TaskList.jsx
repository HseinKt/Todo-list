import React from "react";

const TaskList = React.memo((props) => {
    return ( 
        <>
            <h1>Task List</h1>
            <ul>
                {props.tasks.map((task,index)=> (
                    <li key={index}>
                        <input 
                            type="checkbox" 
                            checked={task.completed}
                            onChange={ (e) => {e.stopPropagation; props.toggleTask(index)}}
                        />
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