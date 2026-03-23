import React, { useEffect, useState } from "react";
import AddIcon from "../../assets/add-min.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import Spinners from "../../Components/Spinners";
import { useForm } from "react-hook-form";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { FaSackDollar } from "react-icons/fa6";

export const MinistryOfferType = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Hoisted error handler
  function handleServerError(error) {
    const status = error?.response?.status;
    if (status === 401) {
      setResponse({ status: "Failed", message: "Unauthorized! Please Login Again." });
      setTimeout(() => {
        window.sessionStorage.clear();
        navigate("/");
      }, 2000);
    } else if (status === 500) {
      setResponse({ status: "Failed", message: "Server Unavailable!" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    } else if (status) {
      setResponse({
        status: "Failed",
        message: error?.response?.data?.message || `Server returned ${status}`,
      });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    } else {
      setResponse({ status: "Failed", message: "Network error or server not reachable" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  }

  // Fetch categories (robust to response shapes)
  const fetchCategories = async () => {
    try {
      const resp = await axios.get(`${URL}/ministryOfferings/categories`, {
        headers: { Authorization: token },
      });

      if (Array.isArray(resp.data)) return resp.data;
      if (Array.isArray(resp.data?.categories)) return resp.data.categories;
      if (Array.isArray(resp.data?.ministryOfferings)) return resp.data.ministryOfferings;
      console.warn("Unexpected categories response shape:", resp.data);
      return [];
    } catch (error) {
      handleServerError(error);
      return [];
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const cats = await fetchCategories();
        if (mounted) setCategories(cats);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create category
  const onSubmit = async (data) => {
    if (!data?.category || !data.category.trim()) {
      setResponse({ status: "Failed", message: "Category name is required" });
      setTimeout(() => setResponse({ status: null, message: "" }), 2500);
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${URL}/ministryOfferings/categories`,
        { category: data.category.trim() },
        {
        headers: { Authorization: token },
      }
      );

      const updated = await fetchCategories();
      setCategories(updated);

      setResponse({ status: "Success", message: "Category created successfully!" });
      reset(); // clear form
      // keep modal open by design; call setIsModalOpen(false) here if you want auto-close
    } catch (error) {
      handleServerError(error);
      setResponse({
        status: "Failed",
        message: error?.response?.data?.message || "Failed to create category",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
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
            key={cat._id || cat.category}
            onClick={() => navigate(`/admin/offerings/MinistryOffer/list/${encodeURIComponent(cat.category)}`)}
            className="bg-white cursor-pointer flex flex-col items-center justify-center 
                       space-y-4 w-full sm:w-[48%] md:w-[30%] lg:w-[22%] 
                       h-[100px] shadow-md rounded-lg"
          >
            <FaSackDollar className="w-[25px] h-[25px] text-lavender--600" />
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsModalOpen(true);
          }}
        >
          <img src={AddIcon} className="w-[30px] h-[30px]" alt="New Offerings" />
          <span className="text-md text-lavender--600">New Category</span>
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
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleCloseModal} className="text-red-500">
              Discard
            </button>
            <button
              type="submit"
              className="bg-lavender--600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Response Messages */}
      {Response.status === "Success" && <SuccessMessage Message={Response.message} />}
      {Response.status === "Failed" && <FailedMessage Message={Response.message} />}
    </div>
  )
}
