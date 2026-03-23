import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";


const FamilyTable = () => {
  const { familyId } = useParams(); // Get familyId from URL params
  const [members, setMembers] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleBack = () => {
  navigate("/admin/pastor/list?tab=paster-family-list");
};


  const tableHeading = [
    "Sl. no.",
    "Family ID",
    "Member ID",
    "Member Name",
    "Member Tamil Name",
    "Relationship",
    "Status",
    "Action",
  ];

  useEffect(() => {
    const fetchFamilyData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${URL}/pastor/family/${familyId}`);
        setMembers(response.data.members || []);
        setFamilyMembers(response.data.familyMembers || []);
        setError("");
      } catch (err) {
        setError("Failed to fetch family data");
        setMembers([]);
        setFamilyMembers([]);
      }
      setLoading(false);
    };

    fetchFamilyData();
  }, [familyId]);

  return (
    <div className="max-w-5xl p-4 mx-auto">
      <p className="mb-2">
  <i
    onClick={handleBack}
    className="text-2xl text-gray-700 hover:text-black cursor-pointer fa-solid fa-arrow-left-long"
    title="Go Back"
  ></i>
</p>

      <h2 className="mb-4 text-2xl font-bold">
        Pastor Family ID ({familyId})
      </h2>
      <div className="flex justify-end mb-4">
        <Link
          to={`/admin/pastor/family/add/${familyId}/`}
          className="px-3 py-1 space-x-2 text-sm text-white rounded bg-lavender--600 hover:bg-lavender--600"
        >
          <i className="fa-solid fa-plus"></i> New Pastor Family Member
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-base text-gray-700 bg-white text-center">
            <tr>
              {tableHeading.map((item, index) => (
                <th scope="col" className="px-4 py-3" key={index}>
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.length > 0 || familyMembers.length > 0 ? (
              [...members, ...familyMembers].map((item, index) => (
                <tr className="bg-white border-b" key={item._id}>
                  <th
                    scope="row"
                    className="px-4 py-4 text-sm font-medium text-gray-900 text-center"
                  >
                    {index + 1}
                  </th>
                  <td className="px-4 py-4 text-sm text-center">{item.familyId}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.member_id}</td>
                  <td className="px-4 py-4 text-sm">{item.member_name}</td>
                  <td className="px-4 py-4 text-sm">{item.member_tamil_name}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.relationship_with_family_head}</td>

                  <td className="px-4 py-4 text-sm text-center">
                    <span
                      className={`${
                        item.status === "Active"
                          ? "text-green-600"
                          : "text-red-600"
                      } px-4 py-4 text-sm font-semibold`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className=" px-4 py-4 text-sm text-center">
                    <Link
                      to={`/admin/pastor/${item.member_id}/preview`}
                      className="px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FamilyTable;
