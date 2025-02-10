import { DarkModeProvider } from "./DarkModeContext";
import { TaskProvider } from "./TaskContext";

const Providers = ({children}) => {
    return ( 
        <DarkModeProvider>
            <TaskProvider>
                {children}
            </TaskProvider>
        </DarkModeProvider>
     );
}
 
export default Providers;