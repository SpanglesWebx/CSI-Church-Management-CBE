


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { URL } from "../../App";
import moment from "moment";
import Modal from "../../Components/Expense/SubscriptionModal";
import MemberProfileModal from "../../Components/DashModels/MemberProfileModel";
import { MemberSubscriptionsModel } from "../../Components/DashModels/MemberSubscriptionsModel";

import ExpenseFormModal from "../../Components/Expense/ExpenseFormModal";

import MemberNotificationModel from "../../Components/DashModels/MemberNotificationModel";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import { FaUser, FaPeopleRoof, FaCircleUser } from "react-icons/fa6";
import { FaBible } from "react-icons/fa";
import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaBookOpen } from "react-icons/fa";
import { MdEvent, MdSchool } from "react-icons/md";

import { WiSunrise, WiDaySunny, WiSunset, WiNightClear } from "react-icons/wi";
import Confetti from "react-confetti";




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

export const MemberDash = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const highlightId = location.state?.highlight;

  const [offerings, setOfferings] = useState([]);
  const [memberInfo, setMemberInfo] = useState({ member_id: "", name: "" });
  const token = sessionStorage.getItem("token");
  const [memberName, setMemberName] = useState("");
  const hours = new Date().getHours();
  // const greeting = hours < 12 ? "Good Morning" : hours < 17 ? "Good Afternoon" : "Good Evening";
  const [family, setFamily] = useState(null);
  const [isHead, setIsHead] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionYears, setSubscriptionYears] = useState([]);
  const [verse, setVerse] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [memberTitle, setMemberTitle] = useState("");
  const [typedWelcome, setTypedWelcome] = useState("");
  const [typedGreeting, setTypedGreeting] = useState("");
  const [welcomeLoop, setWelcomeLoop] = useState(0);
  const [greetingLoop, setGreetingLoop] = useState(0);
  const [imgError, setImgError] = useState(false);

  const [dob, setDob] = useState("");
  const [marriageDate, setMarriageDate] = useState("");
  const [celebrationText, setCelebrationText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);


  const prefix = "Welcome back to CSI Christ Church, ";
  const namePart = `${memberTitle ? memberTitle + " " : ""}${memberName}`;
  const fullText = prefix + namePart;


  const [typedSubText, setTypedSubText] = useState("");
  const [subLoop, setSubLoop] = useState(0);
  const [typedVerse, setTypedVerse] = useState("");
  const [typedReference, setTypedReference] = useState("");
  const [verseLoop, setVerseLoop] = useState(0);


  const [previewImage, setPreviewImage] = React.useState(null);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [womenEvents, setWomenEvents] = useState([]);
  const [womenActivities, setWomenActivities] = useState([]);


  const [choirEvents, setChoirEvents] = useState([]);
  const [coupleEvents, setCoupleEvents] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [seenSet, setSeenSet] = useState(new Set());


  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);


  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });


  const subText = "We're glad to see you again...!";

  const [profile, setProfile] = useState({
    name: "",
    photo: ""
  });


  const defaultMonth = {
    allocations: [],
    total: 0
  };


  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [memberProfile, setMemberProfile] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  useEffect(() => {
    if (!memberName) return;

    let i = 0;
    setTypedWelcome("");

    const typing = setInterval(() => {
      setTypedWelcome(fullText.slice(0, i));
      i++;

      if (i > fullText.length) clearInterval(typing);
    }, 35);

    return () => clearInterval(typing);
  }, [welcomeLoop, memberName, memberTitle]);



  useEffect(() => {
    if (!memberName) return;

    let i = 0;
    setTypedGreeting("");

    const timer = setInterval(() => {
      setTypedGreeting(greetingText.slice(0, i));
      i++;

      if (i > greetingText.length) clearInterval(timer);
    }, 30);

    return () => clearInterval(timer);
  }, [greetingLoop, memberName, memberTitle]);




  useEffect(() => {
    let i = 0;
    setTypedSubText("");

    const typing = setInterval(() => {
      setTypedSubText(subText.slice(0, i));
      i++;

      if (i > subText.length) clearInterval(typing);
    }, 35);

    return () => clearInterval(typing);
  }, [subLoop]);








  const handleOpenModal = () => {
    if (memberInfo.member_id) {
      fetchFullYearSubscriptions(memberInfo.member_id);
      setIsModalOpen(true);
    } else {
      console.error("Member ID missing");
    }
  };



  const getGreetingData = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 10)
      return {
        text: "Good Morning",
        icon: <WiSunrise size={34} />
      };

    if (hour >= 10 && hour < 12)
      return {
        text: "Good Forenoon",
        icon: <WiDaySunny size={34} />
      };

    if (hour >= 12 && hour < 16)
      return {
        text: "Good Afternoon",
        icon: <WiDaySunny size={34} />
      };

    if (hour >= 16 && hour < 19)
      return {
        text: "Good Evening",
        icon: <WiSunset size={34} />
      };

    return {
      text: "Good Night",
      icon: <WiNightClear size={34} />
    };
  };


  const greetingData = getGreetingData();

  const greetingText = `${greetingData.text}, ${memberTitle ? memberTitle + " " : ""
    }${memberName}`;


  const handleCloseModal = () => setIsModalOpen(false);


  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        const memberId = decoded.member_id;
        setMemberInfo({
          member_id: memberId,
          name: decoded.member_name || "Member",
        });

        // Fetch offerings for this member
        fetchMemberName(memberId);
        fetchMemberOfferings(memberId);
        fetchFamilyIfHead(memberId);
        fetchMemberSubscriptions(memberId);
        fetchDailyVerse(memberId);
        fetchProfile(memberId, token);
        fetchUpcoming(memberId);
        fetchNotifications();
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);


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

  const fetchMemberOfferings = async (memberId) => {
    try {
      const res = await axios.get(
        `${URL}/dashboard/offerings?member_id=${encodeURIComponent(memberId)}`,
        { headers: { Authorization: token } }
      );
      setOfferings(res.data);
    } catch (error) {
      console.error("Error fetching member offerings:", error);
    }
  };

  const fetchMemberName = async (memberId) => {
    try {
      const res = await axios.get(
        `${URL}/dashboard/member-name?member_id=${encodeURIComponent(memberId)}`,
        { headers: { Authorization: token } }
      );
      setMemberName(res.data.name);
      setMemberTitle(res.data.title);
      setDob(res.data.dob);
      setMarriageDate(res.data.marriage_date);
    } catch (error) {
      console.error("Error fetching member name:", error);
    }
  };

  const fetchFamilyIfHead = async (memberId) => {
    try {
      const res = await axios.get(
        `${URL}/dashboard/family-head?memberId=${encodeURIComponent(memberId)}`,
        {
          headers: { Authorization: token },
        }
      );

      if (res.data.isHead) {
        setIsHead(true);
        setFamily(res.data.family);
      } else {
        setIsHead(false);
        fetchFamilyIdIfNotHead(memberId);
      }
    } catch (error) {
      console.error("Error fetching family info:", error);
    }
  };

  const fetchFamilyIdIfNotHead = async (memberId) => {
    try {
      const res = await axios.get(
        `${URL}/dashboard/family-member?memberId=${encodeURIComponent(memberId)}`,
        { headers: { Authorization: token } }
      );

      if (res.data.family_id) {
        setFamily({ family_id: res.data.family_id });
      }
    } catch (error) {
      console.error("Error fetching family ID for non-head:", error);
    }
  };

  const fetchMemberSubscriptions = async (memberId) => {
    try {

      const encodedId = encodeURIComponent(memberId);

      const res = await axios.get(
        `${URL}/dashboard/subscriptions?member_id=${encodedId}`,
        { headers: { Authorization: token } }
      );

      const data = res.data;

      if (!data || data.length === 0) {
        setSubscriptions([]);
        return;
      }

      const monthsData = data[0].months;

      const financialMonths = [
        "april", "may", "june", "july", "august", "september",
        "october", "november", "december", "january", "february", "march"
      ];

      const result = financialMonths
        .map((month) => ({
          month: month.charAt(0).toUpperCase() + month.slice(1),
          total: monthsData?.[month]?.total || 0
        }))
        .filter(m => m.total > 0)   // ⭐ hide zero months
        .map((m, i) => ({
          sl: i + 1,
          ...m
        }));

      setSubscriptions(result);

    } catch (err) {
      console.error(err);
    }
  };



  const fetchFullYearSubscriptions = async (memberId) => {
    try {
      const res = await axios.get(`${URL}/dashboard/subscriptions?member_id=${encodeURIComponent(memberId)}`, {
        headers: { Authorization: token },
      });

      const data = res.data;
      if (!data || data.length === 0) return;

      // ✅ Determine current and previous financial year
      const currentYear =
        new Date().getMonth() >= 3
          ? new Date().getFullYear()
          : new Date().getFullYear() - 1;

      const filtered = data.filter(
        (d) => d.year === currentYear || d.year === currentYear - 1
      );

      // ✅ Financial year months (Apr → Mar)
      const monthsOrder = [
        "april", "may", "june", "july", "august", "september",
        "october", "november", "december", "january", "february", "march",
      ];

      // ✅ Format each year's data
      const formatted = filtered.map((yearObj) => {

        const monthsArr = monthsOrder.map((m, idx) => {
          const details = yearObj.months[m] || {};
          const monthData = {
            sl: idx + 1,
            month: m.charAt(0).toUpperCase() + m.slice(1),
            date: details?.date ? new Date(details.date).toLocaleDateString() : "-",
            total: details?.total || 0,
            status: (details?.total || 0) > 0 ? "Paid" : "Unpaid",
          };

          // ✅ Copy all category amounts (so the table can show them)
          categories.forEach((cat) => {
            monthData[cat] = Number(details[cat] || 0);
          });

          return monthData;
        });

        return { year: yearObj.year, months: monthsArr };
      });

      setSubscriptionYears(formatted);
    } catch (err) {
      console.error("Error fetching full-year subscriptions:", err);
    }
  };


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



  const fetchUpcoming = async (memberId) => {
    try {

      const res = await axios.get(
        `${URL}/dashboard/upcoming?memberId=${encodeURIComponent(memberId)}`,
        { headers: { Authorization: token } }
      );

      const data = res.data;

      setUpcomingEvents(data.sundaySchoolEvents || []);
      setUpcomingExams(data.sundaySchoolExams || []);
      setWomenEvents(data.womenEvents || []);
      setWomenActivities(data.womenActivities || []);
      setChoirEvents(data.choirEvents || []);
      setCoupleEvents(data.coupleEvents || []);

    } catch (error) {
      console.error("Upcoming fetch error", error);
    }
  };


  const fetchNotifications = async () => {
    try {

      const res = await axios.get(`${URL}/dashboard/notifications`, {
        headers: { Authorization: token }
      });

      const decoded = jwtDecode(token);
      const memberId = decoded.member_id;

      const notificationsData = (res.data.notifications || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));




      setNotifications(notificationsData);

    } catch (error) {
      console.error("Notification fetch error", error);
    }
  };


  useEffect(() => {
    fetchNotifications();
  }, []);

  const months = [
    "april", "may", "june", "july", "august", "september",
    "october", "november", "december", "january", "february", "march",
  ];

  const categories = [
    "monthlySubscriptionOffering", "buildingFund", "missionarySponsorship", "decimalPart",
    "ims", "fmpb", "nms", "iem", "vishwavani", "bym", "dbm", "cgmm",
    "cmm", "ymm", "bibleSociety", "womensMinistry", "educationalAssistance",
    "helpThePoor", "medicalAssistance", "harvestAuction", "total",
  ];

  const labels = {
    monthlySubscriptionOffering: "Monthly Subscription Offering",
    buildingFund: "Building Fund",
    missionarySponsorship: "Missionary Sponsorship",
    decimalPart: "Decimal Part 1/10th",
    ims: "IMS",
    fmpb: "FMPB",
    nms: "NMS",
    iem: "IEM",
    vishwavani: "VISHWAVANI",
    bym: "BYM",
    dbm: "DBM",
    cgmm: "CGMM",
    cmm: "CMM",
    ymm: "YMM",
    bibleSociety: "Bible Society",
    womensMinistry: "Women's Ministry",
    educationalAssistance: "Educational Assistance",
    helpThePoor: "Help the Poor",
    medicalAssistance: "Medical Assistance",
    harvestAuction: "Harvest Auction",
    total: "Total",
  };


  const fetchDailyVerse = async (memberId) => {
    try {
      const res = await axios.get(
        `${URL}/dashboard/daily-verse?memberId=${encodeURIComponent(memberId)}`,
        {
          headers: { Authorization: token },
        }
      );

      setVerse(res.data);
    } catch (error) {
      console.error("Verse fetch error", error);
    }
  };


  useEffect(() => {
    if (!verse?.sentence) return;

    let i = 0;
    setTypedVerse("");

    const typing = setInterval(() => {
      setTypedVerse(verse.sentence.slice(0, i));
      i++;

      if (i > verse.sentence.length) clearInterval(typing);
    }, 25);

    return () => clearInterval(typing);
  }, [verseLoop, verse]);

  useEffect(() => {
    if (!verse?.book || !verse?.chapter || !verse?.verse) return;

    const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;

    let i = 0;
    setTypedReference("");

    const typing = setInterval(() => {
      setTypedReference(reference.slice(0, i));
      i++;

      if (i > reference.length) clearInterval(typing);
    }, 40);

    return () => clearInterval(typing);
  }, [verseLoop, verse]);


  useEffect(() => {
    setImgError(false);
  }, [profile?.photo]);


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




  useEffect(() => {

    if (!highlightId) return;

    const el = document.getElementById(highlightId);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

  }, [highlightId]);



  useEffect(() => {

    const observer = new IntersectionObserver(
      (entries) => {

        entries.forEach(async (entry) => {

          if (entry.isIntersecting) {

            const id = entry.target.id;

            if (seenSet.has(id)) return;

            setSeenSet(prev => new Set(prev).add(id));

            try {

              const token = sessionStorage.getItem("token");

              const decoded = jwtDecode(token);

              await axios.post(`${URL}/notifications/seen`, {
                notificationId: id,
                memberId: decoded.member_id
              }, {
                headers: { Authorization: token }
              });


              // ⭐ notify navbar
              window.dispatchEvent(
                new CustomEvent("notificationSeen", { detail: id })
              );

            } catch (err) {
              console.error("Seen update error", err);
            }

          }

        });

      },
      {
        threshold: 0.6   // seen when 60% visible
      }
    );

    const elements = document.querySelectorAll(".notification-item");

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();

  }, [notifications]);






  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);
  };



  const handleFamilyPreview = (path) => {

    const imageUrl = `${URL}${path}`;

    const img = new Image();

    img.onload = () => {
      setPreviewImage(imageUrl); // image exists
    };

    img.onerror = () => {
      console.log("Image not found in backend uploads folder");
      // do nothing → preview will not open
    };

    img.src = imageUrl;

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


      <div className="bg-gray-50 p-6 text-gray-800">
        {/* Greeting */}

        <div className="mb-6 space-y-6">

          {/* HERO CAROUSEL */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg ">


            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              effect="fade"
              loop
              className="h-[220px] sm:h-[260px] md:h-[300px] lg:h-[340px]"
            >
              {churchImages.map((img, i) => (
                <SwiperSlide key={i}>
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

          </div>



          {/* SECOND ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Greeting Card */}

            <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-lavender--600 flex items-center min-h-[160px]">

              <div className="flex items-center gap-5 w-full">

                <div className="p-3 rounded-xl flex items-center justify-center">
                  {profile?.photo && !imgError ? (
                    <img
                      src={`${URL}${profile.photo}`}
                      onError={() => setImgError(true)}
                      onClick={() => fetchMemberProfile(memberInfo.member_id)}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-lavender--600"
                      title="View Profile"
                    />
                  ) : (
                    <FaCircleUser
                      onClick={() => fetchMemberProfile(memberInfo.member_id)}
                      className="w-16 h-16 text-lavender--600"
                      title="View Profile"
                    />
                  )}
                </div>

                <div className="flex flex-col justify-center gap-1">

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

                  <div className="flex items-center gap-5 text-sm text-lavender--600 mt-1">

                    <div className="flex items-center gap-2">
                      <FaUser className="mt-[1px]" />
                      <span className="text-gray-700">{memberInfo.member_id}</span>
                    </div>

                    {family?.family_id && (
                      <div className="flex items-center gap-2">
                        <FaPeopleRoof className="mt-[1px]" />
                        <span className="text-gray-700">{family.family_id}</span>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>





            {/* Scripture */}

            <div className="bg-white rounded-2xl shadow-md p-6  flex flex-col justify-center border-2 border-lavender--600">

              <div className="flex items-center gap-3 mb-3">


                <h2 className="font-bold text-lavender--600 text-xl">
                  Verse of the Day
                </h2>

              </div>

              {/* Verse */}
              <p
                className="text-gray-700 leading-relaxed min-h-[80px] font-semibold tracking-wide text-[15px] text-center italic font-serif"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {typedVerse}
                <span className="animate-pulse">|</span>
              </p>

              {/* Reference */}
              <p
                className="text-center text-xl text-gray-700 mt-2  font-bold "
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {typedReference}
              </p>

            </div>

          </div>

        </div>








        {isHead && (

          <div
            className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-lavender--600">



            <div className="flex items-center justify-between mb-3">

              <h5

                className="font-semibold text-lavender--600">
                Family
              </h5>

              {/* FAMILY PHOTO */}
              {hasFamilyPhoto && (
                <div
                  className="cursor-pointer"
                  // onClick={() => setPreviewImage(`${URL}${family.photo}`)}
                  onClick={() => handleFamilyPreview(family.photo)}
                >
                  {!imageErrors["familyPhoto"] ? (
                    <img
                      src={`${URL}${family.photo}`}
                      alt="Family"
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          familyPhoto: true,
                        }))
                      }
                      className="w-12 h-12 rounded-lg object-cover border-2 border-lavender--600"
                    />
                  ) : (
                    <FaCircleUser className="w-12 h-12 text-lavender--600 " />
                  )}
                </div>
              )}

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              {family?.members?.length > 0 ? (
                family.members.map((member, index) => (

                  <div
                    key={index}
                    onClick={() => {

                      const encodedId = encodeURIComponent(member.member_id);



                      navigate(`/admin/dashmember/${encodedId}`, {
                        state: {
                          relation: member.relation_with_head,
                          name: member.member_name
                        }
                      });


                    }}
                    className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
                  >
                    {/* Photo */}
                    {member?.photo && !imageErrors[member.member_id] ? (
                      <img
                        src={`${URL}${member.photo}`}
                        alt={member.member_name}
                        onError={() =>
                          setImageErrors((prev) => ({
                            ...prev,
                            [member.member_id]: true,
                          }))
                        }
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <FaCircleUser className="w-10 h-10 text-lavender--600" />
                    )}

                    {/* Name + Relation in one line */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-800">
                        {member.member_name}
                      </span>

                      <span className="text-gray-400">•</span>

                      <span className="text-gray-500">
                        {member.relation_with_head}
                      </span>
                    </div>
                  </div>

                ))
              ) : (
                <p className="text-gray-400 col-span-full">
                  No members listed
                </p>
              )}

            </div>

          </div>
        )}

        {previewImage && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <img
              src={previewImage}
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg"
            />
          </div>
        )}



        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Subscriptions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-lavender--600">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-semibold text-lavender--600">Subscriptions</h5>

              <button
                onClick={() => setIsSubModalOpen(true)}
                className="block mb-1 font-semibold text-sm text-lavender--600"
              >
                View
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500">
                <thead className="text-base text-gray-700">
                  <tr>
                    <th className="p-2 text-center">Sl No.</th>
                    <th className="p-2 text-center">Month</th>
                    <th className="p-2 text-center">Amount</th>

                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length > 0 ? (
                    subscriptions.map((item) => (
                      <tr
                        key={item.sl}
                        className="border-b"
                        onClick={() => {
                          if (item.status === "Paid") setSelectedMonth(item);
                        }}
                      >
                        <td className="p-2 text-center">{item.sl}</td>
                        <td className="p-2 text-center">{item.month}</td>
                        <td className="p-2 text-center">₹{item.total.toFixed(2)}</td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center p-4 text-gray-400">
                        No subscriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


          {/* Offerings SECOND */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 border-2 border-lavender--600">
            <h5 className=" font-semibold text-lavender--600">Offerings Paid</h5>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500">
                <thead className="text-base text-gray-700">
                  <tr>
                    <th className="p-2 text-center">Sl No.</th>
                    <th className="p-2 text-center">Offering Category</th>
                    <th className="p-2 text-center">Date</th>
                    <th className="p-2 text-center">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {offerings.length > 0 ? (
                    offerings.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b"
                      >
                        <td className="p-2 text-center">{index + 1}</td>
                        <td className="p-2 text-center">{item.category}</td>
                        <td className="p-2 text-center">
                          {moment(item.date).format("DD-MM-YYYY")}
                        </td>
                        <td className="p-2 text-center">₹{item.amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-400">
                        No offerings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>




        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-lavender--600">

            <h5 className="font-semibold text-lavender--600 mb-4">
              Notifications
            </h5>

            <div
              id="notificationSection"
              className="space-y-4 max-h-[250px] overflow-y-auto"
            >

              {notifications.length > 0 ? (

                notifications.map((note, index) => (

                  <div
                    key={index}
                    id={note._id}
                    className="notification-item  bg-gray-50 p-4 rounded-lg border-l-4 border-green-600"
                  //                     className={`notification-item bg-gray-50 p-4 rounded-lg border-l-4 border-green-600
                  //   ${highlightId === note._id ? "ring-2 ring-red-400 animate-pulse" : ""}
                  // `}
                  >

                    {/* Heading */}
                    <h6
                      className="font-semibold text-gray-800 cursor-pointer hover:text-lavender--600"
                      onClick={() => openNotificationModal(note)}
                    >
                      {note.heading}
                    </h6>



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
            <h5 className=" font-semibold text-lavender--600 ">Sunday Service Notes</h5>
          </div>


        </div>






        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6"></div>
        </div> */}



        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* EVENTS */}
          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 border-2 border-lavender--600">

            <div className="flex items-center gap-2 mb-4">

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

                // Get full participant data (including prize + competition)
                const participantData = event.choirCompetitions
                  ?.flatMap(comp =>
                    comp.participants?.map(p => ({
                      ...p,
                      competition: comp.competition,
                      title: comp.title
                    }))
                  )
                  ?.find(p => p.member_id === memberInfo.member_id);

                const getMedalIcon = (prize) => {
                  if (prize === "1st") return "🥇";
                  if (prize === "2nd") return "🥈";
                  if (prize === "3rd") return "🥉";
                  return "🏆";
                };

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

                        {/* Competition Name */}
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">
                            {participantData.competition}
                          </span>
                          {" - "}
                          {participantData.title}
                        </div>

                        {/* Prize OR Participated Badge */}
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



              {coupleEvents.map((event, i) => {

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

                    {/* Prize / Participation Section */}
                    {event.participantData && (
                      <div className="mt-3 space-y-2">

                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">
                            {event.participantData.competition}
                          </span>
                          {" - "}
                          {event.participantData.title}
                        </div>

                        {event.participantData.prize ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
                            {getMedalIcon(event.participantData.prize)} {event.participantData.prize} Prize
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

              <h5 className="font-semibold text-lavender--600 text-lg">
                Upcoming Exams
              </h5>
            </div>

            <div className="space-y-3">

              {upcomingExams.map((exam, i) => {

                const student = exam?.classExams
                  ?.flatMap(c => c.participants)
                  ?.find(p => p.member_id === memberInfo.member_id);

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


      <MemberProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        member={memberProfile}
      />


      <MemberSubscriptionsModel
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        memberId={memberInfo.member_id}
      />


      <MemberNotificationModel
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notification={selectedNotification}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="View Subscription Details"
      >
        <div className="space-y-4 max-h-[600px] overflow-y-auto p-2">
          {subscriptionYears.length > 0 ? (
            subscriptionYears.map((yearData, i) => (
              <div key={i} className="border rounded-md p-3 bg-gray-50">
                <h4 className="text-lg font-semibold text-lavender--600 mb-3">
                  Financial Year: {yearData.year} - {yearData.year + 1}
                </h4>

                {/* Table layout (same as earlier structure) */}
                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-center border">Month</th>
                        {categories.map((cat) => (
                          <th key={cat} className="p-2 text-center border">
                            {labels[cat]}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {months
                        .filter((monthKey) => {
                          const details = yearData.months.find(
                            (m) => m.month.toLowerCase() === monthKey
                          );
                          if (!details) return false;
                          // Show only months with at least one non-zero category
                          return categories.some((cat) => Number(details[cat]) > 0);
                        })
                        .map((monthKey, idx) => {
                          const details = yearData.months.find(
                            (m) => m.month.toLowerCase() === monthKey
                          );
                          if (!details) return null;

                          return (
                            <tr
                              key={idx}
                              className="border hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-2 border text-center capitalize">
                                {/* {monthKey} */}
                                {details.date !== "-" && (
                                  <span className="block text-xs text-gray-500">
                                    {(() => {
                                      const day = moment(details.date).format("DD");
                                      const month = moment(details.date).format("MMM");
                                      const year = moment(details.date).format("YYYY");
                                      return (
                                        <>
                                          ({day}-<span className="text-gray-800 text-[14px] font-bold">{month}</span>-{year})
                                        </>
                                      );
                                    })()}
                                  </span>
                                )}
                              </td>


                              {categories.map((cat) => (
                                <td key={cat} className="p-2 border text-center">
                                  {details[cat] ? details[cat].toFixed(2) : "0.00"}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                    </tbody>

                    {/* Totals Row */}
                    <tfoot>
                      <tr className="bg-gray-100 font-bold">
                        <td className="p-2 text-center border">Total</td>
                        {categories.map((cat, index) => {
                          const colTotal = months.reduce((sum, monthKey) => {
                            const details = yearData.months.find(
                              (m) => m.month.toLowerCase() === monthKey
                            );
                            if (!details) return sum;
                            return sum + (Number(details[cat]) || 0);
                          }, 0);

                          // Hide last column total (if you want same behavior)
                          if (index === categories.length - 1) {
                            return (
                              <td
                                key={cat}
                                className="p-2 text-center border bg-gray-100"
                                style={{ visibility: "hidden" }}
                              ></td>
                            );
                          }

                          return (
                            <td key={cat} className="p-2 text-center border">
                              {colTotal.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No subscription data found
            </p>
          )}
        </div>
      </Modal>





    </>
  )
}
