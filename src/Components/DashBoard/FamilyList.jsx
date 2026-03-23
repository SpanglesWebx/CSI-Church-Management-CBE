import React, { useEffect, useState } from "react";
import { IoIosEye } from "react-icons/io";
import { URL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinners from "../Spinners"; // Ensure Spinners component is correctly imported
import { FailedMessage, SuccessMessage } from "../ToastMessage";
import { Link} from "react-router-dom";

function FamilyList() {
  const [families, setFamilies] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const familyData = await fetchFamily();
        setFamilies(familyData);
      } catch (error) {
        console.error("Error fetching families:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchFamily = async () => {
    try {
      const response = await axios.get(`${URL}/family/list?limit=5`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data.RegisteredData;
    } catch (error) {
      if (error.response.status === 401) {
        setResponse({
          status: "Failed",
          message: "Un Authorized! Please Login Again.",
        });
        setTimeout(() => {
          window.sessionStorage.clear();
          navigate("/");
        }, 5000);
      }
      if (error.response.status === 500) {
        setResponse({
          status: "Failed",
          message: "Server Unavailable!",
        });
        setTimeout(() => {
          setResponse({
            status: null,
            message: "",
          });
        }, 5000);
      }
      // if (error.response.status === 401) {
      //   setResponse({
      //     status: "Failed",
      //     message: "Un Authorized! Please Login Again.",
      //   });
      //   setTimeout(() => {
      //     window.sessionStorage.clear();
      //     navigate("/");
      //   }, 5000);
      // }
      // console.error("Error fetching families:", error);
      // return [];
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-lavender--600 overflow-x-auto">
      <div className="flex justify-between py-2">
        <div className="text-lg font-bold mb-2 text-lavender--600">
          Family List
        </div>
        <button
          className="border border-lavender--600 text-lavender--600 px-2 rounded-lg"
          onClick={() => navigate("/admin/family/list")}
        >
          View All
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <Spinners /> {/* Show spinner while loading */}
        </div>
      ) : families && families.length > 0 ? (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="py- text-center">SI. no.</th>
              <th className="py-2 text-center">Family ID</th>
              <th className="py-2 text-center">Family Head</th>
              <th className="py-2 text-center">Member Name</th>
              <th className="py-2 text-center">Member Tamil Name</th>
              <th className="py-2 text-center">Status</th>
              <th className="py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {families.map((family, index) => (
              <tr key={family._id} className="border-t text-gray-600">
                <td className="py-4 text-center">{index + 1}</td>
                <td className="py-2 text-center">{family.family_id}</td>
                <td className="py-2 text-center">{family.head}</td>
                <td className="py-2 capitalize">{family.member_name}</td>
                <td className="py-2">{family.member_tamil_name}</td>
                <td
                  className={`py-2 text-center ${
                    family?.status === "Active"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {family.status}
                </td>
                <td className="py-2 text-center">
                <Link
                      to={`/admin/family/${family.family_id}/preview`}
                      className="px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-2">No families found.</div>
      )}

      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </div>
  );
}

export default FamilyList;
