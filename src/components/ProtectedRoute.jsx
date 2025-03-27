import { Navigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { globalState } from "../jotai/globalState.js";
const ProtectedRoute = ({ children }) => {
  const user = useAtomValue(globalState)
  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;