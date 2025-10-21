import { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "../DAL/auth";
import { getAssignedPermissions, getPermissions } from "../DAL/permission";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isAuthenticated);
  const [allowedPermissions, setAllowedPermissions] = useState([]);

  const getUserDetail = async () => {
    try {
      const result = await getUserProfile();
      if (result.status === "success") {
        setUser(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const getRolePermissions = async () => {
    setLoading(true);
    const role = user?.roles?.[0]?.id;
    if (role) {
      try {
        const res = await getAssignedPermissions(role);
        if (res.status === "success") {
          setAllowedPermissions(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const hasPermission = (moduleName, action) => {
    if (allowedPermissions.length <= 0) return false;
    for (const permission of allowedPermissions) {
      if (permission.module === moduleName && permission.name === action) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (isAuthenticated) {
      getUserDetail();
    }
  }, []);

  useEffect(() => {
    if (user) {
      getRolePermissions();
    }
  }, [user]);

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
