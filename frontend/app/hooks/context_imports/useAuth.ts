import { useContext } from "react";
import AuthContext from "../../utilities/AuthContext";

// This hook is meant to simplify using the AuthContext in components
// Instead of importing both useContext and AuthContext, simply import this hook

// This hook is also used to retrieve the authenticated user's id.
// Example: const { userId } = useAuth();

const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;