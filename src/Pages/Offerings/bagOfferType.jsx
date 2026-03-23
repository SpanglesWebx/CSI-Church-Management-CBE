import React, { useEffect, useState } from "react";
import MoneyIcon from "../../assets/Group 1000002038-min.png";
import AddIcon from "../../assets/add-min.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import Spinners from "../../Components/Spinners";
import { useForm } from "react-hook-form";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { GiCoins } from "react-icons/gi";
import { FaCoins } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";

export default function BagOfferType() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${URL}/bagOfferings/categories`, {
        headers: { Authorization: token },
      });
      return response.data;
    } catch (error) {
      handleServerError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleServerError = (error) => {
    if (error.response?.status === 401) {
      setResponse({ status: "Failed", message: "Unauthorized! Please Login Again." });
      setTimeout(() => {
        window.sessionStorage.clear();
        navigate("/");
      }, 3000);
    } else if (error.response?.status === 500) {
      setResponse({ status: "Failed", message: "Server Unavailable!" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  // Create category
const onSubmit = async (data) => {
  try {
    await axios.post(
      `${URL}/bagOfferings/categories`,
      { category: data.category },   // <-- FIXED
      {
        headers: { Authorization: token },
      }
    );

    setCategories(await fetchCategories()); // refresh list
    setResponse({ status: "Success", message: "Category created successfully!" });

    reset(); // clear only input
    // keep modal open until user discards
  } catch (error) {
    handleServerError(error);
    setResponse({
      status: "Failed",
      message: error?.response?.data?.message || "Failed to create category",
    });
  }
};


  const handleCloseModal = () => {
    reset();
    setIsModalOpen(false);
    setResponse({ status: null, message: "" });
  };

  if (loading) {
    return (
      <div className="h-3/4 flex justify-center items-center">
        <Spinners />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-start gap-10">
        {categories?.map((cat) => (
          <div
            key={cat.category}
            onClick={() => navigate(`/admin/offerings/BagOffer/list/${cat.category}`)}
            className="bg-white cursor-pointer flex flex-col items-center justify-center 
                       space-y-4 w-full sm:w-[48%] md:w-[30%] lg:w-[22%] 
                       h-[100px] shadow-md rounded-lg"
          >
            {/* <img src={MoneyIcon} className="w-[30px] h-[30px]" alt={cat.name} /> */}
            <FaSackDollar className="w-[25px] h-[25px] text-lavender--600"/>
            <span className="text-xl text-lavender--600 font-bold capitalize">
              {cat.category}
            </span> 

          </div>
        ))}

        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-white cursor-pointer flex flex-col items-center justify-center 
                     space-y-4 w-full sm:w-[48%] md:w-[30%] lg:w-[22%] 
                     h-[100px] rounded-lg border-2 border-dashed border-lavender--600"
        >
          <img src={AddIcon} className="w-[30px] h-[30px]" alt="New Offerings" />
          <span className="text-md text-lavender--600">
            New Category
          </span>
        </div>
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Category">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              placeholder="Enter category name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
              {...register("category", { required: "Category name is required" })}
            />
            {errors.category && (
              <p className="text-red-500 text-sm">{errors.category.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="text-red-500"
            >
              Discard
            </button>
            <button
              type="submit"
              className="bg-lavender--600 text-white px-4 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Response Messages */}
      {Response.status === "Success" && <SuccessMessage Message={Response.message} />}
      {Response.status === "Failed" && <FailedMessage Message={Response.message} />}
    </div>
  );
}
