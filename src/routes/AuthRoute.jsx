import { Navigate, Outlet } from "react-router-dom";

function AuthRoute() {
  const loginId = localStorage.getItem("token");
  return loginId ? <Outlet /> : <Navigate to="/" />;
}

// sadsdas
export default AuthRoute;