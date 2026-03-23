



import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Pagination from "../../Components/Helpers/SundaySclPagination";
import { URL } from "../../App";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { FailedMessage, SuccessMessage, WarningMessage } from "../../Components/ToastMessage";

export const AddStudents = () => {

    const token = sessionStorage.getItem("token");
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const [eligibleMembers, setEligibleMembers] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [classOptions, setClassOptions] = useState([]);
    const [classList, setClassList] = useState([]);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);

    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");

    const [selectedPage, setSelectedPage] = useState(1);

    const [saving, setSaving] = useState(false);

    const [eligibleRowsInput, setEligibleRowsInput] = useState("");
    const [eligibleJumpInput, setEligibleJumpInput] = useState("");

    const [selectedRowsInput, setSelectedRowsInput] = useState("");
    const [selectedJumpInput, setSelectedJumpInput] = useState("");
    const [selectedSearch, setSelectedSearch] = useState("");
    const [toast, setToast] = useState(null);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const activeClassRef = useRef(null);


    /* ================= FETCH CLASSES ================= */

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {

            const res = await axios.get(`${URL}/sunday-classes`, {
                headers: { Authorization: token }
            });

            setClassList(res.data.classes || []);
            setClassOptions(res.data.classes || []);

        } catch (err) {
            console.error(err);
        }
    };

    /* ================= FETCH ELIGIBLE MEMBERS ================= */

    const fetchEligibleMembers = async (classId, page = 1) => {

        try {
            setLoadingMembers(true);

            const res = await axios.get(
                `${URL}/sunday-classes/${classId}/students/eligible`,
                {
                    headers: { Authorization: token },
                    params: {
                        page,
                        limit: rowsPerPage,
                        search
                    }
                }
            );
            if (activeClassRef.current !== classId) return;
            const data = Array.isArray(res.data) ? res.data : res.data.data;

            setEligibleMembers(data || []);
            setTotalPages(res.data.totalPages || 1);

        } catch (err) {
            console.error(err);
        }
        finally {
            setLoadingMembers(false);  // stop loading
        }
    };


    const resetUI = () => {
        setSearch("");
        setSelectedSearch("");

        setCurrentPage(1);
        setSelectedPage(1);

        setRowsInput("");
        setJumpInput("");

        setEligibleRowsInput("");
        setEligibleJumpInput("");

        setSelectedRowsInput("");
        setSelectedJumpInput("");

        setEligibleMembers([]);
        setSelectedStudents([]);
    };

    /* ================= CLASS CHANGE ================= */

    const handleClassChange = async (e) => {

        const selectedId = e.target.value;

        resetUI();

        setSelectedClassId(selectedId);
        activeClassRef.current = selectedId;
        setCurrentPage(1);

        if (!selectedId) {
            setSelectedClass(null);
            setEligibleMembers([]);
            setSelectedStudents([]);
            return;
        }

        try {

            const headers = { headers: { Authorization: token } };

            let cls = classList.find((c) => c._id === selectedId);

            if (!cls) {
                const clsRes = await axios.get(`${URL}/sunday-classes/${selectedId}`, headers);
                cls = clsRes.data;
            }

            if (activeClassRef.current !== selectedId) return;

            setSelectedClass(cls);

            const preselected = (cls.students || []).map((s) => ({
                member_id: s.member_id,
                member_name: s.member_name,
                dob: s.date_of_birth
            }));

            setSelectedStudents(preselected);
            setLoadingMembers(true);

            fetchEligibleMembers(selectedId, 1);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setSearch("");
        setSelectedSearch("");
        setCurrentPage(1);
        setSelectedPage(1);
    }, [selectedClassId]);

    /* ================= PAGE / SEARCH CHANGE ================= */

    useEffect(() => {

        if (selectedClassId) {
            fetchEligibleMembers(selectedClassId, currentPage);
        }

    }, [currentPage, rowsPerPage, search]);

    /* ================= TOGGLE STUDENT ================= */

    // const toggleStudentSelection = (member) => {

    //     setSelectedStudents((prev) => {

    //         const exists = prev.some(
    //             (s) => s.member_id === member.member_id
    //         );

    //         // Remove student
    //         if (exists) {
    //             const updated = prev.filter(
    //                 (s) => s.member_id !== member.member_id
    //             );

    //             setSelectedPage(1); // prevent empty pagination page
    //             return updated;
    //         }

    //         // Max students check
    //         if (
    //             selectedClass &&
    //             prev.length >= selectedClass.max_students
    //         ) {
    //             setToast({
    //                 type: "warning",
    //                 message: `Maximum ${selectedClass.max_students} students allowed`
    //             });

    //             return prev;
    //         }
    //         // Add student
    //         const updated = [...prev, member];
    //         setSelectedPage(1);
    //         return updated;
    //     });

    // };


    const toggleStudentSelection = (member) => {

        const exists = selectedStudents.some(
            (s) => s.member_id === member.member_id
        );

        // Remove
        if (exists) {
            const updated = selectedStudents.filter(
                (s) => s.member_id !== member.member_id
            );

            setSelectedStudents(updated);
            setSelectedPage(1);
            return;
        }

        // Max limit check
        if (
            selectedClass &&
            selectedStudents.length >= selectedClass.max_students
        ) {
            setToast({
                type: "warning",
                message: `Maximum ${selectedClass.max_students} students allowed`
            });

            return;
        }

        // Add
        setSelectedStudents([...selectedStudents, member]);
        setSelectedPage(1);
    };
    /* ================= SAVE ================= */

    const onSubmit = async () => {

        if (!selectedClassId) {
            setToast({
                type: "warning",
                message: "Please select class"
            });
            return;
        }

        if (selectedStudents.length === 0) {
            setToast({
                type: "warning",
                message: "Please select students"
            });
            return;
        }

        try {

            setSaving(true);

            await axios.post(
                `${URL}/sunday-classes/${selectedClassId}/students`,
                { students: selectedStudents },
                { headers: { Authorization: token } }
            );

            navigate(-1);

        }
        catch (err) {

            const message =
                err?.response?.data?.message || "Something went wrong";

            const type =
                err?.response?.data?.type || "error";

            setToast({
                type,
                message
            });

        }



        finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const getAge = (dob) => {
        if (!dob) return "-";
        return moment().diff(moment(dob), "years");
    };

    const filteredSelectedStudents = selectedStudents.filter((student) => {
        const term = selectedSearch.toLowerCase();

        return (
            student.member_name?.toLowerCase().includes(term) ||
            student.member_id?.toLowerCase().includes(term)
        );
    });

    const startIndex = (selectedPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const paginatedSelectedStudents = filteredSelectedStudents.slice(startIndex, endIndex);


    /* ================= UI ================= */

    return (
        <>
            {toast?.type === "success" && <SuccessMessage Message={toast.message} />}
            {toast?.type === "error" && <FailedMessage Message={toast.message} />}
            {toast?.type === "warning" && <WarningMessage Message={toast.message} />}

            <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
                <FaArrowLeft
                    size={18}
                    title="Back"
                    onClick={() => navigate("/admin/student")}
                    className="cursor-pointer mb-4"
                />


                <div className="p-5 bg-white rounded-xl shadow-md">

                    <h1 className="text-xl font-bold mb-6">
                        Add Students to Sunday Class
                    </h1>

                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* CLASS SELECT */}

                        <div className="mb-6">

                            <label className="block mb-2 font-semibold">
                                Class & Section
                            </label>

                            <select
                                {...register("class_section", { required: true })}
                                value={selectedClassId}
                                onChange={handleClassChange}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="">Select Class</option>

                                {classOptions.map((cls) => (
                                    <option key={cls._id} value={cls._id}>
                                        {cls.class_name} - {cls.section_name}
                                    </option>
                                ))}
                            </select>

                            {errors.class_section && (
                                <p className="text-red-500 text-sm mt-1">
                                    Class required
                                </p>
                            )}

                        </div>

                        {/* TWO PANEL LAYOUT */}

                        {selectedClass && (

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                                {/* ELIGIBLE MEMBERS */}

                                <div className="border rounded-md flex flex-col h-full">

                                    <div className="p-3 border-b bg-gray-50 text-center">

                                        <div className="font-semibold">
                                            Eligible Members
                                        </div>

                                        <p className="text-xs text-gray-500 mt-1">
                                            Select students to add (Max: {selectedClass.max_students})
                                        </p>

                                    </div>

                                    {/* SEARCH */}

                                    <div className="flex justify-center py-2 border-b bg-white">

                                        <input
                                            type="search"
                                            placeholder="Search..."
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="border rounded px-3 py-1 text-sm w-60"
                                        />

                                    </div>

                                    {/* LIST */}

                                    <div className="relative min-h-[300px]">




                                        {/* LOADER OVERLAY */}
                                        {loadingMembers && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                                                <div className="text-lavender--600 font-medium">
                                                    Loading students...
                                                </div>
                                            </div>
                                        )}
                                        {eligibleMembers.length === 0 ? (

                                            <div className="p-6 text-center text-gray-400">
                                                No members found
                                            </div>

                                        ) : (

                                            eligibleMembers.map((m) => (

                                                <div
                                                    key={m.member_id}
                                                    className="flex justify-between items-center p-3 border-b hover:bg-gray-50"
                                                >

                                                    <div>
                                                        <div className="font-medium">
                                                            {m.member_name}
                                                        </div>

                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {m.member_id} |{" "}
                                                            {m.dob ? moment(m.dob).format("DD-MM-YYYY") : "-"} |{" "}
                                                            {getAge(m.dob)}
                                                        </div>
                                                    </div>

                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.some(
                                                            (s) => s.member_id === m.member_id
                                                        )}

                                                        onChange={() => toggleStudentSelection(m)}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />

                                                </div>

                                            ))

                                        )}

                                    </div>

                                    {/* PAGINATION */}


                                    {totalPages > 1 && (
                                        <div className="border-t p-2">
                                            <Pagination
                                                compact={true}
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                rowsPerPage={rowsPerPage}
                                                rowsInput={eligibleRowsInput}
                                                jumpInput={eligibleJumpInput}
                                                setCurrentPage={setCurrentPage}
                                                setRowsPerPage={setRowsPerPage}
                                                setRowsInput={setEligibleRowsInput}
                                                setJumpInput={setEligibleJumpInput}
                                            />
                                        </div>
                                    )}



                                </div>

                                {/* SELECTED STUDENTS */}

                                <div className="border rounded-md flex flex-col h-full">

                                    <div className="p-3 border-b bg-gray-50 text-center">

                                        <div className="font-semibold">
                                            Selected Students
                                        </div>

                                        <p className="text-xs text-gray-500 mt-1">
                                            {selectedStudents.length} / {selectedClass.max_students} selected
                                        </p>

                                    </div>


                                    <div className="flex justify-center py-2 border-b bg-white">
                                        <input
                                            type="search"
                                            placeholder="Search selected students..."
                                            value={selectedSearch}
                                            onChange={(e) => {
                                                setSelectedSearch(e.target.value);
                                                setSelectedPage(1);
                                            }}
                                            className="border rounded px-3 py-1 text-sm w-60"
                                        />
                                    </div>

                                    <div className="flex-1 overflow-y-auto min-h-[300px]">

                                        {filteredSelectedStudents.length === 0 ? (

                                            <div className="p-6 text-center text-gray-400">
                                                No students selected
                                            </div>

                                        ) : (

                                            paginatedSelectedStudents.map((m) => (

                                                <div
                                                    key={m.member_id}
                                                    className="flex justify-between items-center p-3 border-b hover:bg-gray-50"
                                                >

                                                    <div>

                                                        <div className="font-medium">
                                                            {m.member_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {m.member_id} |{" "}
                                                            {m.dob ? moment(m.dob).format("DD-MM-YYYY") : "-"} |{" "}
                                                            {getAge(m.dob)}
                                                        </div>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleStudentSelection(m)}
                                                        className="text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>

                                                </div>

                                            ))

                                        )}

                                    </div>


                                    {filteredSelectedStudents.length > rowsPerPage && (
                                        <div className="border-t p-2">
                                            <Pagination
                                                compact={true}
                                                currentPage={selectedPage}
                                                totalPages={Math.ceil(filteredSelectedStudents.length / rowsPerPage)}
                                                rowsPerPage={rowsPerPage}
                                                rowsInput={selectedRowsInput}
                                                jumpInput={selectedJumpInput}
                                                setCurrentPage={setSelectedPage}
                                                setRowsPerPage={setRowsPerPage}
                                                setRowsInput={setSelectedRowsInput}
                                                setJumpInput={setSelectedJumpInput}
                                            />
                                        </div>
                                    )}

                                </div>

                            </div>

                        )}

                        {/* ACTION BUTTONS */}

                        {selectedClass && (

                            <div className="flex justify-end mt-6 gap-3">

                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 border rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-5 py-2 text-white rounded
                  ${saving
                                            ? "bg-gray-400"
                                            : "bg-lavender--600 hover:bg-lavender--700"
                                        }
                `}
                                >
                                    {saving ? "Saving..." : "Save Students"}
                                </button>

                            </div>

                        )}

                    </form>

                </div>

            </div>
        </>
    );
};