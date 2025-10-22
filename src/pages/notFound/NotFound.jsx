import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { CircularProgress } from "@mui/material";
import { Link, Navigate } from "react-router-dom";



const NotFound404 = () => {
  const { isLoading, user } = useAuth();
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/" replace />;
  } else if (token && (isLoading || !user)) {
    return <CircularProgress />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6 py-12 text-center">
      <h1 className="text-4xl font-bold text-gray-800">404 Not Found</h1>
      <p className="mt-2 text-gray-500">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Link
        to="/"
        replace
        className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound404;
