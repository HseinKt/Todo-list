import { useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { TaskContext } from "../hooks/TaskContext";
import { motion, useInView } from "framer-motion";

const Home = () => {
    const { tasks, toggleTask } = useContext(TaskContext);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const listVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
    };
      
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return ( 
        <>
        <div className="home-main">
            <div className="home-tasks">
                <motion.h1
                    initial={{ x: -200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1}}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="moving-text"
                >
                    Welcome to the Task Manager
                </motion.h1>
                {/* Navigation links */}
                <Link className="home-todo" to="/todo"> 
                    <button className="btn">Manage your tasks</button>
                </Link>
            </div>

            <div className="home-info">
                <h3>The Power of Planning Your Day</h3>
                
                {/* Animated paragraph using framer-motion */}
                <motion.p
                    initial={{ opacity: 0, y: 50 }} // Start hidden and move up
                    whileInView={{ opacity: 1, y: 0 }} // Animate when in view
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="animated-paragraph"
                >
                    A well-structured plan is the key to a productive and stress-free day. Planning helps you stay organized, prioritize important tasks, and make the most of your time. By setting clear goals, you can focus on what truly matters, avoid distractions, and track your progress. It also reduces last-minute stress and boosts efficiency, allowing you to achieve a better work-life balance. Whether it's a simple to-do list or a detailed schedule, having a plan gives you control over your day and sets you up for success. Start planning today and take charge of your productivity! 🚀
                </motion.p>
            </div>

            <div className="home-list">
                {/* list of tasks day */}
                <h3>Your Task List</h3>
                <motion.ul
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={listVariants}
                >
                    {tasks.map((task, index) => (
                        <motion.li 
                            key={index} 
                            style={{ textDecoration: task.completed ? "line-through" : "none" }}
                            variants={itemVariants}
                        >
                            <input 
                                type="checkbox" 
                                checked={task.completed}
                                onChange={ (e) => {e.stopPropagation; toggleTask(index)}}
                                className="checkbox-tasks"
                            />
                            {task.text} 
                        </motion.li>
                    ))}
                </motion.ul>
            </div>
        </div>
        </>
     );
}
 
export default Home;