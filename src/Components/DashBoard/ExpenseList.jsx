import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosEye } from "react-icons/io";
import { URL } from "../../App";
import moment from "moment";
import DetailModal from "../Expense/detailsModal";
import { useNavigate } from "react-router-dom";
import Spinners from "../Spinners";
import { FailedMessage, SuccessMessage } from "../ToastMessage";

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate("");
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Loading state for modal
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenseData = await fetchExpenses();
        setExpenses(expenseData.Expenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShowDetails = async (member) => {
    try {
      setIsModalOpen(true);
      setIsLoading(true); // Set loading to true when fetching starts
      const response = await axios.get(`${URL}/expense/${member._id}`, {
        headers: {
          Authorization: token,
        },
      });
      setSelectedMember(response.data);
    } catch (error) {
      // console.error("Error fetching expense details:", error);
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
    } finally {
      setIsLoading(false); // Ensure loading is set to false when fetching ends or on error
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const bufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const ImageRenderer = ({ imageBuffer }) => {
    const base64String = bufferToBase64(imageBuffer.data);
    const imageSrc = `data:image/jpeg;base64,${base64String}`;

    return (
      <img src={imageSrc} alt="Auto charge" className="w-[90%] h-[230px]" />
    );
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${URL}/expense/category?limit=5`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
  };

 

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-lavender--600">
      <div className="flex justify-between py-2">
        <div className="text-lg font-bold mb-2 text-lavender--600">Expense</div>
        <button
          className="border border-lavender--600 text-lavender--600 px-2 rounded-lg"
          onClick={() => navigate("/admin/expense/list")}
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center">
            <Spinners /> {/* Show spinner while loading */}
          </div>
        ) :  expenses && expenses.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Sl. no.</th>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Category</th>
                <th className="py-2 text-left">Amount</th>
                <th className="py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={index} className="border-t text-gray-600">
                  <td className="py-4">{index + 1}</td>
                  <td className="py-2">
                    {moment(new Date(expense?.date)).format("DD-MM-YYYY")}
                  </td>
                  <td className="py-2">{expense.category}</td>
                  <td className="py-2">{expense.amount}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleShowDetails(expense)}
                      className="text-purple-500 bg-purple-200 p-2 rounded-md"
                    >
                      <IoIosEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-2">No expenses found.</div>
        )}
      </div>

      <DetailModal isOpen={isModalOpen} onClose={handleCloseModal}>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 animate-pulse">
              <span className="font-medium break-words bg-gray-300 h-6 w-20 rounded"></span>
              <span className="text-gray-600 break-words bg-gray-300 h-6 w-40 rounded"></span>
            </div>
            <div className="grid grid-cols-2 animate-pulse">
              <span className="break-words bg-gray-300 h-6 w-20 rounded"></span>
              <span className="text-gray-600 break-words bg-gray-300 h-6 w-40 rounded"></span>
            </div>
            <div className="grid grid-cols-2 animate-pulse">
              <span className="break-words bg-gray-300 h-6 w-20 rounded"></span>
              <span className="text-gray-600 break-words bg-gray-300 h-6 w-40 rounded"></span>
            </div>
            <div className="grid grid-cols-2 animate-pulse">
              <span className="break-words bg-gray-300 h-6 w-20 rounded"></span>
              <span className="text-gray-600 break-words bg-gray-300 h-6 w-40 rounded"></span>
            </div>
            <div className="animate-pulse bg-gray-300 h-48 w-full rounded"></div>
          </div>
        ) : selectedMember ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2">
              <span className="font-medium break-words">Date</span>
              <span className="text-gray-600 break-words">
                {moment(new Date(selectedMember?.date)).format("DD-MM-YYYY")}
              </span>
            </div>
            <div className="grid grid-cols-2">
              <span className="break-words">Category</span>
              <span className="text-gray-600 break-words">
                {selectedMember.category}
              </span>
            </div>
            <div className="grid grid-cols-2">
              <span className="break-words">Amount</span>
              <span className="text-gray-600 break-words">
                ₹ {selectedMember.amount}
              </span>
            </div>
            <div className="grid grid-cols-2">
              <span className="break-words">Description</span>
              <span className="text-gray-600 break-words">
                {selectedMember.description}
              </span>
            </div>
            {selectedMember.image && (
              <ImageRenderer imageBuffer={selectedMember.image} />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <p>No details available</p>
          </div>
        )}
      </DetailModal>

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

export default ExpenseList;
