import { useState } from "react";
import { Link } from "react-router-dom";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";

const Todo = () => {
    const [tasks, setTasks] = useState([]);

    const addTask = (task) => {
        setTasks([...tasks, task]);
    }

    const deleteTask = (index) => {
        const newTasks= [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
    }

    return ( 
        <div className="to-do-list">
            <h1>To-Do List </h1>
            {/* <p>here will be able to add and remove the lists</p> */}
            <TaskInput addTask={addTask}/>
            <TaskList tasks={tasks} deleteTask={deleteTask}/>

            {console.log(tasks)}
            <Link to="/" >
                back to home
            </Link>

        </div>
     );
}
 
export default Todo;