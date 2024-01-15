import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../context/AuthContext.jsx";
// Used to protect routes that are only available to signed in users
export function ProtectedRoute({ children }) {
  const { user,householdId } = useContext(Context);

  if (!user) {
    return <Navigate to="/login" replace />;
  } else {
    if (householdId !== "") return children;
    return <Navigate to={"/"} replace />;
  }
}

export default class PrivateRoute {}
