import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;