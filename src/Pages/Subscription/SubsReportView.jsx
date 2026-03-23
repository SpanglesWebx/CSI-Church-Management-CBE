import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { URL } from "../../App";
import { FaArrowLeft } from "react-icons/fa";

export const SubsReportView = () => {
  const { member_id } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0); // For members with multiple years

  // Define the months in financial year order
  const months = [
    "april", "may", "june", "july", "august", "september",
    "october", "november", "december", "january", "february", "march"
  ];

  // Define the contribution labels and their keys from your Schema
  const contributionTypes = [
    { label: "Monthly Subscription", key: "monthlySubscriptionOffering" },
    { label: "Building Fund", key: "buildingFund" },
    { label: "Missionary Sponsorship", key: "missionarySponsorship" },
    { label: "Tithe", key: "decimalPart" },
    { label: "IMS", key: "ims" },
    { label: "FMPB", key: "fmpb" },
    { label: "NMS", key: "nms" },
    { label: "IEM", key: "iem" },
    { label: "Vishwavani", key: "vishwavani" },
    { label: "BYM", key: "bym" },
    { label: "DBM", key: "dbm" },
    { label: "CGMM", key: "cgmm" },
    { label: "CMM", key: "cmm" },
    { label: "YMM", key: "ymm" },
    { label: "Bible Society", key: "bibleSociety" },
    { label: "Womens Ministry", key: "womensMinistry" },
    { label: "Educational Asst.", key: "educationalAssistance" },
    { label: "Help the Poor", key: "helpThePoor" },
    { label: "Medical Asst.", key: "medicalAssistance" },
    { label: "Auction Balance", key: "harvestAuction" },
    
  ];

  useEffect(() => {
    const fetchMemberDetail = async () => {
      try {
        const encodedId = encodeURIComponent(member_id);
        const res = await fetch(
          `${URL}/subscriptions/report/view?member_id=${encodeURIComponent(member_id)}`,
          {
            headers: { Authorization: token },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch report");
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberDetail();
  }, [member_id, token]);

  if (loading) return <div className="p-10 text-center">Loading Report...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">No data found.</div>;

  const currentSubscription = data?.subscriptions?.[selectedYearIndex] || {};

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-lavender--600">
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{data.memberInfo.member_name}</h1>
            <p className="text-sm text-gray-500">ID: {data.memberInfo.member_id}</p>
          </div>
        </div>

        {/* Year Selector if multiple years exist */}
        <select 
          className="border rounded p-1 text-sm bg-white"
          value={selectedYearIndex}
          onChange={(e) => setSelectedYearIndex(Number(e.target.value))}
        >
          {data.subscriptions.map((sub, idx) => (
            <option key={idx} value={idx}>Financial Year: {sub.year}</option>
          ))}
        </select>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-lavender--50 border-b">
              <th className="p-3 border-r font-semibold text-lavender--700 sticky left-0 bg-lavender--50 z-10 w-40">
                Contributions
              </th>
              {months.map((m) => (
                <th key={m} className="p-3 text-center border-r font-semibold capitalize min-w-[80px]">
                  {m.substring(0, 3)}
                </th>
              ))}
              <th className="p-3 text-center font-bold bg-green-50">Total</th>
            </tr>
          </thead>
          <tbody>
            {contributionTypes.map((type) => {
              let rowTotal = 0;
              return (
                <tr key={type.key} className="border-b hover:bg-gray-50">
                  <td className="p-3 border-r font-medium text-gray-700 sticky left-0 bg-white z-10">
                    {type.label}
                  </td>
                  {months.map((m) => {
                    // Logic: Sum allocations for that specific month for this contribution type
                    const monthData = currentSubscription[m];
                    const amount = monthData?.allocations?.reduce((sum, alloc) => sum + (alloc[type.key] || 0), 0) || 0;
                    rowTotal += amount;
                    return (
                      <td key={m} className={`p-3 text-center border-r ${amount > 0 ? 'text-blue-600 font-medium' : 'text-gray-300'}`}>
                        {amount > 0 ? amount : "-"}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-bold bg-green-50 text-green-700">
                    {rowTotal > 0 ? rowTotal : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="p-3 border-r sticky left-0 bg-gray-100">Monthly Total</td>
              {months.map((m) => {
                const total = currentSubscription[m]?.total || 0;
                return (
                  <td key={m} className="p-3 text-center border-r text-gray-900">
                    {total > 0 ? total : "-"}
                  </td>
                );
              })}
              <td className="p-3 text-center text-lavender--700 bg-lavender--100">
                {currentSubscription.total_received}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};