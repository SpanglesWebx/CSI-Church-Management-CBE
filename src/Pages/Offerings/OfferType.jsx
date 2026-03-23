import React, { useEffect, useState } from "react";
import MoneyIcon from "../../assets/Group 1000002038-min.png";
import AddIcon from "../../assets/add-min.png";
import CommonModal from "../../Components/CommonModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import Spinners from "../../Components/Spinners";
import { useForm } from "react-hook-form";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { MdVerified } from "react-icons/md";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { FaSackDollar } from "react-icons/fa6";

export default function OfferType() {
  const [category, setCategory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [checkingMember, setCheckingMember] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const token = window.sessionStorage.getItem("token");
  // Get today's date in the format YYYY-MM-DD 
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      date: getCurrentDate(),
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await fetchCategories();
        setCategory(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const memberId = watch("member_id");
    if (memberId) {
      checkMember(memberId);
    }
  }, [watch("member_id")]);

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const res = await axios.post(`${URL}/offerings/add`, data, {
        headers: {
          Authorization: token,
        },
      });
      console.log(res);
      reset();
      setIsModalOpen(false);
      setCheckingMember(false);
      setMemberError("");
      const category = await fetchCategories();
      setCategory(category);
      setMemberDetails(null);
    } catch (error) {
      console.log(error);
      // if (error.response.status === 401) {
      //   window.sessionStorage.clear();
      //   navigate("/");
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
      setServerError(error?.response?.data?.message);
    }
  };

  const fetchCategories = async () => {
  try {
    const response = await axios.get(`${URL}/categories`, {
      headers: { Authorization: token },
    });
    return response.data;
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
        setResponse({ status: null, message: "" });
      }, 5000);
    }
  }
};




  const checkMember = async (memberId) => {
    if (memberId.length > 11) {
      setCheckingMember(true);
      setMemberError("");
      try {
        const response = await axios.get(
          `${URL}/offerings/member/verify/${memberId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        if (response.data) {
          setValue("member_name", response.data.member.member_name);
          setMemberDetails(response.data);
        } else {
          setMemberError("Member ID does not exist.");
          setValue("member_name", "");
          setMemberDetails(null);
        }
      } catch (error) {
        setMemberError("Member not found.");
        setValue("member_name", "");
        setMemberDetails(null);
        if (error.response.status === 401) {
          window.sessionStorage.clear();
          navigate("/");
        }
      } finally {
        setCheckingMember(false);
      }
    }
  };

  const handleCloseModal = () => {
    setMemberError("");
    setCheckingMember(false);
    setIsModalOpen(false);
    setMemberDetails(null);
    reset();
  };

  const handleOpenModal = () => {
    setMemberError("");
    setCheckingMember(false);
    setIsModalOpen(true);
    setMemberDetails(null);
    reset();
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
    if (!imageBuffer || !imageBuffer.data) {
      console.error("Invalid image buffer", imageBuffer);
      return null;
    }

    const base64String = bufferToBase64(imageBuffer.data);
    const imageSrc = `data:image/jpeg;base64,${base64String}`;

    return (
      <img
        src={imageSrc}
        alt="Rendered"
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "100px",
          maxHeight: "100px",
        }}
      />
    );
  };
const handleAddCategory = async () => {
  if (!newCategory.trim()) return;

  try {
    await axios.post(`${URL}/categories`, { name: newCategory }, {
      headers: { Authorization: token }
    });
    setNewCategory("");
    setCategories(await fetchCategories()); // refresh list
  } catch (err) {
    console.error("Error creating category", err);
  }
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
  {category?.map((cat) => (
    <div
      key={cat._id} // use _id
      onClick={() =>
        navigate(`/admin/offerings/Common/list/${cat.name}`)
      }
      className="bg-white cursor-pointer flex flex-col items-center justify-center space-y-4 w-full sm:w-[48%] md:w-[30%] lg:w-[22%] h-[100px] shadow-md rounded-lg"
    >
      {/* <img src={MoneyIcon} className="w-[30px] h-[30px]" alt={cat.name} /> */}
      <FaSackDollar className="w-[25px] h-[25px] text-lavender--600"/>
      <span className="text-xl text-lavender--600 font-bold capitalize">
        {cat.name}
      </span>
    </div>
  ))}

  <div
    onClick={handleOpenModal}
    className="bg-white cursor-pointer flex flex-col items-center justify-center space-y-4 w-full sm:w-[48%] md:w-[30%] lg:w-[22%] h-[100px] rounded-lg border-2 border-dashed border-lavender--600"
  >
    <img src={AddIcon} className="w-[30px] h-[30px]" alt="New Offerings" />
    <span className="text-md text-lavender--600" style={{ color: "lavender--600" }}>
      New Offerings
    </span>
  </div>
</div>


      <Modal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  title="New Category"
>
  <form
    onSubmit={handleSubmit(async (data) => {
      try {
        // use the new categories endpoint
        await axios.post(
          `${URL}/categories`,
          { name: data.category }, // backend expects { name }
          {
            headers: {
              Authorization: token,
            },
          }
        );

        // Refresh categories after adding
        const categoryData = await fetchCategories();
        setCategory(categoryData);

        reset();
        setIsModalOpen(false);
        setResponse({
          status: "Success",
          message: "Category created successfully!",
        });
      } catch (error) {
        setResponse({
          status: "Failed",
          message:
            error?.response?.data?.message || "Failed to create category",
        });
      }
    })}
  >
    <div className="mb-4">
      <label
        htmlFor="category"
        className="block text-lg font-medium text-gray-700"
      >
        Category Name
      </label>
      <input
        id="category"
        type="text"
        placeholder="Enter category name"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
        {...register("category", {
          required: "Category name is required",
        })}
      />
      {errors.category && (
        <p className="text-red-500 text-sm">{errors.category.message}</p>
      )}
    </div>

    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={handleCloseModal}
        className="inline-flex justify-center rounded-md px-4 py-2 text-base font-medium text-red-500 sm:text-sm"
      >
        Discard
      </button>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md px-4 py-2 bg-lavender--600 text-base font-medium text-white sm:text-sm"
      >
        Save
      </button>
    </div>
  </form>
</Modal>



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
