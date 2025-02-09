import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/home";
import Todo from "./pages/todo";
import NotFound from "./pages/Notfound";

const App = () => {
    return ( 
        <>
            <Router>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home/>}/> 
                    <Route path="/todo" element={<Todo/>} />
                    <Route path="*" element={<NotFound/>} />
                </Routes>
            </div>
            </Router>
        </>
     );
}
 
export default App;