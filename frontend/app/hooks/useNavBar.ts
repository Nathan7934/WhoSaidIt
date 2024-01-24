import { useContext } from "react";
import NavBarContext from "../utilities/NavBarContext";

// This hook is meant to simplify using the NavBarContext in components
// Instead of importing both useContext and NavBarContext, simply import this hook

const useNavBar = () => {
    return useContext(NavBarContext);
}

export default useNavBar;