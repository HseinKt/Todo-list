import { Link } from "react-router-dom";

const Home = () => {
    return ( 
        <>
            <div>
                {/* landing Page */}
                <h1>Welcome to the Task Manager</h1>

                {/* Navigation links */}
                <Link to="/todo"> 
                    <button>Go to to-do</button>
                </Link>
            </div>

            <div>
                the important thing about making a plan to your day
            </div>

            <div>
                list of your task day
            </div>
        </>
     );
}
 
export default Home;