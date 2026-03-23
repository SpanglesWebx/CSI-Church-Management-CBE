import React, { useState } from 'react'
import { FaArrowLeft, FaEye, FaPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import axios from "axios";
import { useEffect } from "react";
import { URL } from "../../App";
import Modal from '../../Components/Expense/ExpenseFormModal';

export const AddHallAssets = () => {

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [assetCategories, setAssetCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [modalCategoryId, setModalCategoryId] = useState("");
  const [newItem, setNewItem] = useState("");
  const [selectedHallId, setSelectedHallId] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [viewCategory, setViewCategory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);



  const [hallDropdown, setHallDropdown] = useState([]);


  useEffect(() => {
    (async () => {
      await fetchHallDropdown();
    })();
  }, []);


  const fetchHallDropdown = async () => {
    try {
      const res = await axios.get(`${URL}/marriage-halls/dropdown`, {
        headers: { Authorization: token }
      });
      setHallDropdown(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssetCategories = async () => {
    const res = await axios.get(`${URL}/hall-assets/category`, {
      headers: { Authorization: token }
    });
    setAssetCategories(res.data.data || []);
  };

  useEffect(() => {
    (async () => {
      await fetchAssetCategories();
    })();
  }, []);


  const addCategory = async () => {
    if (!newCategory.trim()) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Category name required",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      await axios.post(
        `${URL}/hall-assets/category`,
        { name: newCategory.trim() },
        { headers: { Authorization: token } }
      );

      // 🟢 Success toast (forced rerender)
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Category added successfully",
        });
      }, 10);

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      setNewCategory("");
      await fetchAssetCategories();
      // setIsModalOpen(false);

    } catch (err) {
      // 🔴 Error toast (forced rerender)
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err.response?.data?.message || "Category already exists",
        });
      }, 10);

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  const addItem = async () => {
    if (!modalCategoryId || !newItem.trim()) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({ status: "Failed", message: "Enter item name" });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      await axios.post(
        `${URL}/hall-assets/category/${modalCategoryId}/item`,
        { item: newItem.trim() },
        { headers: { Authorization: token } }
      );

      // 🟢 Success toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Item added successfully",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      setNewItem("");
      await fetchAssetCategories();

    } catch (err) {
      // 🔴 Error toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err.response?.data?.message || "Failed to add item",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  const saveHallAsset = async () => {
    if (!selectedHallId || !selectedCategoryId || !selectedItemName || !quantity) {
      // Validation toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Please select hall, category, item and quantity",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      const hall = hallDropdown.find(h => h._id === selectedHallId);
      const cat = assetCategories.find(c => c._id === selectedCategoryId);

      await axios.post(
        `${URL}/hall-assets/register`,
        {
          hall_id: selectedHallId,
          hall_name: hall.hall_name,
          category_id: selectedCategoryId,
          category_name: cat.name,
          item_name: selectedItemName,
          quantity,
        },
        { headers: { Authorization: token } }
      );

      // 🟢 Success toast (forced re-render)
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Asset saved",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      // Reset fields
      setQuantity("");
      setSelectedItemName("");

    } catch (err) {
      console.error("Save Hall Asset error:", err);

      // 🔴 Error toast (forced re-render)
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err.response?.data?.message || "Failed to save asset",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };





  return (
    <>
      <FaArrowLeft
        size={18}
        title='Back'
        onClick={() => navigate("/admin/mrghallasset")}
        className="cursor-pointer mb-4"
      />
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold">Add Assets</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hall Name</label>
            <select
              onChange={e => setSelectedHallId(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">--Select Hall--</option>

              {hallDropdown.map(h => (
                <option key={h._id} value={h._id}>
                  {h.hall_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="block mb-1 font-semibold text-sm text-lavender--600 flex items-center gap-2"
              >
                <FaPlus /> Category
              </button>
            </div>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">-- Select Category --</option>
              {assetCategories.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Item
              </label>

              <button
                type="button"
                onClick={() => setIsItemModalOpen(true)}
                className="block mb-1 font-semibold text-sm text-lavender--600 flex items-center gap-2"
              >
                <FaPlus /> Item
              </button>
            </div>
            <select onChange={e => setSelectedItemName(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
              <option value="">-- Select Item --</option>

              {assetCategories
                .find(c => c._id === selectedCategoryId)
                ?.items.map(it => (
                  <option key={it.name} value={it.name}>
                    {it.name}
                  </option>
                ))}
            </select>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                setQuantity(onlyNumbers);
              }}
              placeholder="Enter Quantity"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={saveHallAsset}
            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
          >
            Add Assets
          </button>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Category">

          <div className="max-h-[650px] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                placeholder="Enter Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={addCategory}
                disabled={!newCategory.trim()}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Add
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500">
                <thead className="text-base text-gray-700 border-b">
                  <tr>
                    <th className="p-2 text-center">Sl No.</th>
                    <th className="p-2 text-center">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {assetCategories.map((c, i) => (
                    <tr key={c._id}>
                      <td className='p-2 text-center'>{i + 1}</td>
                      <td className='text-center'>{c.name}</td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>

        </Modal>

        <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Add New Item">
          <div className="flex flex-col  space-y-3 max-h-[650px] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={modalCategoryId}
                  onChange={e => setModalCategoryId(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">-- Select Category --</option>
                  {assetCategories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Item</label>
                <input
                  type="text"
                  placeholder="Enter Item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={addItem}
                disabled={!modalCategoryId || !newItem.trim()}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Add
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500 table-fixed">
                <thead className="text-base text-gray-700 border-b">
                  <tr>
                    <th className="w-[70px] p-2 text-center">Sl</th>
                    <th className="w-[260px] p-2 text-center">Category</th>
                    <th className="w-[120px] p-2 text-center">Items</th>
                    <th className="w-[80px] p-2 text-center">View</th>
                  </tr>
                </thead>

                <tbody>
                  {assetCategories.map((cat, i) => (
                    <tr key={cat._id} className="border-b">
                      <td className="w-[70px] p-2 text-center">{i + 1}</td>
                      <td className="w-[260px] p-2 text-center font-medium">{cat.name}</td>
                      <td className="w-[120px] p-2 text-center">{cat.items.length}</td>
                      <td className="w-[80px] p-2 text-center">
                        <FaEye
                          size={18}
                          className="text-lavender--600 cursor-pointer mx-auto"
                          onClick={() => {
                            setViewCategory(cat);
                            setIsViewModalOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </Modal>

        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Items in ${viewCategory?.name || ""}`}
        >
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm text-gray-600 table-fixed">
              <thead className="border-b">
                <tr>
                  <th className="w-[80px] p-2 text-center">Sl</th>
                  <th className="p-2 text-center">Item Name</th>
                </tr>
              </thead>

              <tbody>
                {viewCategory?.items.map((it, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 text-center">{i + 1}</td>
                    <td className="p-2 text-center">{it.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>

      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
