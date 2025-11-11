// ParentLogin.jsx - Refactored main component
import React, { useState } from "react";
import ParentAuth from "./ParentAuth";
import ParentDashboard from "./ParentDashboard";

const ParentLogin = () => {
  const [childData, setChildData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle successful login from ParentAuth component
  const handleLoginSuccess = (userData) => {
    setChildData(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    setChildData(null);
    setIsAuthenticated(false);
  };

  // If not authenticated, show the login/registration component
  if (!isAuthenticated || !childData) {
    return <ParentAuth onLoginSuccess={handleLoginSuccess} />;
  }

  // If authenticated, show the dashboard
  return (
    <ParentDashboard 
      childData={childData} 
      onLogout={handleLogout}
    />
  );
};

export default ParentLogin;