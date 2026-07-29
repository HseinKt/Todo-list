import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/Notfound";
import { useContext } from "react";
import { DarkModeContext } from "./hooks/DarkModeContext";
import DarkMode from "./components/DarkMode";
import Todo from "./pages/Todo";
import Footer from "./components/Footer";

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
                <Footer />
            </div>
        </>
     );
}
 
export default App;