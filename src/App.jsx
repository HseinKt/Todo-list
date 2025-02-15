import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Todo from "./pages/todo";
import NotFound from "./pages/Notfound";
import { useContext } from "react";
import { DarkModeContext } from "./hooks/DarkModeContext";
import DarkMode from "./components/DarkMode";

const App = () => {
    const {isDarkMode} = useContext(DarkModeContext)
    return ( 
        <>
            <div className={isDarkMode? "dark-mode": "light-mode"}>
                <DarkMode/>
                <Router>
                <div className="content">
                    <Routes>
                        <Route path="/" element={<Home/>}/> 
                        <Route path="/todo" element={<Todo/>} />
                        <Route path="*" element={<NotFound/>} />
                    </Routes>
                </div>
                </Router>
            </div>
        </>
     );
}
 
export default App;