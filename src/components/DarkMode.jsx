import { useContext } from "react";
import { DarkModeContext } from "../hooks/DarkModeContext";

const DarkMode = () => {
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

    return ( 
        <>
            <button onClick={toggleDarkMode}>{isDarkMode? 'Light Mode' : 'Dark Mode'}</button>
        </>
     );
}
 
export default DarkMode;