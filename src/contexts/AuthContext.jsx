import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getUserProfile } from "../DAL/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isAuthenticated);

  const getUserDetail = async () => {
    try {
      const result = await getUserProfile();
      if (result?.status === "success" && result?.data?.user) {
        setUser(result.data.user);
      } else if (result?.data?.user) {
        setUser(result.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const allowedPermissions = useMemo(() => {
    if (!user) return [];
    const role = Array.isArray(user.roles) ? user.roles[0] : user.role ?? null;
    if (!role) return [];
    return Array.isArray(role.permissions) ? role.permissions : [];
  }, [user]);

  const hasPermission = (moduleName, action) => {
    if (!allowedPermissions || allowedPermissions.length === 0) return false;
    return allowedPermissions.some(
      (permission) =>
        permission.module?.toLowerCase() === moduleName.toLowerCase() &&
        permission.name?.toLowerCase() === action.toLowerCase()
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      getUserDetail();
    }
  }, []);

  const value = {
    isAuthenticated,
    user,
    setUser,
    loading,
    setLoading,
    getUserDetail,
    allowedPermissions,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
