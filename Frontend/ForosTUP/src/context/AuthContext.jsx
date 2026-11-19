import { createContext, useContext, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getCurrentUser } from "../Services/userService.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const controller = new AbortController();
    getCurrentUser(token, controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) setSession({ user, token });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (error.status === 401 || error.status === 403 || error.status === 404) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        toast.error(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const login = (user, token) => {
    localStorage.removeItem("user");
    localStorage.setItem("token", token);
    setSession({ user, token });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setSession(null);
  };

  const user = session?.user ?? null;
  const isSysAdmin = user?.role === "SYSADMIN";

  if (loading) return <Spinner animation="border" />;

  return (
    <AuthContext.Provider value={{
      user,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      isAdmin: isSysAdmin || user?.role === "ADMIN",
      isSysAdmin,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
