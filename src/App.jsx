import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/home";
import Todo from "./pages/todo";
import NotFound from "./pages/Notfound";
import { TaskProvider } from "./hooks/TaskContext";

const App = () => {
    return ( 
        <>
        <TaskProvider>
            <Router>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home/>}/> 
                    <Route path="/todo" element={<Todo/>} />
                    <Route path="*" element={<NotFound/>} />
                </Routes>
            </div>
            </Router>
        </TaskProvider>
        </>
     );
}
 
export default App;