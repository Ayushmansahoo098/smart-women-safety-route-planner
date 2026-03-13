import { Navigate, useLocation } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../utils/authStorage";
import { isTokenValid } from "../utils/token";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getAuthToken();

  if (!token || !isTokenValid(token)) {
    clearAuthToken();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
