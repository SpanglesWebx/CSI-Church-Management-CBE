import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";

export const EditHallAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [hall, setHall] = useState(null);
  const [Response, setResponse] = useState({ status:null, message:"" });

  useEffect(() => { fetchHall(); }, []);

  const fetchHall = async () => {
    const res = await axios.get(`${URL}/hall-assets/register/${id}`, {
      headers:{Authorization:token}
    });
    setHall(res.data.data);
  };

  const updateQty = (catIndex, itemIndex, value) => {
    const copy = { ...hall };
    copy.categories[catIndex].items[itemIndex].quantity = value.replace(/\D/g,"");
    setHall(copy);
  };

  const saveChanges = async () => {
    await axios.put(`${URL}/hall-assets/register/${id}`, hall, {
      headers:{Authorization:token}
    });

    setResponse({ status:"Success", message:"Asset updated successfully" });
  };

  if (!hall) return null;

  return (
    <>
      <FaArrowLeft onClick={()=>navigate("/admin/mrghallasset")} className="cursor-pointer mb-4" />

      <div className="p-3 mx-1 mt-3 ">
        <h1 className="text-lg text-lavender--600 font-semibold">
          Edit {hall.hall_name} Assets
        </h1>

        {hall.categories.map((cat, ci) => (
          <div key={ci} className="mt-4 bg-white shadow-md rounded-[10px] p-3">
            <h5 className="text-lavender--600 font-semibold">{cat.category_name}</h5>

            <table className="w-full mt-2 text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-2 text-center">Sl</th>
                  <th className="p-2 text-center">Item</th>
                  <th className="p-2 text-center">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {cat.items.map((it, ii) => (
                  <tr className="border-b" key={ii}>
                    <td className="p-2 text-center">{ii+1}</td>
                    <td className="p-2 text-center">{it.item_name}</td>
                    <td className="p-2 text-center">
                      <input
                        value={it.quantity}
                        onChange={e=>updateQty(ci,ii,e.target.value)}
                        className="w-24 h-8 text-center border rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="flex justify-end mt-4">
          <button onClick={saveChanges} className="px-4 py-2 bg-lavender--600 text-white rounded">
            Save Changes
          </button>
        </div>
      </div>

      {Response.status && (Response.status==="Success" ? <SuccessMessage Message={Response.message}/> : <FailedMessage Message={Response.message}/> )}
    </>
  );
};
