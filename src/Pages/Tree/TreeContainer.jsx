import React from "react";
import { Outlet } from "react-router-dom";

function TreeContainer() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}

export default TreeContainer;
