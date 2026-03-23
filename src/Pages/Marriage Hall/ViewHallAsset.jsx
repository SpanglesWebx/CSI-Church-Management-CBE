import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";

export const ViewHallAsset = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = sessionStorage.getItem("token");
  const [hall, setHall] = useState(null);
  const [issueHistory, setIssueHistory] = useState([]);

  const loadIssueHistory = async () => {
    const res = await axios.get(`${URL}/hall-assets/issue-history/${id}`, {
      headers: { Authorization: token }
    });
    setIssueHistory(res.data.data || []);
  };

  const fetchHall = async () => {
    const res = await axios.get(`${URL}/hall-assets/register/${id}`, {
      headers: { Authorization: token }
    });
    setHall(res.data.data);
  };

  useEffect(() => {
    fetchHall();
    loadIssueHistory();
  }, []);


  if (!hall) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading hall assets...
      </div>
    );
  }



  return (
    <>
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate("/admin/mrghallasset")}
        className="cursor-pointer mb-4"
      />

      <div className="p-3 mx-1 mt-3 ">
        <h1 className="text-lg text-lavender--600 font-semibold">
          {hall.hall_name} – Asset Register
        </h1>

        {hall.categories.map((cat, ci) => (
          <div key={ci} className="mt-4 p-3 mx-1 bg-white shadow-sm rounded-[10px]">
            <h5 className="font-semibold text-lavender--600">
              {cat.category_name}
            </h5>

            {cat.items.length === 0 ? (
              <p className="text-gray-400 mt-2">No items</p>
            ) : (
              <table className="w-full mt-2 text-sm table-fixed">
                <thead className="text-base text-gray-700 border-b">
                  <tr>
                    <th className="w-[70px] p-2 text-center">Sl</th>
                    <th className="w-[320px] p-2 text-center">Item</th>
                    <th className="w-[120px] p-2 text-center">Quantity</th>
                  </tr>
                </thead>

                <tbody>
                  {cat.items.map((it, i) => (
                    <tr className="border-b" key={i}>
                      <td className="w-[70px] p-2 text-center">{i + 1}</td>
                      <td className="w-[320px] p-2 text-center truncate">
                        {it.item_name}
                      </td>
                      <td className="w-[120px] p-2 text-center font-semibold">
                        {it.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            )}
          </div>
        ))}

        {hall.categories
          .filter(cat =>
            issueHistory.some(log => log.category_id === cat.category_id)
          )
          .map(cat => (
            <div key={cat.category_id} className="mt-4 mx-1 bg-white p-3 rounded shadow-sm">

              <h5 className="font-semibold text-lavender--600 mb-2">
                {cat.category_name}
              </h5>

              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="p-2 text-center">Item</th>
                    <th className="p-2 text-center">Issued To</th>
                    <th className="p-2 text-center">Issued Qty</th>
                    <th className="p-2 text-center">Returned</th>
                    <th className="p-2 text-center">Damaged</th>
                    <th className="p-2 text-center">Missing</th>
                    <th className="p-2 text-center">Balance</th>
                    <th className="p-2 text-center">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {cat.items
                    .filter(it =>
                      issueHistory.some(log =>
                        log.category_id === cat.category_id &&
                        log.items.some(i => i.item_name === it.item_name)
                      )
                    )
                    .map(it =>
                      issueHistory
                        .filter(log =>
                          log.category_id === cat.category_id &&
                          log.items.some(i => i.item_name === it.item_name)
                        )
                        .map((log, idx) => {
                          const issued = log.items.find(i => i.item_name === it.item_name);

                          const returned = issued.returned || 0;
                          const damaged = issued.damaged || 0;
                          const missing = issued.missing || 0;
                          const balance = issued.issued_qty - (returned + damaged + missing);

                          return (
                            <tr key={idx} className="border-b">
                              <td className="p-2 text-center">{it.item_name}</td>


                              <td className="p-2 text-center">
                                {log.customer_name}
                              </td>

                              <td className="p-2 text-center text-blue-700 font-semibold">
                                {issued.issued_qty}
                              </td>

                              <td className="p-2 text-center text-green-700">
                                {returned}
                              </td>

                              <td className="p-2 text-center text-orange-600">
                                {damaged}
                              </td>

                              <td className="p-2 text-center text-red-700">
                                {missing}
                              </td>

                              <td className="p-2 text-center font-bold">
                                {balance}
                              </td>

                              <td className="p-2 text-center">
                                {new Date(log.date).toLocaleDateString("en-GB")}
                              </td>
                            </tr>
                          );
                        })
                    )}
                </tbody>

              </table>
            </div>
          ))}


      </div>
    </>
  );
};
