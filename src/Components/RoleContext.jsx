import React, { createContext, useState, useEffect } from "react";

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState("");

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) setActiveRole(storedRole);
  }, []);

  const switchRole = (role) => {
    setActiveRole(role);
    sessionStorage.setItem("role", role);
  };

  return (
    <RoleContext.Provider value={{ activeRole, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
};


//This file is used to switch the role between during the runtime