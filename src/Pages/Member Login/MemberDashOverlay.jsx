import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Confetti from "react-confetti";
import { URL } from "../../App";
import { MemberSubscriptionsModel } from "../../Components/DashModels/MemberSubscriptionsModel";
import MemberProfileModal from "../../Components/DashModels/MemberProfileModel";
import MemberNotificationModel from "../../Components/DashModels/MemberNotificationModel";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import { FaArrowLeft } from "react-icons/fa";
import { FaUser, FaPeopleRoof } from "react-icons/fa6";
import { FaCircleUser } from "react-icons/fa6";
import { FaBible } from "react-icons/fa";

import { MdEvent, MdSchool } from "react-icons/md";
import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaBookOpen } from "react-icons/fa";

import { WiSunrise, WiDaySunny, WiSunset, WiNightClear } from "react-icons/wi";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import churchbg1 from "../../assets/Church/bg1.jpg";
import churchbg2 from "../../assets/Church/bg2.jpg";
import churchbg from "../../assets/Church/bg.jpg";
import churchbg3 from "../../assets/Church/bg3.jpg";
import churchbg4 from "../../assets/Church/bg4.jpg";
import churchbg5 from "../../assets/Church/bg5.jpg";

const churchImages = [
    churchbg1,
    churchbg2,
    churchbg,
    churchbg3,
    churchbg4,
    churchbg5,
];

export const MemberDashOverlay = () => {

    const navigate = useNavigate();
    const { memberId } = useParams();
   const token = sessionStorage.getItem("token");

    const decodedMemberId = decodeURIComponent(memberId || "");


    const location = useLocation();

    const relation = location.state?.relation || "";
    const selectedName = location.state?.name || "";

    const [profile, setProfile] = useState({});
    const [offerings, setOfferings] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [verse, setVerse] = useState(null);
    const [family, setFamily] = useState(null);

    const [memberName, setMemberName] = useState("");
    const [memberTitle, setMemberTitle] = useState("");

    const [imgError, setImgError] = useState(false);

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);

    const [typedGreeting, setTypedGreeting] = useState("");
    const [typedVerse, setTypedVerse] = useState("");
    const [typedReference, setTypedReference] = useState("");

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [memberProfile, setMemberProfile] = useState(null);

    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [womenEvents, setWomenEvents] = useState([]);


    const [choirEvents, setChoirEvents] = useState([]);
    const [coupleEvents, setCoupleEvents] = useState([]);

    const [notifications, setNotifications] = useState([]);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });



    const [dob, setDob] = useState("");
    const [marriageDate, setMarriageDate] = useState("");
    const [celebrationText, setCelebrationText] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);


    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);




    useEffect(() => {

            if (!decodedMemberId || !token) return;

        fetchProfile();
        fetchOfferings();
        fetchSubscriptions();
        fetchVerse();
        fetchMemberName();
        fetchFamily();
        fetchUpcoming();
        fetchNotifications();

    }, [decodedMemberId]);


    const fetchProfile = async () => {
        try {
            const res = await axios.get(
                `${URL}/dashboard/profile?memberId=${encodeURIComponent(decodedMemberId)}`,
                { headers: { Authorization: token } }
            );
            setProfile(res.data);
        } catch (err) {
            console.error(err);
        }
    };


    const fetchMemberName = async () => {
        try {

            const res = await axios.get(
                `${URL}/dashboard/member-name?member_id=${encodeURIComponent(decodedMemberId)}`,
                { headers: { Authorization: token } }
            );

            setMemberName(res.data.name);
            setMemberTitle(res.data.title);
            setDob(res.data.dob);
            setMarriageDate(res.data.marriage_date);

        } catch (err) {
            console.error(err);
        }
    };


    const fetchFamily = async () => {
        try {

            const res = await axios.get(
                `${URL}/dashboard/family-head?memberId=${encodeURIComponent(decodedMemberId)}`,
                { headers: { Authorization: token } }
            );

            if (res.data.isHead) {

                setFamily(res.data.family);

            } else {

                const res2 = await axios.get(
                    `${URL}/dashboard/family-member?memberId=${encodeURIComponent(decodedMemberId)}`,
                    { headers: { Authorization: token } }
                );

                if (res2.data.family_id) {
                    setFamily({ family_id: res2.data.family_id });
                }

            }

        } catch (err) {
            console.error("Family fetch error:", err);
        }
    };


    const fetchOfferings = async () => {

        try {

            const res = await axios.get(
                `${URL}/dashboard/offerings?member_id=${encodeURIComponent(decodedMemberId)}`,
                { headers: { Authorization: token } }
            );

            setOfferings(res.data);

        } catch (err) {
            console.error(err);
        }
    };


    const fetchSubscriptions = async () => {

        try {

            const res = await axios.get(
                `${URL}/dashboard/subscriptions?member_id=${encodeURIComponent(decodedMemberId)}`,
                { headers: { Authorization: token } }
            );

            if (!res.data?.length) {
                setSubscriptions([]);
                return;
            }

            const months = Object.entries(res.data[0].months);

            const result = months
                .map(([month, val], i) => ({
                    sl: i + 1,
                    month: month.charAt(0).toUpperCase() + month.slice(1),
                    total: val.total
                }))
                .filter((m) => m.total > 0);

            setSubscriptions(result);

        } catch (err) {
            console.error(err);
        }
    };


    const fetchVerse = async () => {

        try {

            const res = await axios.get(
                `${URL}/dashboard/daily-verse?memberId=${encodeURIComponent(decodedMemberId)}`,
                { headers: { Authorization: token } }
            );

            setVerse(res.data);

        } catch (err) {
            console.error(err);
        }
    };


    const fetchMemberProfile = async (memberId) => {
        try {

            const res = await axios.get(
                `${URL}/dashboard/member?memberId=${encodeURIComponent(memberId)}`,
                { headers: { Authorization: token } }
            );

            setMemberProfile(res.data.data);
            setIsProfileOpen(true);

        } catch (err) {
            console.error(err);
        }
    };



    const fetchUpcoming = async () => {
        try {
            const res = await axios.get(
                `${URL}/dashboard/upcoming?memberId=${encodeURIComponent(decodedMemberId)}`,
                { headers: { Authorization: token } }
            );

            const data = res.data;

            setUpcomingEvents(data.sundaySchoolEvents || []);
            setUpcomingExams(data.sundaySchoolExams || []);
            setWomenEvents(data.womenEvents || []);
            setChoirEvents(data.choirEvents || []);
            setCoupleEvents(data.coupleEvents || []);
        } catch (err) {
            console.error("Upcoming fetch error", err);
        }
    };


    const fetchNotifications = async () => {

        try {

            const res = await axios.get(
                `${URL}/dashboard/notifications`,
                { headers: { Authorization: token } }
            );

            setNotifications(res.data.notifications || []);

        } catch (err) {

            console.error("Notification fetch error", err);

        }

    };

    const getShortTitle = (title) => {
        switch (title) {
            case "Mister":
                return "Mr";
            case "Master":
                return "Mas";
            case "Miss":
                return "Ms";
            case "Mrs":
                return "Mrs";
            default:
                return "";
        }
    };



    const getGreetingData = () => {

        const hour = new Date().getHours();

        if (hour >= 5 && hour < 10)
            return { text: "Good Morning", icon: <WiSunrise size={34} /> };

        if (hour >= 10 && hour < 12)
            return { text: "Good Forenoon", icon: <WiDaySunny size={34} /> };

        if (hour >= 12 && hour < 16)
            return { text: "Good Afternoon", icon: <WiDaySunny size={34} /> };

        if (hour >= 16 && hour < 19)
            return { text: "Good Evening", icon: <WiSunset size={34} /> };

        return { text: "Good Night", icon: <WiNightClear size={34} /> };
    };

    const greetingData = getGreetingData();
    const greetingText = `${greetingData.text}, ${getShortTitle(memberTitle)} ${memberName}`;

    useEffect(() => {
        if (!memberName) return;

        let i = 0;
        setTypedGreeting("");

        const typing = setInterval(() => {
            setTypedGreeting(greetingText.slice(0, i));
            i++;

            if (i > greetingText.length) clearInterval(typing);
        }, 30);

        return () => clearInterval(typing);

    }, [memberName, memberTitle]);

    useEffect(() => {

        if (!verse?.sentence) return;

        let i = 0;
        const verseText = verse.sentence;
        const refText = `${verse.book} ${verse.chapter}:${verse.verse}`;

        const interval = setInterval(() => {

            setTypedVerse(verseText.slice(0, i + 1));

            if (i < refText.length) {
                setTypedReference(refText.slice(0, i + 1));
            }

            i++;

            if (i >= verseText.length && i >= refText.length) {
                clearInterval(interval);
            }

        }, 25);

        return () => clearInterval(interval);

    }, [verse]);





    const calculateYears = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);

        let years = today.getFullYear() - date.getFullYear();

        const m = today.getMonth() - date.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            years--;
        }

        return years;
    };


    useEffect(() => {

        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();

        // Birthday
        if (dob) {
            const birth = new Date(dob);
            const birthMonth = birth.getMonth() + 1;
            const birthDay = birth.getDate();

            if (birthMonth === todayMonth && birthDay === todayDate) {

                const age = calculateYears(dob);

                setCelebrationText(`🎂 Happy ${age}th Birthday!`);
                setShowConfetti(true);

                return;
            }
        }

        // Anniversary
        if (marriageDate) {

            const marriage = new Date(marriageDate);
            const mMonth = marriage.getMonth() + 1;
            const mDay = marriage.getDate();

            if (mMonth === todayMonth && mDay === todayDate) {

                const years = calculateYears(marriageDate);

                setCelebrationText(`💍 Happy ${years}th Wedding Anniversary!`);
                setShowConfetti(true);

            }
        }

    }, [dob, marriageDate]);

    const hasFamilyPhoto = family?.photo && family.photo.trim() !== "";

    useEffect(() => {

        if (showConfetti) {
            setTimeout(() => {
                setShowConfetti(false);
            }, 6000);
        }

    }, [showConfetti]);

    useEffect(() => {

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);

    }, []);


    const openNotificationModal = (notification) => {
        setSelectedNotification(notification);
        setIsNotificationModalOpen(true);
    };


    return (



        <>

            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    numberOfPieces={300}
                    recycle={false}
                />
            )}
            <div className="bg-gray-50 min-h-screen">

                {/* HEADER */}
                <div className="flex items-center gap-4 p-4 ">

                    <button
                        onClick={() => navigate(-1)}
                        className="text-xl text-lavender--600"
                    >
                        <FaArrowLeft />
                    </button>

                    <h2 className="text-xl font-bold text-lavender--600">
                        {relation && `${relation} - `}{selectedName || memberName}
                    </h2>

                </div>

                <div className="p-6 text-gray-800">

                    {/* HERO */}
                    <div className="mb-6 space-y-6">




                        {/* GREETING + VERSE */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Greeting */}

                            <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-lavender--600 flex items-center min-h-[160px]">

                                {/* Greeting */}
                                <div className="flex items-center gap-3">

                                    <div className="p-3 rounded-xl flex items-center justify-center">

                                        {profile?.photo && !imgError ? (
                                            <img
                                                src={`${URL}${profile.photo}`}
                                                onError={() => setImgError(true)}
                                                onClick={() => fetchMemberProfile(decodedMemberId)}
                                                alt="Profile"
                                                className="w-16 h-16 rounded-full object-cover border-2 border-lavender--600 cursor-pointer"
                                                title="View Profile Info"
                                            />
                                        ) : (
                                            <FaCircleUser
                                                onClick={() => fetchMemberProfile(decodedMemberId)}
                                                className="w-16 h-16 text-lavender--600 cursor-pointer"
                                            />
                                        )}

                                    </div>

                                    {/* Greeting Text */}
                                    <div className="flex flex-col justify-center">

                                        <span className="font-bold text-lavender--600 text-xl">
                                            {greetingData.text}
                                        </span>


                                        {celebrationText && (
                                            <div className="mt-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold animate-bounce w-fit">
                                                {celebrationText}
                                            </div>
                                        )}

                                        <h1 className="text-lavender--600 text-2xl md:text-3xl font-bold tracking-wide">
                                            {getShortTitle(memberTitle)} {memberName}
                                            <span className="animate-pulse ml-1">|</span>
                                        </h1>

                                        <div className="mt-1 grid grid-cols-2 items-center text-sm text-lavender--600">

                                            <div className="flex items-center gap-2">
                                                <FaUser className="mt-[1px] text-lavender--600" />
                                                <span className="text-gray-700">{decodedMemberId}</span>
                                            </div>


                                            {family?.family_id && (
                                                <div className="flex items-center gap-2">
                                                    <FaPeopleRoof className="mt-[1px] text-lavender--600" />
                                                    <span className="text-gray-700">{family?.family_id || "-"}</span>
                                                </div>)}

                                        </div>

                                    </div>

                                </div>

                            </div>






                            {/* Verse */}
                            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-lavender--600">

                                <div className="flex items-center gap-3 mb-3">

                                    <h2 className="font-bold text-lavender--600 text-xl">
                                        Verse of the Day
                                    </h2>
                                </div>
                                {verse && (
                                    <>
                                        <p
                                            className="text-gray-700 leading-relaxed min-h-[80px] font-semibold tracking-wide text-[15px] text-center italic"
                                            style={{ fontFamily: "Times New Roman, serif" }}
                                        >
                                            {typedVerse}
                                            <span className="animate-pulse">|</span>
                                        </p>

                                        <p
                                            className="text-center text-lg text-gray-700 mt-2 font-bold"
                                            style={{ fontFamily: "Times New Roman, serif" }}
                                        >
                                            {typedReference}
                                        </p>
                                    </>
                                )}

                            </div>

                        </div>

                    </div>



                    {/* SUBSCRIPTIONS + OFFERINGS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                        {/* Subscriptions */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-lavender--600">

                            <div className="flex items-center justify-between mb-4">
                                <h5 className="font-semibold text-lavender--600">
                                    Subscriptions
                                </h5>

                                <button
                                    onClick={() => setIsSubModalOpen(true)}
                                    className="text-sm font-semibold text-lavender--600"
                                >
                                    View
                                </button>
                            </div>

                            <div className="overflow-x-auto mt-4">

                                <table className="w-full text-sm text-gray-500">

                                    <thead className="text-base text-gray-700">
                                        <tr>
                                            <th className="p-2 text-center">Sl</th>
                                            <th className="p-2 text-center">Month</th>
                                            <th className="p-2 text-center">Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {subscriptions.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center p-4 text-gray-400">
                                                    No subscriptions
                                                </td>
                                            </tr>
                                        )}

                                        {subscriptions.map((s, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="p-2 text-center">{index + 1}</td>
                                                <td className="p-2 text-center">{s.month}</td>
                                                <td className="p-2 text-center">₹{s.total}</td>
                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* Offerings */}
                        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 border-2 border-lavender--600">

                            <h5 className="font-semibold text-lavender--600">
                                Offerings Paid
                            </h5>

                            <div className="overflow-x-auto mt-4">

                                <table className="w-full text-sm text-gray-500">

                                    <thead className="text-base text-gray-700">
                                        <tr>
                                            <th className="p-2 text-center">Category</th>
                                            <th className="p-2 text-center">Date</th>
                                            <th className="p-2 text-center">Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {offerings.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4 text-gray-400">
                                                    No offerings
                                                </td>
                                            </tr>
                                        )}

                                        {offerings.map((o, i) => (
                                            <tr key={i} className="border-b hover:bg-gray-50">
                                                <td className="p-2 text-center">{o.category}</td>
                                                <td className="p-2 text-center">
                                                    {moment(o.date).format("DD-MM-YYYY")}
                                                </td>
                                                <td className="p-2 text-center">₹{o.amount}</td>
                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>


                    <MemberSubscriptionsModel
                        isOpen={isSubModalOpen}
                        onClose={() => setIsSubModalOpen(false)}
                        memberId={decodedMemberId}
                    />

                    <MemberProfileModal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        member={memberProfile}
                    />

                    {/* FUTURE SECTIONS */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-lavender--600">

                            <h5 className="font-semibold text-lavender--600 mb-4">
                                Notifications
                            </h5>

                            <div className="space-y-3 max-h-[250px] overflow-y-auto">

                                {notifications.length > 0 ? (

                                    notifications.map((note, index) => (

                                        <div
                                            key={index}
                                            className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-600"
                                        >

                                            {/* Heading */}
                                            <div
                                                onClick={() => openNotificationModal(note)}
                                                className="font-semibold text-gray-800 mb-3">
                                                {note.heading}
                                            </div>

                                        </div>

                                    ))

                                ) : (

                                    <p className="text-gray-400 text-sm">
                                        No notifications
                                    </p>

                                )}

                            </div>

                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-lavender--600">
                            Sunday Service Notes
                        </div>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                        <div className="bg-white rounded-lg shadow-sm p-6"></div>
                        <div className="bg-white rounded-lg shadow-sm p-6"></div>
                        <div className="bg-white rounded-lg shadow-sm p-6"></div>

                    </div>


                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                        {/* EVENTS */}
                        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 border-2 border-lavender--600">

                            <div className="flex items-center gap-2 mb-4">
                                <MdEvent className="text-xl text-lavender--600" />
                                <h5 className="font-semibold text-lavender--600 text-lg">
                                    Upcoming Events
                                </h5>
                            </div>

                            <div className="space-y-3">

                                {upcomingEvents.map((event, i) => (
                                    <div
                                        key={i}
                                        className="border rounded-lg p-4 hover:shadow-md transition bg-gray-50"
                                    >

                                        <div className="flex items-start justify-between">

                                            <div>
                                                <div className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <FaBookOpen className="text-lavender--600" />
                                                    {event.eventName}
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <FaCalendarAlt />
                                                    {moment(event.eventDate).format("DD MMM YYYY")}
                                                </div>

                                                {event.venue && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                        <FaMapMarkerAlt />
                                                        {event.venue}
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                    </div>
                                ))}

                                {womenEvents.map((event, i) => (
                                    <div
                                        key={`w${i}`}
                                        className="border rounded-lg p-4 bg-pink-50 hover:shadow-md transition"
                                    >
                                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                                            <MdSchool className="text-pink-500" />
                                            {event.eventName}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <FaCalendarAlt />
                                            {moment(event.eventDate).format("DD MMM YYYY")}
                                        </div>
                                    </div>
                                ))}

                                {choirEvents.map((event, i) => {

                                    // Find competition where this member participates
                                    const participantData = event.choirCompetitions
                                        ?.flatMap(comp =>
                                            comp.participants?.map(p => ({
                                                ...p,
                                                competition: comp.competition,
                                                title: comp.title
                                            }))
                                        )
                                        ?.find(p => p.member_id === decodedMemberId);

                                    return (
                                        <div
                                            key={`c${i}`}
                                            className="border rounded-lg p-4 bg-purple-50 hover:shadow-md transition"
                                        >

                                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                                                <FaBookOpen className="text-purple-600" />
                                                {event.eventName}
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <FaCalendarAlt />
                                                {moment(event.eventDate).format("DD MMM YYYY")}
                                            </div>

                                            {event.venue && (
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                    <FaMapMarkerAlt />
                                                    {event.venue}
                                                </div>
                                            )}

                                            {/* If Member Participated */}
                                            {participantData && (
                                                <div className="mt-3 space-y-2">

                                                    <div className="text-xs text-gray-600">
                                                        <span className="font-semibold">
                                                            {participantData.competition}
                                                        </span>
                                                        {" - "}
                                                        {participantData.title}
                                                    </div>

                                                    {/* Prize Badge */}
                                                    {participantData.prize ? (
                                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
                                                            🏆 {participantData.prize} Prize
                                                        </span>
                                                    ) : (
                                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                            Participated
                                                        </span>
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    );
                                })}

                                {coupleEvents.map((event, i) => {

                                    const participantData = event.participantData;

                                    const getMedalIcon = (prize) => {
                                        if (prize === "1st") return "🥇";
                                        if (prize === "2nd") return "🥈";
                                        if (prize === "3rd") return "🥉";
                                        return "🏆";
                                    };

                                    return (
                                        <div
                                            key={`cp${i}`}
                                            className="border rounded-lg p-4 bg-orange-50 hover:shadow-md transition"
                                        >

                                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                                                <FaPeopleRoof className="text-orange-600" />
                                                {event.eventName}
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <FaCalendarAlt />
                                                {moment(event.eventDate).format("DD MMM YYYY")}
                                            </div>

                                            {event.venue && (
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                    <FaMapMarkerAlt />
                                                    {event.venue}
                                                </div>
                                            )}

                                            {participantData && (
                                                <div className="mt-3 space-y-2">

                                                    <div className="text-xs text-gray-600">
                                                        <span className="font-semibold">
                                                            {participantData.competition}
                                                        </span>
                                                        {" - "}
                                                        {participantData.title}
                                                    </div>

                                                    {participantData.prize ? (
                                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
                                                            {getMedalIcon(participantData.prize)} {participantData.prize} Prize
                                                        </span>
                                                    ) : (
                                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                            Participated
                                                        </span>
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    );
                                })}



                                {upcomingEvents.length === 0 &&
                                    womenEvents.length === 0 &&
                                    choirEvents.length === 0 &&
                                    coupleEvents.length === 0 && (
                                        <p className="text-gray-400 text-sm">No upcoming events</p>
                                    )}

                            </div>
                        </div>


                        {/* EXAMS */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-lavender--600">

                            <div className="flex items-center gap-2 mb-4">
                                <FaTrophy className="text-lavender--600" />
                                <h5 className="font-semibold text-lavender--600 text-lg">
                                    Upcoming Exams
                                </h5>
                            </div>

                            <div className="space-y-3">

                                {upcomingExams.map((exam, i) => {

                                    const student = exam?.classExams
                                        ?.flatMap(c => c.participants)
                                        ?.find(p => p.member_id === decodedMemberId);

                                    return (
                                        <div
                                            key={i}
                                            className="border rounded-lg p-4 hover:shadow-md transition bg-gray-50"
                                        >

                                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                                                <FaBookOpen className="text-lavender--600" />
                                                {exam.examName}
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <FaCalendarAlt />
                                                {moment(exam.examDate).format("DD MMM YYYY")}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                <FaMapMarkerAlt />
                                                {exam.examcenter}
                                            </div>

                                            {/* Marks Section */}
                                            <div className="mt-3 flex items-center justify-between">

                                                <span className="text-xs text-gray-500">
                                                    Student Result
                                                </span>

                                                {student?.marks !== null && student?.marks !== undefined ? (
                                                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                        {student.marks} Marks
                                                    </span>
                                                ) : (
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                        Pending
                                                    </span>
                                                )}

                                            </div>

                                        </div>
                                    );
                                })}

                                {upcomingExams.length === 0 && (
                                    <p className="text-gray-400 text-sm">No upcoming exams</p>
                                )}

                            </div>

                        </div>

                    </div>



                </div>


                <MemberNotificationModel
                    isOpen={isNotificationModalOpen}
                    onClose={() => setIsNotificationModalOpen(false)}
                    notification={selectedNotification}
                />

            </div>

        </>
    );
};