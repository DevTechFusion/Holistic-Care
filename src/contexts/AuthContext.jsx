import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "../DAL/auth";

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

  const isAuthenticated = !localStorage.getItem("token");

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

  useEffect(() => {
  //  isAuthenticated && getUserDetail();
  }, [isAuthenticated]);

  const value = {
    isAuthenticated,
    user,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
