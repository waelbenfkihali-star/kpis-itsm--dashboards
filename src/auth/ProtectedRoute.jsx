// hne guard : l user 3andou access token 9bal ma yodkhel lel app.
import { Navigate } from "react-router-dom";

// hne component t9arrer: nwarri page l protected wala login.
export default function ProtectedRoute({ children }) {

  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
