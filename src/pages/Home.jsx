import { useContext } from "react";
import { Link } from "react-router-dom";
import { TaskContext } from "../hooks/TaskContext";
import DarkMode from "../components/DarkMode";

const Home = () => {
    const { tasks, toggleTask } = useContext(TaskContext);

    return ( 
        <>
            <div>
                {/* landing Page */}
                <h1>Welcome to the Task Manager</h1>

                {/* Navigation links */}
                <Link to="/todo"> 
                    <button>Manage your tasks</button>
                </Link>
            </div>

            <div>
                <h3>The Power of Planning Your Day</h3>
                <p>A well-structured plan is the key to a productive and stress-free day. Planning helps you stay organized, prioritize important tasks, and make the most of your time. By setting clear goals, you can focus on what truly matters, avoid distractions, and track your progress. It also reduces last-minute stress and boosts efficiency, allowing you to achieve a better work-life balance. Whether it's a simple to-do list or a detailed schedule, having a plan gives you control over your day and sets you up for success. Start planning today and take charge of your productivity! 🚀</p>
            </div>

            <div>
                {/* list of your task day */}
                <h3>Your Task List</h3>
                <ul>
                    {tasks.map((task, index) => (
                        <li key={index} style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                            <input 
                                type="checkbox" 
                                checked={task.completed}
                                onChange={ (e) => {e.stopPropagation; toggleTask(index)}}
                            />
                            {task.text} 
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                {/* dark mode */}
                <DarkMode/>
            </div>
        </>
     );
}
 
export default Home;