import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";
import { useForm } from "react-hook-form";
import { MdVerified } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

export const Usercontrol = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");


  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // search states
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [memberDropdownById, setMemberDropdownById] = useState([]);
  const [memberDropdownByName, setMemberDropdownByName] = useState([]);
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoles, setEditRoles] = useState([]);


  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  const token = sessionStorage.getItem("token");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      member_id: "",
      member_name: "",
      phone: "",
      roles: [],
    },
  });



  //search and the pagination
  const fetchUsers = async (page = CurrentPage) => {
    try {
      const res = await axios.get(`${URL}/users`, {
        params: {
          page,
          limit: rowsPerPage,
          search,
        },
        headers: { Authorization: token },
      });

      const filteredUsers = (res.data.users || []).filter(
        (u) => !u.roles?.includes("admin")
      );

      // setUsers(res.data.users || []);

      setUsers(filteredUsers);
      setCurrentPage(res.data.page || page);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  useEffect(() => {
    fetchUsers(CurrentPage);
  }, [CurrentPage, rowsPerPage, search]);

  // ✅ Debounce helpers
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearchMemberById = useRef(
    debounce(async (val) => {
      if (!val) {
        setMemberDropdownById([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        if (res.data?.length > 0) {
          setMemberDropdownById(res.data);
          setMemberError("");
        } else {
          setMemberDropdownById([]);
          setMemberError("Member not found");
        }
      } catch (err) {
        console.error(err);
        setMemberDropdownById([]);
        setMemberError("Error searching member");
      }
    }, 400)
  ).current;

  const debouncedSearchMemberByName = useRef(
    debounce(async (val) => {
      if (!val) {
        setMemberDropdownByName([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        if (res.data?.length > 0) {
          setMemberDropdownByName(res.data);
          setMemberError("");
        } else {
          setMemberDropdownByName([]);
          setMemberError("Member not found");
        }
      } catch (err) {
        console.error(err);
        setMemberDropdownByName([]);
        setMemberError("Error searching member");
      }
    }, 400)
  ).current;

  // ✅ Handle modal open/close
  const handleOpenModal = () => {
    setIsModalOpen(true);
    reset();
    setMemberVerified(false);
    setMemberIdSearch("");
    setMemberNameSearch("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
    setMemberVerified(false);
    setMemberIdSearch("");
    setMemberNameSearch("");
  };

  // ✅ Submit handler: create user by admin
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        member_id: data.member_id,
        roles: data.roles || [],
      };

      const response = await axios.post(
        `${URL}/users/create-by-admin`,
        payload,
        { headers: { Authorization: token } }
      );

      setUsers((prev) => [...prev, response.data.user]);
      // toast.success("User added successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error adding user:", error);
      // toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };
  const roleOptions = [
    { value: "member", label: "Member" },
    { value: "admin", label: "Admin" },
    { value: "pastorprimary", label: "Primary Pastor" },
    { value: "pastorsecondary", label: "Secondary Pastor" },
    { value: "dcmember", label: "DC Member" },
    { value: "churchofficeworker", label: "Church Office Worker" },
    { value: "officestaff", label: "Office Staff" },
    { value: "treasurer", label: "Treasurer" },
    { value: "accountant", label: "Accountant" },
    { value: "secretary", label: "Secretary" },
    { value: "sundaysclscretary", label: "Sunday School Secretary" },
    // { value: "sundaysclaccountant", label: "Sunday School Accountant" },
    { value: "sundaysclteacher", label: "Sunday School Teacher" },
    // { value: "endeavoursclscretary", label: "Endeavour Secretary" },
    // { value: "endeavourclaccountant", label: "Endeavour Accountant" },
    // { value: "endeavourteacher", label: "Endeavour Teacher" },
    { value: "youthsecretary", label: "Youth Secretary" },
    // { value: "youthaccountant", label: "Youth Accountant" },
    { value: "mensecretary", label: "Men's Secretary" },
    // { value: "menaccountant", label: "Men's Accountant" },
    { value: "womensecretary", label: "Women's Secretary" },
    // { value: "womenaccountant", label: "Women's Accountant" },
    { value: "couplesecretary", label: "Couples Secretary" },
    // { value: "coupleaccountant", label: "Couples Accountant" },
    // { value: "choiraccountant", label: "Choir Accountant" },
    { value: "choirsecretary", label: "Choir Secretary" },
    { value: "cemeterymanager", label: "Cemetery Manager" },
  ];

  // Helper to format role names
  const getReadableRoles = (roles) => {
    if (!roles || roles.length === 0) return "-";

    // 🧠 Filter out the default "member" role
    const filteredRoles = roles.filter((r) => r.toLowerCase() !== "member");

    // If after filtering nothing remains, show "-"
    if (filteredRoles.length === 0) return "-";

    return filteredRoles
      .map((role) => {
        const match = roleOptions.find((r) => r.value === role);
        return match ? match.label : role; // fallback to raw value if not found
      })
      .join(", ");
  };



  return (
    <>
      <div className="flex flex-col w-full p-4 mt-5 space-y-10 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">User Management</h2>

        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <h3 className="text-lg font-semibold">Existing Users</h3>
          <div className="">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search Members
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg
                  className="w-3 h-3 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search by Name, role"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset to page 1 when searching
                }}
              />
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
            onClick={handleOpenModal}
          >
            <FaPlus /> Add Role
          </button>
        </div>

        {/* Users Table */}
        <table className="w-full text-sm text-left rtl:text-right ">
          <thead className="text-base text-gray-700 bg-white  dark:text-gray-400">
            <tr className="border-b">
              <th className="text-center p-2">Sl.No</th>
              <th className="text-center p-2">Username (Member ID)</th>
              <th className="text-center p-2">Member Name</th>
              <th className="text-center p-2">Email</th>
              {/* <th className="text-center p-2">Assigned Roles</th> */}
              <th className="text-center p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr
                key={u._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-3"
              >
                {/* <td className="text-center p-3">{(CurrentPage - 1) * 10 + index + 1} </td> */}

                <td className="text-center p-3">
                  {(CurrentPage - 1) * rowsPerPage + index + 1}
                </td>
                <td className="text-center p-3">{u.member_id}</td>
                <td className="p-2">{u.member_name}</td>
                <td className="p-2">{u.email}</td>
                {/* <td className="p-2 max-w-[300px] break-words">
                  {getReadableRoles(u.roles)}
                </td> */}

                <td className="text-center space-x-3">
                  <FaEye
                    size={18}
                    title="View User Roles"
                    className="cursor-pointer text-lavender--600 inline-block"
                    onClick={() => {
                      setViewUser(u);
                      setIsViewModalOpen(true);
                    }}
                  />
                  <CiEdit
                    size={20}
                    title="Edit User Roles"
                    className="cursor-pointer text-lavender--600 inline-block"
                    onClick={() => {
                      setSelectedUser(u);
                      setEditRoles(u.roles || []);
                      setIsEditModalOpen(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination*/}
        <Pagination
          currentPage={CurrentPage}
          totalPages={TotalPages}
          rowsPerPage={rowsPerPage}
          rowsInput={rowsInput}
          jumpInput={jumpInput}
          setCurrentPage={setCurrentPage}
          setRowsPerPage={setRowsPerPage}
          setRowsInput={setRowsInput}
          setJumpInput={setJumpInput}
          defaultRows={25}
        />





      </div>



      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewUser(null);
        }}
        title="User Details"
      >
        {viewUser ? (
          <div className="space-y-4 text-gray-700">

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 font-semibold">Member ID</div>
              <div className="col-span-8">{viewUser.member_id}</div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 font-semibold">Name</div>
              <div className="col-span-8">{viewUser.member_name}</div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 font-semibold">Email</div>
              <div className="col-span-8">{viewUser.email}</div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 font-semibold">Roles</div>
              <div className="col-span-8">
                {getReadableRoles(viewUser.roles)}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center text-gray-500">No Data</div>
        )}
      </Modal>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Role">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {/* Member Search */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Member ID
                  </label>
                  <input
                    type="text"
                    placeholder="Search by ID"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    {...register("member_id", { required: true })}
                    value={memberIdSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberIdSearch(val);
                      debouncedSearchMemberById(val);
                    }}
                  />
                  {memberVerified && (
                    <p className="flex items-center gap-2 text-sm text-green-600 mt-1">
                      Member verified successfully <MdVerified />
                    </p>
                  )}
                  {!memberVerified && memberError && (
                    <p className="text-sm text-red-500 mt-1">{memberError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Member Name
                  </label>
                  <input
                    type="text"
                    placeholder="Search by Name"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    {...register("member_name", { required: true })}
                    value={memberNameSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberNameSearch(val);
                      debouncedSearchMemberByName(val);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    readOnly
                    {...register("phone")}
                    value={watch("phone") || ""}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {(memberDropdownById.length > 0 ||
                  memberDropdownByName.length > 0) && (
                    <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[100%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {(memberDropdownById.length > 0
                        ? memberDropdownById
                        : memberDropdownByName
                      ).map((m) => (
                        <li
                          key={m.member_id}
                          className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                          onClick={() => {
                            setMemberIdSearch(m.member_id);
                            setMemberNameSearch(m.member_name);
                            setValue("member_id", m.member_id);
                            setValue("member_name", m.member_name);
                            setValue("phone", m.mobile_number);
                            setMemberDropdownById([]);
                            setMemberDropdownByName([]);
                            setMemberVerified(true);
                          }}
                        >
                          <span className="w-[250px] font-medium">
                            {m.member_id}
                          </span>
                          <span className="flex-1">{m.member_name}</span>
                          <span className="w-[200px] text-gray-500">
                            {m.mobile_number}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            </div>

            {/* Roles Selection */}
            <div className="mt-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Assign Roles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  // { value: "admin", label: "Admin" },
                  { value: "pastorprimary", label: "Primary Pastor" },
                  { value: "pastorsecondary", label: "Secondary Pastor" },
                  { value: "dcmember", label: "DC Member" },
                  { value: "churchofficeworker", label: "Church Office Worker" },
                  { value: "officestaff", label: "Office Staff" },
                  { value: "treasurer", label: "Treasurer" },
                  { value: "accountant", label: "Accountant" },
                  { value: "secretary", label: "Secretary" },
                  { value: "sundaysclscretary", label: "Sunday School Secretary" },
                  // { value: "sundaysclaccountant", label: "Sunday School Accountant" },
                  { value: "sundaysclteacher", label: "Sunday School Teacher" },
                  // { value: "endeavoursclscretary", label: "Endeavour Secretary" },
                  // { value: "endeavourclaccountant", label: "Endeavour Accountant" },
                  // { value: "endeavourteacher", label: "Endeavour Teacher" },
                  { value: "youthsecretary", label: "Youth Secretary" },
                  // { value: "youthaccountant", label: "Youth Accountant" },
                  { value: "mensecretary", label: "Men's Secretary" },
                  // { value: "menaccountant", label: "Men's Accountant" },
                  { value: "womensecretary", label: "Women's Secretary" },
                  // { value: "womenaccountant", label: "Women's Accountant" },
                  { value: "couplesecretary", label: "Couples Secretary" },
                  // { value: "coupleaccountant", label: "Couples Accountant" },
                  // { value: "choiraccountant", label: "Choir Accountant" },
                  { value: "choirsecretary", label: "Choir Secretary" },
                  { value: "cemeterymanager", label: "Cemetery Manager" },

                ].map((role) => (
                  <label
                    key={role.value}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 border rounded-md px-3 py-2 bg-white shadow-sm cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={role.value}
                      {...register("roles")}
                      className="form-checkbox h-4 w-4 text-lavender--600 border-gray-300 rounded"
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Roles for ${selectedUser?.member_name || ""}`}
      >
        {selectedUser && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div>
              <p className="text-gray-600">
                <strong>Member ID:</strong> {selectedUser.member_id}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>

            {/* Role checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roleOptions.map((role) => (
                <label
                  key={role.value}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 border rounded-md px-3 py-2 bg-white shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={editRoles.includes(role.value)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        setEditRoles([...editRoles, role.value]);
                      } else {
                        setEditRoles(editRoles.filter((r) => r !== role.value));
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-lavender--600 border-gray-300 rounded"
                  />
                  {role.label}
                </label>
              ))}
            </div>

            {/* Save button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={async () => {
                  try {
                    const res = await axios.put(
                      `${URL}/users/update-role`,
                      {
                        userId: selectedUser._id,
                        roles: editRoles,
                      },
                      { headers: { Authorization: token } }
                    );

                    // Update local table immediately and preserve member_name
                    setUsers((prev) =>
                      prev.map((u) => {
                        if (u._id === selectedUser._id) {
                          const updated = res.data.user;
                          if (!updated.member_name) updated.member_name = u.member_name;
                          return updated;
                        }
                        return u;
                      })
                    );

                    setIsEditModalOpen(false);
                  } catch (err) {
                    console.error("❌ Error updating roles:", err);
                    alert(err.response?.data?.message || "Failed to update roles");
                  }
                }}

                className="px-5 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

    </>


  );
};
