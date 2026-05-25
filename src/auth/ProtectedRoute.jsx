// hne route guard: ila ma famech access token ma ykhallich l user yodkhel lel pages el mahmiyin.
import { Navigate } from "react-router-dom";

// hne component ProtectedRoute: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function ProtectedRoute({ children }) {

  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
