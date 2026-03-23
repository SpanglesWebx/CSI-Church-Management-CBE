import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";

export const TypesofReceipts = () => {
  const token = window.sessionStorage.getItem("token");

  // LEFT SIDE STATES
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // RIGHT SIDE STATES
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subList, setSubList] = useState([]);
  const [input, setInput] = useState("");
  const [savingSub, setSavingSub] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [showSubInput, setShowSubInput] = useState(false);

  // TOAST RESPONSE
  const [Response, setResponse] = useState({ status: null, message: "" });

  const categoryInputRef = useRef(null);

  // AUTO FOCUS CATEGORY INPUT
  useEffect(() => {
    if (showAdd && categoryInputRef.current) {
      categoryInputRef.current.focus();
    }
  }, [showAdd]);

  // FETCH RECEIPT CATEGORIES
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await axios.get(
        `${URL}/receipt-category/categories`,
        { headers: { Authorization: token } }
      );
      setCategories(res.data || []);
    } catch (err) {
      setResponse({
        status: "Failed",
        message: "Failed to load receipt categories",
      });
    }
    setLoadingCategories(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ADD RECEIPT CATEGORY
  const addCategory = async () => {
    if (!newCategory.trim()) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Receipt category name required",
        });
      }, 10);

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
      return;
    }

    try {
      await axios.post(
        `${URL}/receipt-category/categories/add`,
        { name: newCategory.trim() },
        { headers: { Authorization: token } }
      );

      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Receipt category added",
        });
      }, 10);

      setNewCategory("");
      setShowAdd(true);
      fetchCategories();
    } catch (err) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message:
            err.response?.data?.message || "Failed to add receipt category",
        });
      }, 10);
    } finally {
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === "Enter" && newCategory.trim()) {
      e.preventDefault();
      addCategory();
    }
  };

  // FETCH RECEIPT SUBCATEGORIES
  const fetchSubcategories = async (id) => {
    if (!id) return;
    setLoadingSub(true);
    try {
      const res = await axios.get(
        `${URL}/receipt-category/subcategories/${id}`,
        { headers: { Authorization: token } }
      );
      setSubList(res.data?.subcategories || []);
    } catch (err) {
      setResponse({
        status: "Failed",
        message: "Failed to load receipt subcategories",
      });
    }
    setLoadingSub(false);
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory._id);
    }
  }, [selectedCategory]);

  // ADD SUBCATEGORY (ENTER / TAB)
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
      e.preventDefault();
      const val = input.trim();
      if (!subList.includes(val)) {
        setSubList([...subList, val]);
      }
      setInput("");
    }
  };

  // SAVE RECEIPT SUBCATEGORIES
  const saveSubcategories = async () => {
    if (!selectedCategory) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Select a receipt category first",
        });
      }, 10);

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
      return;
    }

    setSavingSub(true);
    try {
      await axios.post(
        `${URL}/receipt-category/subcategories/${selectedCategory._id}/save`,
        { subcategories: subList },
        { headers: { Authorization: token } }
      );

      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Receipt subcategories saved successfully",
        });
      }, 10);
    } catch (err) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to save receipt subcategories",
        });
      }, 10);
    } finally {
      setSavingSub(false);
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };

  return (
    <>
      <div className="p-2 mx-1  bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-lavender--600">Types of Receipts</h1>
        </div>

        <div className="flex gap-4">
          {/* LEFT HALF */}
          <div className="w-1/2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex-1">
                {showAdd && (
                  <input
                    ref={categoryInputRef}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={handleCategoryKeyDown}
                    placeholder="Enter receipt category"
                    className="border w-full p-2 rounded text-sm"
                  />
                )}
              </div>

              {!showAdd ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-lavender--600 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                >
                  <FaPlus /> Category
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={addCategory}
                    className="border-2 border-lavender--600 text-lavender--600 w-9 h-9 flex items-center justify-center rounded-md"
                  >
                    <FaPlus size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setShowAdd(false);
                      setNewCategory("");
                    }}
                    className="border-2 border-red-500 text-red-500 w-9 h-9 flex items-center justify-center rounded-md"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white shadow-md rounded-lg border p-4 h-[480px] overflow-y-auto">
              {loadingCategories ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-gray-500">No receipt categories</p>
              ) : (
                categories.map((c, index) => (
                  <div
                    key={c._id}
                    onClick={() => setSelectedCategory(c)}
                    className={`p-2 rounded mb-2 cursor-pointer flex items-center gap-2 ${selectedCategory?._id === c._id
                        ? "bg-lavender--100"
                        : "hover:bg-gray-100"
                      }`}
                  >
                    <span
                      className={`text-sm font-bold ${selectedCategory?._id === c._id
                          ? "text-lavender--600"
                          : "text-gray-700"
                        }`}
                    >
                      {index + 1}.
                    </span>

                    <span
                      className={`text-sm font-medium ${selectedCategory?._id === c._id
                          ? "text-lavender--600"
                          : "text-gray-700"
                        }`}
                    >
                      {c.name}
                    </span>
                  </div>

                ))
              )}
            </div>
          </div>

          {/* RIGHT HALF */}
          <div className="w-1/2">
            <div className="flex items-center justify-between gap-2 mb-2 h-[35px]">
              <div className="flex-1">
                {selectedCategory && showSubInput && (
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter receipt subcategory"
                    className="border w-full p-2 rounded text-sm"
                  />
                )}
              </div>

              {selectedCategory ? (
                !showSubInput ? (
                  <button
                    onClick={() => setShowSubInput(true)}
                    className="bg-lavender--600 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                  >
                    <FaPlus /> Subcategory
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (input.trim() && !subList.includes(input.trim())) {
                          setSubList([...subList, input.trim()]);
                        }
                        setInput("");
                      }}
                      className="border-2 border-lavender--600 text-lavender--600 w-9 h-9 flex items-center justify-center rounded-md"
                    >
                      <FaPlus size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setShowSubInput(false);
                        setInput("");
                      }}
                      className="border-2 border-red-500 text-red-500 w-9 h-9 flex items-center justify-center rounded-md"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                )
              ) : (
                <div className="w-[130px]" />
              )}
            </div>

            <div className="bg-white shadow-md rounded-lg border p-4 h-[480px]">
              {selectedCategory ? (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto">
                    <h3 className="text-[23px] font-semibold mb-2">
                      {selectedCategory.name}
                    </h3>

                    {subList.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No receipt subcategories added
                      </p>
                    ) : (
                      subList.map((s, i) => (
                        <div key={i} className="p-2 border-b text-sm">
                          {i + 1}. {s}
                        </div>
                      ))
                    )}
                  </div>

                  {showSubInput && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={saveSubcategories}
                        disabled={savingSub}
                        className="bg-lavender--600 text-white px-6 py-2 rounded text-sm"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Select a receipt category to view details
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </>
  );
};
