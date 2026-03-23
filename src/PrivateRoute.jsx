// import React from "react";
// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const token = sessionStorage.getItem("token");
// if (!token) return <Navigate to="/" />;

// let userRoles = [];
// try {
//   const payload = JSON.parse(atob(token.split(".")[1]));
//   userRoles = payload.roles || [];
// } catch (err) {
//   return <Navigate to="/" />;
// }

// const isAllowed = allowedRoles.some(role => userRoles.includes(role));
// if (!isAllowed) return <Navigate to="/" />;


//   return children;
// };

// export default PrivateRoute;

// import React from "react";
// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const token = sessionStorage.getItem("token");

//   // ❌ No token
//   if (!token) {
//     return <Navigate to="/" replace />;
//   }

//   let userRoles = [];

//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     userRoles = payload.roles || [];
//   } catch (err) {
//     localStorage.removeItem("token");
//     return <Navigate to="/" replace />;
//   }

//   const isAllowed = allowedRoles.some(role =>
//     userRoles.includes(role)
//   );

//   // ❌ Role not allowed
//   if (!isAllowed) {
//     return <Navigate to="/" replace />;
//   }

//   // ✅ Allowed
//   return children;
// };

// export default PrivateRoute;

import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // ✅ Check token expiry
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return <Navigate to="/" replace />;
    }

    const userRoles = payload.roles || [];

    const isAllowed = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }

    return children;

  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/" replace />;
  }
};

export default PrivateRoute;