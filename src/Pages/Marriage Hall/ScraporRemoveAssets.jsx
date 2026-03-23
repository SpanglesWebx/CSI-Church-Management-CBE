import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';

export const ScraporRemoveAssets = () => {

  const navigate = useNavigate();
  return (
    <>
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate("/admin/mrghallasset")}
        className="cursor-pointer mb-4"
      />
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        
      </div>
    </>
  )
}
