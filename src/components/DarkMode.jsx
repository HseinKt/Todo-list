import { useContext } from "react";
import { DarkModeContext } from "../hooks/DarkModeContext";
import { FaMoon, FaSun } from "react-icons/fa";

const DarkMode = () => {
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

    return ( 
        <>
            <button className="dark-mode-toggle" onClick={toggleDarkMode}>
                {/* {isDarkMode? 'Light Mode' : 'Dark Mode'} */}
                {isDarkMode? <FaSun/>: <FaMoon/>}
            </button>
        </>
     );
}
 
export default DarkMode;