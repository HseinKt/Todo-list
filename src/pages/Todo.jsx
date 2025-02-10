import { useCallback, useContext, useState } from "react";
import { Link } from "react-router-dom";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import { TaskContext } from "../hooks/TaskContext";

const Todo = () => {
    const { tasks, addTask, deleteTask, toggleTask } = useContext(TaskContext);

    return ( 
        <div className="to-do-list">
            <h1>To-Do List </h1>
            {/* <p>here will be able to add and remove the lists</p> */}
            <TaskInput addTask={addTask}/>
            <TaskList tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask}/>

            {console.log(tasks.text)}
            <Link to="/" >
                back to home
            </Link>

        </div>
     );
}
 
export default Todo;