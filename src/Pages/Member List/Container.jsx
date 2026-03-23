import React from "react";
import { Outlet } from "react-router-dom";

function Container() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}

export default Container;
