import { useContext } from "react";
import { Link } from "react-router-dom";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import { TaskContext } from "../hooks/TaskContext";

const Todo = () => {
    const { tasks, addTask, deleteTask, editTask } = useContext(TaskContext);

    return ( 
        <div className="to-do-list">
            <div className="to-do-header">
                <h1>To-Do List </h1>
                <Link to="/" className="link">
                    back to home
                </Link>
            </div>
            {/* <div className="task-input"> */}
                <TaskInput addTask={addTask}/>
            {/* </div> */}
            
            {/* <div className="task-list"> */}
                <TaskList tasks={tasks} editTask={editTask} deleteTask={deleteTask}/>
            {/* </div>             */}
        </div>
     );
}
 
export default Todo;