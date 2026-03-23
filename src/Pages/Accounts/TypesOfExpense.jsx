import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";

export const TypesOfExpense = () => {
  const token = window.sessionStorage.getItem("token");

  // Left side states
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Right side states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subList, setSubList] = useState([]);
  const [input, setInput] = useState("");
  const [savingSub, setSavingSub] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [showSubInput, setShowSubInput] = useState(false);
  const categoryInputRef = useRef(null);

  useEffect(() => {
    if (showAdd && categoryInputRef.current) {
      categoryInputRef.current.focus();
    }
  }, [showAdd]);



  // Fetch categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await axios.get(`${URL}/expense-category/categories`, {
        headers: { Authorization: token },
      });
      setCategories(res.data || []);
    } catch (err) {
      setResponse({
        status: "Failed",
        message: "Failed to load categories",
      });
    }
    setLoadingCategories(false);
  };


  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category
  const addCategory = async () => {
    if (!newCategory.trim()) {
      // ❗ Show error toast (force re-render)
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Category name required",
        });
      }, 10);

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      return;
    }

    try {
      await axios.post(
        `${URL}/expense-category/categories/add`,
        { name: newCategory.trim() },
        { headers: { Authorization: token } }
      );

      // 🔄 Force toast update even for repeated messages
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Category added",
        });
      }, 10);

      setNewCategory("");
      setShowAdd(true);
      fetchCategories();
    } catch (err) {
      // 🔄 Force-error toast update
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err.response?.data?.message || "Failed to add category",
        });
      }, 10);
    } finally {
      // ⏱️ Auto-hide
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === "Enter" && newCategory.trim()) {
      e.preventDefault();
      addCategory(); // trigger the save function
    }
  };


  // Delete category
  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(`${URL}/expense-category/categories/${id}`, {
        headers: { Authorization: token },
      });

      setResponse({
        status: "Success",
        message: "Category deleted",
      });

      if (selectedCategory?._id === id) {
        setSelectedCategory(null);
        setSubList([]);
      }
      fetchCategories();
    } catch (err) {
      setResponse({
        status: "Failed",
        message: "Failed to delete category",
      });
    }
  };


  // Load subcategories
  const fetchSubcategories = async (id) => {
    if (!id) return;
    setLoadingSub(true);

    try {
      const res = await axios.get(`${URL}/expense-category/subcategories/${id}`, {
        headers: { Authorization: token },
      });
      setSubList(res.data?.subcategories || []);
    } catch (err) {
      setResponse({
        status: "Failed",
        message: "Failed to load subcategories",
      });
    }

    setLoadingSub(false);
  };


  useEffect(() => {
    if (selectedCategory) fetchSubcategories(selectedCategory._id);
  }, [selectedCategory]);

  // Add subcategory on Enter or Tab
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
      e.preventDefault();
      const val = input.trim();
      if (!subList.includes(val)) setSubList([...subList, val]);
      setInput("");
    }
  };

  // Save subcategories
  const saveSubcategories = async () => {
    if (!selectedCategory) {
      // ❗ Force-error toast update
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Select a category first",
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
        `${URL}/expense-category/subcategories/${selectedCategory._id}/save`,
        { subcategories: subList },
        { headers: { Authorization: token } }
      );

      // 🔄 Force toast re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Saved successfully",
        });
      }, 10);

    } catch (err) {
      // 🔄 Force-error toast re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to save subcategories",
        });
      }, 10);
    } finally {
      setSavingSub(false);

      // ⏱️ Auto-clear toast after 3s
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };



  return (
    <>
      <div className="p-2 mx-1  bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-lavender--600">Types of Expenses</h1>
        </div>

        <div className="flex gap-4">

          {/* LEFT HALF */}
          <div className="w-1/2">

            {/* ROW 1 — Input + Icons / Add Button */}
            <div className="flex items-center justify-between gap-2 mb-2">

              {/* LEFT SIDE → Input */}
              <div className="flex-1">
                {showAdd ? (
                  <input
                    ref={categoryInputRef}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={handleCategoryKeyDown}
                    placeholder="Enter category name"
                    className="border w-full p-2 rounded text-sm"
                  />
                ) : (
                  <div></div>
                )}
              </div>

              {/* RIGHT SIDE → Button OR Save/Cancel Icons */}
              {!showAdd ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-lavender--600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <FaPlus /> Category
                </button>
              ) : (
                <div className="flex items-center gap-3">

                  {/* SAVE BUTTON */}
                  <button
                    onClick={addCategory}
                    className="border-2 border-lavender--600 text-lavender--600 w-9 h-9 flex items-center justify-center rounded-md hover:bg-lavender--600 hover:text-white"
                  >
                    <FaPlus size={16} />
                  </button>

                  {/* CANCEL BUTTON */}
                  <button
                    onClick={() => {
                      setShowAdd(false);
                      setNewCategory("");
                    }}
                    className="border-2 border-red-500 text-red-500 w-9 h-9 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white"
                  >
                    <FaTimes size={16} />
                  </button>

                </div>
              )}
            </div>

            {/* LEFT CARD (CATEGORY LIST) */}
            <div className="bg-white shadow-md rounded-lg border p-4 h-[480px]">

              <div className="overflow-y-auto h-full">
                {loadingCategories ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories</p>
                ) : (
                  categories.map((c, index) => (
                    <div
                      key={c._id}
                      onClick={() => setSelectedCategory(c)}
                      className={`p-2 rounded mb-2 cursor-pointer flex justify-between items-center ${selectedCategory?._id === c._id
                        ? "bg-lavender--100"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${selectedCategory?._id === c._id ? "text-lavender--600" : "text-gray-700"}`}>{index + 1}.</span>
                        <span className={`text-sm font-medium ${selectedCategory?._id === c._id ? "text-lavender--600" : "text-gray-700"}`} >{c.name}</span>
                      </div>
                      {/* <FaTrash
                        className="text-red-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(c._id);
                        }}
                      /> */}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* RIGHT HALF */}
          <div className="w-1/2">

            {/* FIXED HEIGHT ROW — ALWAYS RENDERED */}
            <div className="flex items-center justify-between gap-2 mb-2 h-[35px]">

              {/* LEFT SIDE → Input */}
              <div className="flex-1">
                {selectedCategory && showSubInput ? (
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter subcategory"
                    className="border w-full p-2 rounded text-sm"
                  />
                ) : (
                  <div></div>
                )}
              </div>

              {/* RIGHT SIDE → Button or Icons or Placeholder */}
              {selectedCategory ? (
                !showSubInput ? (
                  // SHOW ADD SUBCATEGORY BUTTON
                  <button
                    onClick={() => setShowSubInput(true)}
                    className="bg-lavender--600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    <FaPlus /> Subcategory
                  </button>
                ) : (
                  // SHOW + AND X ICON BUTTONS
                  <div className="flex items-center gap-3">

                    {/* ADD SUBCATEGORY ICON */}
                    <button
                      onClick={() => {
                        if (input.trim() && !subList.includes(input.trim())) {
                          setSubList([...subList, input.trim()]);
                        }
                        setInput("");
                      }}
                      className="border-2 border-lavender--600 text-lavender--600 w-9 h-9 flex items-center justify-center rounded-md hover:bg-lavender--600 hover:text-white"
                    >
                      <FaPlus size={16} />
                    </button>

                    {/* CANCEL INPUT ICON */}
                    <button
                      onClick={() => {
                        setShowSubInput(false);
                        setInput("");
                      }}
                      className="border-2 border-red-500 text-red-500 w-9 h-9 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white"
                    >
                      <FaTimes size={16} />
                    </button>

                  </div>
                )
              ) : (
                /* PLACEHOLDER TO PREVENT CARD FROM MOVING UP */
                <div className="w-[130px]"></div>
              )}

            </div>

            {/* RIGHT CARD — ALWAYS ALIGNED */}
            <div className="bg-white shadow-md rounded-lg border p-4 h-[480px]">

              {selectedCategory ? (
                <>
                  {/* LIST AREA + SAVE (both inside card) */}
                  <div className="flex flex-col h-full">
                    <div className="overflow-y-auto flex-1">
                      <h3 className="text-[23px] font-semibold mb-2">
                        {selectedCategory.name}
                      </h3>

                      {subList.length === 0 ? (
                        <p className="text-xs text-gray-500">No subcategories added</p>
                      ) : (
                        <div className="text-sm text-gray-700">
                          {subList.map((s, i) => (
                            <div
                              key={i}
                              className="p-2 border-b border-gray-200 flex items-start gap-2"
                            >
                              <span className="font-medium">{i + 1}.</span>
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>


                    {/* SAVE BUTTON (ONLY WHEN INPUT OPENED) */}
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
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Select a category to view details
                </p>
              )}

            </div>

          </div>
        </div>

      </div>
      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}
    </>
  );
};
