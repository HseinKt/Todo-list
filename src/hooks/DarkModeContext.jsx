import { createContext, useEffect, useState } from "react";

export const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {

    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");

    useEffect(() => {
        localStorage.setItem("dakMode", isDarkMode ? "true": "false");
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    
    return (
        <DarkModeContext.Provider value={{isDarkMode, toggleDarkMode}}>
            {children}
        </DarkModeContext.Provider>
    )
}