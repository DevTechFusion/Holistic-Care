import { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "../DAL/auth";
import { getPermissions } from "../DAL/permission";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allowedPermissions, setAllowedPermissions] = useState();

  const isAuthenticated = !!localStorage.getItem("token");

  const getUserDetail = async () => {
    setLoading(true);
    try {
      const result = await getUserProfile();
      if (result.status === "success") {
        setUser(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissions = async () => {
    const role = user?.roles?.[0]?.name;
    if (role) {
      try {
        const res = await getPermissions(role);
        if (res.status === "success") {
          setAllowedPermissions(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    }
  };

  const hasPermission = (moduleName, action) => {
    
    const roles = user?.roles || [];
    for (const role of roles) {
      const permissions = role.permissions || [];
      for (const permission of permissions) {
        if (
          permission.module?.moduleName === moduleName &&
          permission.action === action
        ) {
          return true;
        }
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
    loading,
    setLoading,
    getUserDetail,
    allowedPermissions,
    hasPermission, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};