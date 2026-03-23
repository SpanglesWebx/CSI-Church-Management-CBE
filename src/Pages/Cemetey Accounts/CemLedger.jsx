import React, { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

export const CemLedger = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
const [userRole, setUserRole] = useState("");

    useEffect(() => {
    if (!token) return;
  
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded roles:", decoded.roles);
  
      // If multiple roles exist, pick the active/stored one
      const storedRole = sessionStorage.getItem("role");
  
      if (storedRole && decoded.roles?.includes(storedRole)) {
        setUserRole(storedRole);
      } else {
        setUserRole(decoded.roles?.[0] || "");
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, [token]); 
  return (
    <>
      <div className="p-2 mx-1 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-lavender--600">
            Types of Ledgers
          </h1>
          {["admin", "churchofficeworker"].includes(userRole) && (
          <button
            onClick={() => navigate('/admin/cemledger/addcemledgertypes')}
            className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Create Ledgers
          </button>
          )}
        </div>
      </div>
    </>
  )
}
