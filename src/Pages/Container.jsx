

import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { RoleProvider, RoleContext } from "../Components/RoleContext";

function LayoutContent() {
  const { activeRole } = useContext(RoleContext);

  return (
    <>
      <Navbar />
      <section className="flex h-[calc(95vh-64px)]">
        {/* ✅ Hide Sidebar for member role */}
        {activeRole !== "member" && <Sidebar />}

        <section 
          id="main-scroll"
        className="w-full h-full overflow-y-auto bg-slate-50 p-5">
          <Outlet />
        </section>
      </section>
    </>
  );
}

function Container() {
  return (
    <RoleProvider>
      <LayoutContent />
    </RoleProvider>
  );
}

export default Container;
