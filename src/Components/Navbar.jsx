


import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// import { socket } from "../../socket";
import { FaUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { RoleContext } from "./RoleContext";
import { FiBell } from "react-icons/fi";
import churchLogo from "../../src/assets/ChristChurchLogo.jpg";
import axios from "axios";
import { URL } from "../App";

function Navbar() {
  const [user, setUser] = useState({});
  const [open, setOpen] = useState(false);
  const { activeRole, switchRole } = useContext(RoleContext);
  const isMember = activeRole === "member";
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
  const [profile, setProfile] = useState({
    name: "",
    photo: "",
  });
  const [imgError, setImgError] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState([]);


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);


  useEffect(() => {

    const token = sessionStorage.getItem("token");

    if (token) {
      try {

        const decoded = jwtDecode(token);

        setUser({
          memberId: decoded.member_id,
          roles: decoded.roles || [],
        });

        fetchProfile(decoded.member_id, token);

        const storedRole = sessionStorage.getItem("role");

        if (storedRole && decoded.roles.includes(storedRole)) {
          switchRole(storedRole);
        } else {

          const defaultRole = decoded.roles?.[0] || "";

          switchRole(defaultRole);

          sessionStorage.setItem("role", defaultRole);
        }

      } catch (err) {
        console.error("Invalid token", err);
      }
    }

  }, []);







  const defaultRouteByRole = {
    admin: "/admin/dashboard",
    member: "/admin/dashmember",
    sundaysclscretary: "/admin/dashsundayschool",
    pastorprimary: "/admin/pastordashboard",
    couplesecretary: "/admin/couplelist",
    treasurer: "/admin/dashboard",
    accountant: "/admin/accountantdash",
    secretary: "/admin/secretarydash",
    sundaysclaccountant: "/admin/dashsundayschool",
    endeavoursclscretary: "/admin/dashendschool",
    endeavourclaccountant: "/admin/dashendschool",
    youthsecretary: "/admin/youthlist",
    youthaccountant: "/admin/youthlist",
    mensecretary: "/admin/menfellowmembers",
    menaccountant: "/admin/menfellowmembers",
    womensecretary: "/admin/womenfellowmembers",
    womenaccountant: "/admin/womenfellowmembers",
    coupleaccountant: "/admin/couplelist",
    endeavourteacher: "/admin/endeavourteacherdashboard",
    churchofficeworker: "/admin/churchofficeworkerdash",
    officestaff: "/admin/churchofficeworkerdash",
    sundaysclteacher: "/admin/sundayschoolteacherdashboard",
    choirsecretary: "/admin/choirlist",
    choiraccountant: "/admin/choirlist",
    cemeterymanager: "/admin/addcemeteryplots",
  };



  const handleRoleChange = (role) => {

    switchRole(role);
    console.log("Switching role to:", role);
   sessionStorage.setItem("role", role);
    console.log("Navigate to:", defaultRouteByRole[role]);
    navigate(defaultRouteByRole[role] || "/");

    setOpen(false);
  };


  const handleLogout = async () => {

    try {

      const token = sessionStorage.getItem("token");

      if (token) {

        const decoded = jwtDecode(token);

        await axios.post(
          `${URL}/notifications/seen-all`,
          { memberId: decoded.member_id },
          { headers: { Authorization: token } }
        );

      }

    } catch (err) {
      console.error("Mark all seen error:", err);
    }

    sessionStorage.clear();
    navigate("/login");

  };
  // Role label map
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
    { value: "sundaysclaccountant", label: "Sunday School Accountant" },
    { value: "sundaysclteacher", label: "Sunday School Teacher" },
    { value: "endeavoursclscretary", label: "Endeavour Secretary" },
    { value: "endeavourclaccountant", label: "Endeavour Accountant" },
    { value: "endeavourteacher", label: "Endeavour Teacher" },
    { value: "youthsecretary", label: "Youth Secretary" },
    { value: "youthaccountant", label: "Youth Accountant" },
    { value: "mensecretary", label: "Men's Secretary" },
    { value: "menaccountant", label: "Men's Accountant" },
    { value: "womensecretary", label: "Women's Secretary" },
    { value: "womenaccountant", label: "Women's Accountant" },
    { value: "couplesecretary", label: "Couples Secretary" },
    { value: "coupleaccountant", label: "Couples Accountant" },
    { value: "choiraccountant", label: "Choir Accountant" },
    { value: "choirsecretary", label: "Choir Secretary" },
    { value: "cemeterymanager", label: "Cemetery Manager" },
  ];

  const fetchProfile = async (memberId, token) => {
    try {
      const res = await axios.get(
        `${URL}/dashboard/profile?memberId=${encodeURIComponent(memberId)}`,
        { headers: { Authorization: token } }
      );

      setProfile({
        name: res.data.member_name,
        photo: res.data.photo,
      });



    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };



  const fetchNotifications = async (memberId) => {

    try {

      const token = sessionStorage.getItem("token");
      if (!token || !memberId) return;

      const encodedId = encodeURIComponent(memberId);

      const res = await axios.get(
        `${URL}/notifications/member?memberId=${encodedId}`,
        { headers: { Authorization: token } }
      );

      const data = res.data.notifications || [];

      setNotifications(data);

      const unread = data.filter(n => !n.seen);

      setUnreadNotifications(unread);
      setUnreadCount(unread.length);

    } catch (err) {
      console.error("Notification fetch error:", err);
    }

  };

  // useEffect(() => {

  //   if (activeRole !== "member") return;

  //   const token = sessionStorage.getItem("token");
  //   if (!token) return;

  //   const decoded = jwtDecode(token);
  //   const memberId = decoded.member_id;

  //   fetchNotifications(memberId);

  //   // join socket room
  //   socket.emit("join_member", memberId);

  //   const handleNewNotification = (notification) => {

  //     setNotifications(prev => [notification, ...prev]);

  //     setUnreadNotifications(prev => [notification, ...prev]);

  //     setUnreadCount(prev => prev + 1);

  //     window.dispatchEvent(
  //       new CustomEvent("newNotification", { detail: notification })
  //     );

  //   };

  //   socket.on("new_notification", handleNewNotification);

  //   return () => {
  //     socket.off("new_notification", handleNewNotification);
  //   };

  // }, [activeRole]);

  // Helper: Convert role key to readable label
  const getRoleLabel = (role) => {
    const match = roleOptions.find((r) => r.value === role);
    return match ? match.label : role;
  };


  useEffect(() => {
    setImgError(false);
  }, [profile.photo]);



  const timeAgo = (createdAt, updatedAt) => {

    const isEdited = new Date(updatedAt).getTime() !== new Date(createdAt).getTime();

    const baseTime = isEdited ? updatedAt : createdAt;

    const seconds = Math.floor((Date.now() - new Date(baseTime).getTime()) / 1000);

    if (seconds < 60) return isEdited ? "Updated just now" : "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return isEdited ? `Updated ${minutes} minutes ago` : `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24)
      return isEdited ? `Updated ${hours} hours ago` : `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return isEdited ? `Updated ${days} days ago` : `${days} days ago`;

  };
  const handleNotificationClick = async (id) => {

    const token = sessionStorage.getItem("token");
    const decoded = jwtDecode(token);

    try {

      await axios.post(`${URL}/notifications/seen`, {
        notificationId: id,
        memberId: decoded.member_id
      }, {
        headers: { Authorization: token }
      });

    } catch (err) {
      console.error(err);
    }

    // ⭐ update UI instantly
    setUnreadNotifications(prev => prev.filter(n => n._id !== id));
    setUnreadCount(prev => prev - 1);

    setShowBellDropdown(false);

    navigate("/admin/dashmember", {
      state: { highlight: id }
    });

  };


  useEffect(() => {

    const handleOutsideClick = (e) => {

      if (!e.target.closest(".bell-area")) {
        setShowBellDropdown(false);
      }

    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };

  }, []);


  useEffect(() => {

    const handleSeen = (e) => {

      const id = e.detail;

      setUnreadNotifications(prev =>
        prev.filter(n => n._id !== id)
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));

    };

    window.addEventListener("notificationSeen", handleSeen);

    return () => {
      window.removeEventListener("notificationSeen", handleSeen);
    };

  }, []);


  return (
    <nav className="w-full bg-white  border shadow-sm">
      <div className="flex items-center justify-between w-[98%] p-3">
        {/* Left side brand */}
        <Link to="/admin/dashboard" className="flex items-center space-x-4">
          <img
            src={churchLogo}
            alt="CSI Christ Church"
            className="w-16 h-16"
          />
          <h1 className="text-2xl font-semibold text-lavender--600">
            CSI CHRIST CHURCH
          </h1>
        </Link>


        {/* Right side user info */}
        <div className="relative flex items-center space-x-3">
          { }
          {/* <FiBell className="w-6 h-6 text-gray-700 cursor-pointer transition-colors duration-200 hover:text-lavender--600" /> */}

          {/* {isMember && (
            <div
              className="relative bell-area cursor-pointer"
              onClick={() => setShowBellDropdown(!showBellDropdown)}
            >
              <FiBell

                className="w-6 h-6 text-gray-700 cursor-pointer hover:text-lavender--600"
              />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          )} */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            {profile?.photo && !imgError ? (
              <img
                src={`${URL}${profile.photo}`}
                alt="Profile"
                onError={() => setImgError(true)}
                className="w-9 h-9 rounded-full object-cover border-2 border-lavender--600"
              />
            ) : (
              <FaUserCircle className="w-9 h-9 text-lavender--600" />
            )}
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-medium text-gray-900">
                {profile.name || user?.memberId || "Guest"}
              </span>
              <span className="text-xs text-gray-500">
                {getRoleLabel(activeRole) || "No Role"}
              </span>
            </div>
          </button>

          {/* Dropdown */}
          {open && (
            <div ref={dropdownRef} className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border z-50 max-h-[400px] overflow-y-auto">
              {/* Top user info */}
              <div className="px-4 py-3 border-b">
                <span className="block text-sm font-medium text-gray-900">
                  {user?.memberId || "Guest"}
                </span>
                <span className="block text-xs text-gray-500">
                  {getRoleLabel(activeRole) || "No Role"}
                </span>
              </div>

              {/* Role switcher */}
              <div className="py-2">
                {user?.roles?.map((role, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${activeRole === role
                      ? "text-lavender--600 font-semibold"
                      : "text-gray-700"
                      }`}
                  >
                    {getRoleLabel(role)}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div className="border-t">
                <button
                  onClick={() => setShowLogoutModal(true)}

                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}





          {isMember && showBellDropdown && (
            <div className="absolute right-0 top-10 w-80 bg-white border rounded-xl shadow-xl z-50 bell-area overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700">
                  Notifications
                </h4>

                <span className="text-xs text-gray-400">
                  {unreadCount} New
                </span>
              </div>

              {/* Notification List */}
              <div className="max-h-[320px] overflow-y-auto">

                {unreadNotifications.length > 0 ? (
                  unreadNotifications.slice(0, 5).map((note) => {

                    const lastItem = note.items[note.items.length - 1];

                    return (
                      <div
                        key={note._id}
                        onClick={() => {
                          setShowBellDropdown(false);
                          handleNotificationClick(note._id);
                        }}
                        className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      >

                        <div className="flex items-start gap-3">

                          {/* Icon */}
                          <div className="mt-1">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                          </div>

                          {/* Text */}
                          <div className="flex flex-col flex-1">

                            <p className="text-sm font-semibold text-gray-800">
                              {note.heading}
                            </p>

                            <span className="text-xs text-gray-500 mt-1">
                              {timeAgo(note.createdAt, note.updatedAt)}
                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  })
                ) : (

                  <div className="text-center py-8 text-gray-400 text-sm">
                    No new notifications
                  </div>

                )}

              </div>


            </div>
          )}
        </div>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>
            <div className="relative w-full max-w-md max-h-full p-4 z-50">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="absolute top-3 end-2.5 text-[#DB7B7B] bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>

                <div className="p-4 text-center md:p-5">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-[#DB7B7B] dark:text-gray-200"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>

                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Are you sure you want to Log Out?
                  </h3>

                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:text-red-600 hover:border-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>

                  <button

                    onClick={handleLogout}
                    className="text-white ms-3 bg-lavender--600 hover:bg-lavender--800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;



