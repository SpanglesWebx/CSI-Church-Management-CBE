import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { initFlowbite } from "flowbite";
import {
  MdDashboard, MdSpaceDashboard, MdCardMembership, MdLogout,
  MdOutlineEmojiEvents,
} from "react-icons/md";
import { FaUser, FaPeopleRoof, FaRupeeSign, FaSackDollar } from "react-icons/fa6";
import { GiCash, GiMicrophone, GiPrayer, GiTakeMyMoney, GiTombstone } from "react-icons/gi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { RiAuctionFill, RiSchoolFill } from "react-icons/ri";
import { IoIosMan } from "react-icons/io";
import { IoWomanSharp } from "react-icons/io5";
import { SiAmazonpay } from "react-icons/si";
import { FaBook, FaUserFriends } from "react-icons/fa";
import { FaSchool, FaChildReaching } from "react-icons/fa6";
import { GrUserSettings } from "react-icons/gr";
import { RoleContext } from "./RoleContext";
import { BiSolidBuildingHouse } from "react-icons/bi";
import { TbGrave2, TbReportMoney } from "react-icons/tb";
import { PiStudentBold } from "react-icons/pi";
import { IoDocumentAttachSharp } from "react-icons/io5";
import { LuAlarmClockCheck } from "react-icons/lu";
import { FaUserClock } from "react-icons/fa6";
import { SiTransmission } from "react-icons/si";
import { GiPiggyBank } from "react-icons/gi";
import { PiMedalFill } from "react-icons/pi";
import { TbCoinRupeeFilled } from "react-icons/tb";
import { FaShop } from "react-icons/fa6";
import { GiMusicalNotes } from "react-icons/gi";
import { FaHouseChimneyMedical } from "react-icons/fa6";
import { FaHandHoldingHeart } from "react-icons/fa";
import { BsCalendar2HeartFill } from "react-icons/bs";
import { MdHowToVote } from "react-icons/md";
import { FaBalanceScale } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
import { GrCertificate } from "react-icons/gr";
import { BiSolidBank } from "react-icons/bi";
import { HiCurrencyRupee } from "react-icons/hi2";
import { BsNewspaper } from "react-icons/bs";
import { FaBible } from "react-icons/fa";
import { FaBell } from "react-icons/fa";

import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const menuConfig = [
  {
    section: "MENU",
    items: [
      //==================================MENU STARTS=================================
      //Treasurer Dashboard
      // { label: "Dashboard", icon: MdSpaceDashboard, path: "/admin/treasurerdash", roles: ["treasurer"] },

      //Accountant Dashboard
      {
        label: "Dashboard",
        icon: MdSpaceDashboard,
        path: "/admin/accountantdash",
        roles: ["accountant"],
      },

      //Church Office worker Dashboard
      {
        label: "Dashboard",
        icon: MdSpaceDashboard,
        path: "/admin/churchofficeworkerdash",
        roles: ["churchofficeworker", 'officestaff'],
      },

      //Secretery Dashboard
      {
        label: "Dashboard",
        icon: MdSpaceDashboard,
        path: "/admin/secretarydash",
        roles: ["secretary"],
      },

      //Admin Dashboard
      {
        label: "Dashboard",
        icon: MdDashboard,
        path: "/admin/dashboard",
        roles: ["admin", "pastorprimary", "pastorsecondary", "treasurer"],
      },

      {
        label: "Family List",
        icon: FaPeopleRoof,
        path: "/admin/familylist",
        roles: ["admin", "churchofficeworker", "treasurer",'officestaff'],
      },
      {
        label: "Member List",
        icon: FaUser,
        path: "/admin/memberlist",
        roles: ["admin", "churchofficeworker", "treasurer",'officestaff'],
      },
      {
        label: "Presbyter",
        icon: GiPrayer,
        path: "/admin/pastorlist",
        roles: ["admin", "churchofficeworker", "treasurer",'officestaff'],
      },
      {
        label: "Voters",
        icon: MdHowToVote,
        path: "/admin/voterlist",
        roles: ["admin", "treasurer"],
      },
      //===============================MENU ENDS============================================
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      //===============================ACCOUNT STARTS==================================
      //Accounts
      {
        label: "Accounts",
        icon: HiCurrencyRupee,
        roles: ["admin", "churchofficeworker", "treasurer"], // only these roles can see this item
        children: [
          {
            label: "Cash in Hands",
            path: "/admin/openingbalance",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Banks",
            path: "/admin/banklist",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Ledgers",
            path: "/admin/TypesofLedgerList",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Receipt",
            path: "/admin/receiptslist",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Payment",
            path: "/admin/addchurchexpense",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Print Voucher",
            path: "/admin/Voucher",
            roles: ["admin", "churchofficeworker"],
          },
          {
            label: "Journal",
            path: "/admin/journallist",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
        ],
      },

      //WOmen Accounts
      {
        label: "Women. Accounts",
        icon: HiCurrencyRupee,
        roles: ["admin", "churchofficeworker", "treasurer"], // only these roles can see this item
        children: [
          {
            label: "Cash",
            path: "/admin/womenopenbal",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Bank",
            path: "/admin/womenbank",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Receipt",
            path: "/admin/womenReceipt",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Payment",
            path: "/admin/womenPayment",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Journal",
            path: "/admin/womenJournal",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
        ],
      },

      //Cemetery Accounts
      {
        label: "Cem. Accounts",
        icon: HiCurrencyRupee,
        roles: ["admin", "churchofficeworker", "treasurer"], // only these roles can see this item
        children: [
          {
            label: "Cash",
            path: "/admin/cemcashbalance",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Banks",
            path: "/admin/cembanks",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Receipt",
            path: "/admin/cemreceipts",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Payment",
            path: "/admin/cempayments",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
          {
            label: "Journal",
            path: "/admin/cemjournal",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
        ],
      },

      //BRS
      {
        label: "B.R.S",
        icon: BsNewspaper,
        roles: ["admin", "churchofficeworker", "treasurer"], // only these roles can see this item
        children: [
          {
            label: "B.R.S",
            path: "/admin/bankreconstatement",
            roles: ["admin", "churchofficeworker"],
          },
          {
            label: "Report",
            path: "/admin/bankreconreport",
            roles: ["admin", "churchofficeworker", "treasurer"],
          },
        ],
      },

      //Tally Migrate
      {
        label: "Tally Migrate",
        icon: FaBalanceScale,
        path: "/admin/TallyMigrate",
        roles: ["admin", "churchofficeworker", "treasurer"],
      },

      //Harvest
      {
        label: "Harvest",
        icon: RiAuctionFill,
        roles: [
          "admin",
          "secretary",
          "accountant",
          "churchofficeworker",
          "treasurer",
        ],
        children: [
          { label: "Auction", path: "/admin/addharvestauction" },
          { label: "Collection", path: "/admin/harvestcollection" },
          { label: "Biriyani Token", path: "/admin/harvestbiriyanitoken" },
          { label: "Canteen", path: "/admin/harvestcanteen" },
          { label: "Cover Offertory", path: "/admin/harvestcoveroffer" },
        ],
      },

      //Subscription
      {
        label: "Subscription",
        icon: MdCardMembership,
        roles: [
          "admin",
          "secretary",
          "accountant",
          "churchofficeworker",
          "treasurer",
          'officestaff'
        ],
        children: [
          {
            label: "Subscribers List",
            path: "/admin/subscribers",
            roles: ["admin", "treasurer", "churchofficeworker", 'officestaff'],
          },
          {
            label: "Member Status",
            path: "/admin/memberstatus",
            roles: ["admin", "treasurer", "churchofficeworker"],
          },
          {
            label: "Print Label",
            path: "/admin/printLabel",
            roles: ["admin", "churchofficeworker", 'officestaff'],
          },
          {
            label: "Report",
            path: "/admin/subsreport",
            roles: ["admin", "treasurer", "churchofficeworker", 'officestaff'],
          },
          {
            label: "Report By Year",
            path: "/admin/SubsRptPerYear",
            roles: ["admin", "treasurer"],
          },
        ],
      },

      //Asanam
      {
        label: "Asanam",
        icon: PiMedalFill,
        roles: ["admin", "churchofficeworker", "treasurer"],
        children: [
          { label: "Asanam Collection", path: "/admin/asanamcollection" },
          { label: "Tiffin Carrier", path: "/admin/asanamtiffincarrier" },
          { label: "Uniform", path: "/admin/asanamuniform" },
          { label: "Asanam Report", path: "/admin/asanamreport" },
          { label: "Asanam Donation", path: "/admin/asanamdonation" },
        ],
      },

      //Missionary Sunday
      {
        label: "Mis. Sunday",
        icon: SiTransmission,
        roles: ["admin", "churchofficeworker", "treasurer"],
        children: [
          { label: "Sunday Donation", path: "/admin/sundaydonation" },
          {
            label: "Sunday Cover Offertory",
            path: "/admin/sundaycoveroffertory",
          },
          { label: "Biriyani Token", path: "/admin/biriyanitoken" },
          { label: "Canteen Collection", path: "/admin/canteen" },
        ],
      },

      {
        label: "Carols",
        icon: GiMusicalNotes,
        path: "/admin/carollist",
        roles: ["admin", "treasurer"],
      },
      {
        label: "Creditors",
        icon: FaPersonChalkboard,
        path: "/admin/creditorslist",
        roles: ["admin", "churchofficeworker", "treasurer"],
      },
      {
        label: "Staff",
        icon: FaUserClock,
        path: "/admin/stafflist",
        roles: [
          "admin",
          "secretary",
          "accountant",
          "churchofficeworker",
          "treasurer",
        ],
      },
      //===================================================ACCOUNT ENDS=============================================
    ],
  },

  {
    section: "FELLOWSHIP",
    items: [
      //====================================================FELLOWSHIP STARTS============================================
      //sunday school
      {
        label: "Sunday School",
        icon: FaSchool,
        roles: [
          "admin",
          "secretary",
          "sundaysclscretary",
          "sundaysclaccountant",
          "accountant",
          "treasurer",
        ],
        children: [
          {
            label: "Dashboard",
            path: "/admin/dashsundayschool",
            roles: [
              "admin",
              "secretary",
              "sundaysclscretary",
              "sundaysclaccountant",
              "accountant",
              "treasurer",
            ],
          },
          {
            label: "Class Management",
            path: "/admin/class",
            roles: [
              "admin",
              "secretary",
              "sundaysclscretary",
              "sundaysclaccountant",
              "accountant",
              "treasurer",
            ],
          },
          {
            label: "Teacher",
            path: "/admin/teacher",
            roles: [
              "admin",
              "secretary",
              "sundaysclscretary",
              "sundaysclaccountant",
              "accountant",
              "treasurer",
            ],
          },
          {
            label: "Student",
            path: "/admin/student",
            roles: [
              "admin",
              "secretary",
              "sundaysclscretary",
              "sundaysclaccountant",
              "accountant",
              "treasurer",
            ],
          },
          {
            label: "Event",
            path: "/admin/event",
            roles: [
              "admin",
              "secretary",
              "sundaysclscretary",
              "sundaysclaccountant",
              "accountant",
              "treasurer",
            ],
          },
          {
            label: "Exam",
            path: "/admin/exam",
            roles: ["admin", "secretary", "sundaysclscretary", "treasurer"],
          },
          {
            label: "Auction",
            path: "/admin/studentauction",
            roles: [
              "admin",
              "secretary",
              "sundaysclscretary",
              "sundaysclaccountant",
              "accountant",
            ],
          },
          {
            label: "Auction Report",
            path: "/admin/studentauctionreport",
            roles: [
              "admin",
              "secretary",
              "sundaysclscretary",
              "sundaysclaccountant",
              "accountant",
            ],
          },
          {
            label: "Attendance",
            path: "/admin/sunday-attendance",
            roles: [
              "admin",
              "secretary",
              "sundaysclscretary",
              "sundaysclaccountant",
              "accountant",
              "treasurer",
            ],
          },
        ],
      },
      //youth
      {
        label: "Youth",
        icon: FaChildReaching,
        roles: [
          "admin",
          "secretary",
          "youthsecretary",
          "youthaccountant",
          "accountant",
          "treasurer",
        ],
        children: [
          {
            label: "Youth Members",
            path: "/admin/youthlist",
            roles: [
              "admin",
              "secretary",
              "youthsecretary",
              "youthaccountant",
              "accountant",
              "treasurer",
            ],
          },
          {
            label: "Youth Auction",
            path: "/admin/youthauction",
            roles: [
              "admin",
              "secretary",
              "youthsecretary",
              "youthaccountant",
              "accountant",
            ],
          },
          {
            label: "Auction Report",
            path: "/admin/youthauctionreport",
            roles: [
              "admin",
              "secretary",
              "youthsecretary",
              "youthaccountant",
              "accountant",
            ],
          },
        ],
      },
      //men
      {
        label: "Men's Fellowship",
        icon: IoIosMan,
        roles: [
          "admin",
          "secretary",
          "mensecretary",
          "menaccountant",
          "treasurer",
        ],
        children: [
          {
            label: "Members",
            path: "/admin/menfellowmembers",
            roles: [
              "admin",
              "secretary",
              "mensecretary",
              "menaccountant",
              "treasurer",
            ],
          },
          {
            label: "Event",
            path: "/admin/menfellowevent",
            roles: [
              "admin",
              "secretary",
              "mensecretary",
              "menaccountant",
              "treasurer",
            ],
          },
          {
            label: "Activities",
            path: "/admin/menactivites",
            roles: [
              "admin",
              "secretary",
              "mensecretary",
              "menaccountant",
              "treasurer",
            ],
          },
          {
            label: "Men Auction",
            path: "/admin/menauction",
            roles: ["admin", "secretary", "mensecretary", "menaccountant"],
          },
          {
            label: "Auction Report",
            path: "/admin/menauctionreport",
            roles: ["admin", "secretary", "mensecretary", "menaccountant"],
          },

          {
            label: "Men Voters",
            path: "/admin/mensubscribers",
            roles: [
              "admin",
              "secretary",
              "mensecretary",
              "menaccountant",
              "treasurer",
            ],
          },
        ],
      },

      //women
      {
        label: "Women's Fellowship",
        icon: IoWomanSharp,
        roles: [
          "admin",
          "secretary",
          "womensecretary",
          "womenaccountant",
          "treasurer",
        ], // parent roles
        children: [
          {
            label: "Fellowship Members",
            path: "/admin/womenfellowmembers",
            roles: [
              "admin",
              "secretary",
              "womensecretary",
              "womenaccountant",
              "treasurer",
            ], // parent roles
          },
          {
            label: "Women's Event",
            roles: [
              "admin",
              "secretary",
              "womensecretary",
              "womenaccountant",
              "treasurer",
            ], // parent roles
            path: "/admin/womenfellowevent",
          },
          {
            label: "Activities",
            path: "/admin/womenactivities",
            roles: [
              "admin",
              "secretary",
              "womensecretary",
              "womenaccountant",
              "treasurer",
            ], // parent roles
          },
          {
            label: "Women Auction",
            path: "/admin/womenauction",
            roles: ["admin", "secretary", "womensecretary", "womenaccountant"], // parent roles
          },
          {
            label: "Auction Report",
            path: "/admin/womenactionreport",
            roles: ["admin", "secretary", "womensecretary", "womenaccountant"], // parent roles
          },
          {
            label: "Women Voters",
            path: "/admin/womensubscribers",
            roles: [
              "admin",
              "secretary",
              "womensecretary",
              "womenaccountant",
              "treasurer",
            ], // parent roles
          },
        ],
      },
      //couple
      {
        label: "Couple",
        icon: FaUserFriends,
        roles: [
          "admin",
          "secretary",
          "couplesecretary",
          "coupleaccountant",
          "treasurer",
        ], // only these roles can see this item
        children: [
          {
            label: "Couple Members",
            path: "/admin/couplelist",
            roles: ["admin", "secretary", "couplesecretary", "treasurer"], // optional: specific roles for this child
          },
          {
            label: "Couple Activities",
            path: "/admin/coupleactivities",
            roles: ["admin", "secretary", "couplesecretary", "treasurer"],
          },
          {
            label: "Event",
            path: "/admin/couple/event",
            roles: ["admin", "secretary", "couplesecretary", "treasurer"],
          },
        ],
      },

      //choir
      {
        label: "Choir",
        icon: GiMicrophone,
        roles: [
          "choiraccountant",
          "choirsecretary",
          "pastorprimary",
          "admin",
          "treasurer",
        ],
        children: [
          {
            label: "Choir List",
            path: "/admin/choirlist",
            roles: [
              "choiraccountant",
              "choirsecretary",
              "pastorprimary",
              "admin",
              "treasurer",
            ],
          },
          {
            label: "Master",
            path: "/admin/choirmaster",
            roles: [
              "choiraccountant",
              "choirsecretary",
              "pastorprimary",
              "admin",
              "treasurer",
            ],
          },
          {
            label: "Event",
            path: "/admin/choirevent",
            roles: [
              "choiraccountant",
              "choirsecretary",
              "pastorprimary",
              "admin",
              "treasurer",
            ],
          },
        ],
      },

      //Sunday School Teacher Login
      {
        label: "Sunday School Dashboard",
        icon: MdSpaceDashboard,
        path: "/admin/sundayschoolteacherdashboard",
        roles: ["sundaysclteacher"],
      },
      {
        label: "Students",
        icon: PiStudentBold,
        path: "/admin/sundayschoolstudents",
        roles: ["sundaysclteacher"],
      },
      {
        label: "Event",
        icon: MdOutlineEmojiEvents,
        path: "/admin/sundayschoolevent",
        roles: ["sundaysclteacher"],
      },
      {
        label: "Exam",
        icon: IoDocumentAttachSharp,
        path: "/admin/sundayschoolexam",
        roles: ["sundaysclteacher"],
      },
      {
        label: "Auction Report",
        icon: TbReportMoney,
        path: "/admin/sundayschoolreportforauction",
        roles: ["sundaysclteacher"],
      },
      {
        label: "Offerings and Attendance",
        icon: FaSackDollar,
        path: "/admin/sundayschoolofferingsandattendance",
        roles: ["sundaysclteacher"],
      },
      //==================================================FELLOWSHIP ENDS=================================================
    ],
  },

  {
    section: "DOWNLOADS",
    items: [
      //================================================DOWNLOADS STARTS==================================================
      //Certificates
      {
        label: "Certificates",
        icon: GrCertificate,
        roles: ["admin", "churchofficeworker", "treasurer"],
        children: [
          { label: "Baptism", path: "/admin/baptismcertlist" },
          { label: "Marriage", path: "/admin/mrgcertlist" },
          { label: "Death", path: "/admin/deathcertlist" },
        ],
      },

      //Reports
      {
        label: "Reports",
        icon: HiOutlineDocumentReport,
        roles: [
          "admin",
          "secretary",
          "accountant",
          "treasurer",
          "churchofficeworker",
        ],
        children: [
          // { label: "Accounting Reports", path: "/admin/AccountsReports" },
          { label: "Creditor Reports", path: "/admin/CreditorReports" },
          { label: "Offering Reports", path: "/admin/OfferingReports" },
          { label: "Subscription", path: "/admin/SubscriptionReport" },
          { label: "Auction Reports", path: "/admin/AuctionReportsAll" },
          {
            label: "Harvest Auction Reports",
            path: "/admin/HarvestAuctionReportsAll",
          },
          { label: "Sunday School", path: "/admin/SundaySchoolReports" },
          { label: "Endeavour", path: "/admin/EndeavourReports" },
          { label: "Men", path: "/admin/MenReports" },
          { label: "Women", path: "/admin/WomenReports" },
          { label: "Youth", path: "/admin/YouthReports" },
          { label: "Couple", path: "/admin/CoupleReports" },
          { label: "Marriage Hall", path: "/admin/MarriageHallReports" },
          { label: "Cemetery", path: "/admin/CemeteryReports" },
          { label: "Member Reports", path: "/admin/reports" },
          { label: "Trial Balance", path: "/admin/TrialBalance" },
          { label: "Depreciation Statement", path: "/admin/Depreciation" },
          { label: "Balance Sheet", path: "/admin/BalanceSheet" },
          { label: "Receipt and Payment", path: "/admin/AccountsReports" },
          { label: "Income Expenditure", path: "/admin/incomeexpenditure" },
        ],
      },
      //===============================================DOWNLOADS ENDS=====================================================
    ],
  },

  {
    section: "BOOKING",
    items: [
      //=================================================BOOKING STARTS=================================================
      //Halls
      {
        label: "Hall",
        icon: BiSolidBuildingHouse,
        roles: ["admin", "churchofficeworker", "treasurer"],
        children: [
          { label: "Halls", path: "/admin/mrghalllist" },
          { label: "Book Hall", path: "/admin/mrghallbookings" },
          { label: "Hall Asset", path: "/admin/mrghallasset" },
          { label: "Kitchen Asset", path: "/admin/mrghallkitchenassets" },
          { label: "Issued Asset", path: "/admin/issuedhallassets" },
        ],
      },

      //Cemetery
      {
        label: "Cemetery",
        icon: TbGrave2,
        roles: ["admin", "cemeterymanager", "churchofficeworker", "treasurer"],
        children: [
          { label: "Add Plots", path: "/admin/addcemeteryplots" },
          { label: "Book Slots", path: "/admin/bookcemeteryslot" },
          { label: "Reserved Slots", path: "/admin/reservedcemeteryslot" },
        ],
      },
      {
        label: "Shops",
        icon: FaShop,
        path: "/admin/shoplist",
        roles: ["admin", "churchofficeworker", "treasurer"],
      },

      //=====================================================BOOKING ENDS==============================================
    ],
  },

  {
    section: "SETTINGS",
    items: [
      //====================================================SETTINGS STARTS=============================================
      {
        label: "Bible Sentence",
        icon: FaBible,
        path: "/admin/biblesentence",
        roles: ["admin", "churchofficeworker", "treasurer"],
      },
      {
        label: "Notifications",
        icon: FaBell,
        path: "/admin/notifications",
        roles: [
          "admin",
          "secretary",
          "accountant",
          "treasurer",
          "churchofficeworker",
        ],
      },
      {
        label: "User Control",
        icon: GrUserSettings,
        path: "/admin/usercontrol",
        roles: ["admin", "secretary", "treasurer"],
      },

      //====================================================SETTINGS ENDS===============================================
    ],
  },
];

function Sidebar() {


  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole } = useContext(RoleContext);
  const [openMenus, setOpenMenus] = useState({});
  const [activeChildParent, setActiveChildParent] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Auto-close other dropdowns when navigating to a new route
  useEffect(() => {
    const newOpenMenus = {};

    menuConfig.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (child.path.startsWith("/admin/offerings")) {
            // special logic for offerings
            return matchOfferingsPath(child.path, location.pathname);
          }
          return (
            location.pathname === child.path ||
            location.pathname.startsWith(child.path + "/")
          );
        });

        if (hasActiveChild) {
          newOpenMenus[item.label] = true; // keep only active section open
        }
      }
    });

    setOpenMenus(newOpenMenus);
  }, [location.pathname]);


  const toggleMenu = (label) => {

    setOpenMenus((prev) => {

      const newMenus = {};

      // If NO child selected → close others
      if (!activeChildParent) {
        newMenus[label] = !prev[label];
      }

      // If child selected → keep that parent open
      else {
        newMenus[activeChildParent] = true;
        newMenus[label] = !prev[label];
      }

      return newMenus;
    });

  };

  const hasAccess = (item) => !item.roles || item.roles.includes(activeRole);

  const flatRoles = [
    "sundaysclscretary", "sundaysclaccountant", "sundaysclteacher",
    "endeavoursclscretary", "endeavourclaccountant", "endeavourteacher",
    "youthsecretary", "youthaccountant",
    "mensecretary", "menaccountant",
    "womensecretary", "womenaccountant",
    "couplesecretary", "coupleaccountant",
  ];

  // Extract main section token from a path, e.g. '/admin/offerings/type' -> 'offerings'
  const getSection = (path) => {
    if (!path || typeof path !== "string") return null;
    const parts = path.split("/").filter(Boolean); // ['admin','offerings','type']
    // prefer the second segment (index 1) if exists, otherwise fallback
    return parts[1] || parts[0] || null;
  };

  // Build a set of all sections dynamically from menuConfig (for reference / future use)
  const buildSectionSet = () => {
    const set = new Set();
    menuConfig.forEach((item) => {
      if (item.path) {
        const s = getSection(item.path);
        if (s) set.add(s);
      }
      if (item.children) {
        item.children.forEach((child) => {
          if (child.path) {
            const s = getSection(child.path);
            if (s) set.add(s);
          }
        });
      }
    });
    return set; // Set of tokens like 'offerings', 'family', 'men', etc.
  };

  const sectionSet = buildSectionSet();

  // Smart check: exact match, startsWith, or same "section" token
  const checkActive = (path, currentPath) => {
    if (!path) return false;
    if (currentPath === path) return true;
    if (currentPath.startsWith(path + "/")) return true;
    // If both have same main section, count as active
    const pathSection = getSection(path);
    const currentSection = getSection(currentPath);
    if (pathSection && currentSection && pathSection === currentSection) return true;
    return false;
  };

  // Auto-expand parent menus when any of their children are active
  useEffect(() => {
    const expanded = {};
    menuConfig.forEach((item) => {
      if (item.children?.some((child) => checkActive(child.path, location.pathname))) {
        expanded[item.label] = true;
      }
    });
    setOpenMenus((prev) => ({ ...expanded, ...prev }));
    // We only depend on pathname so panels update when route changes
  }, [location.pathname]);

  // ✅ Accurate and automatic matcher for Offerings section
  const matchOfferingsPath = (childPath, currentPath) => {
    if (!childPath.startsWith("/admin/offerings")) return false;

    // e.g. '/admin/offerings/type' → 'type'
    const baseSegment = childPath.split("/")[3]?.toLowerCase() || "";
    // e.g. '/admin/offerings/Common/list/...' → 'common'
    const currentSegment = currentPath.split("/")[3]?.toLowerCase() || "";

    // Normalize names to remove suffixes like 'type', 'offer', 'offerings'
    const normalize = (s) => s?.replace(/type|offerings?|offer/gi, "").trim();
    const base = normalize(baseSegment);
    const current = normalize(currentSegment);

    // ✅ CASES
    // 1. Exact match (like /type → /type)
    if (currentPath === childPath) return true;

    // 2. Child's subroute (like /type/something)
    if (currentPath.startsWith(childPath + "/")) return true;

    // 3. Same base segment group (type <-> Common, bagtype <-> BagOffer, etc.)
    if (base && current && base === current) return true;

    // 4. Allow matching deeper only if the section prefix matches (prevent always-active)
    if (
      base &&
      currentPath.startsWith(`/admin/offerings/${currentSegment}/`) &&
      current.startsWith(base)
    ) {
      return true;
    }

    // ❌ otherwise, not active
    return false;
  };



  return (

    <div className="relative flex">
      {/* SIDEBAR */}
      <aside
        className={`h-full transition-all duration-300 sm:translate-x-0 ${collapsed ? "w-[6rem]" : "w-[20rem]"
          }`}
      >

        {/* TOP TOGGLE HEADER */}
        <div className="relative h-12 flex items-center">

          <div className="absolute right-[-14px]">

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center border"
            >
              {collapsed ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
            </button>

          </div>

        </div>

        <div className="flex flex-col justify-between h-[calc(100%-3rem)] overflow-y-auto py-1">

          <ul>

            {menuConfig.map((section, index) => {

              const visibleItems = section.items?.filter(hasAccess) || [];

              if (section.items && visibleItems.length === 0) {
                return null;
              }

              //////////////////////////////////////////////////
              // CASE 1 — NORMAL MENU
              //////////////////////////////////////////////////

              if (!section.items) {

                if (!hasAccess(section)) return null;

                const item = section;

                const getBase = (path) =>
                  path.split("/").slice(0, 3).join("/");

                const currentBase =
                  getBase(location.pathname);

                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/") ||
                  getBase(item.path) === currentBase;


                return (

                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className={`flex items-center py-3 rounded-e-lg group ${collapsed
                        ? "justify-center px-0"
                        : "px-10"
                        } ${isActive
                          ? "bg-lavender--600 text-white"
                          : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                        }`}
                    >
                      <item.icon className="w-[24px] h-[24px]" />
                      {!collapsed && (
                        <span className="text-lg ms-3">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              }


              //////////////////////////////////////////////////
              // SECTION MENU
              //////////////////////////////////////////////////

              return (
                <div key={section.section}>
                  {/* SECTION TITLE */}
                  <div
                    className={`${index === 0 ? "mt-0" : "mt-6"
                      } -mb-0 ${collapsed
                        ? "text-center"
                        : "flex items-center px-10"
                      }`}
                  >

                    <span
                      className={`text-xs font-semibold text-gray-400 uppercase ${collapsed
                        ? "block text-center"
                        : ""
                        }`}
                    >
                      {section.section}
                    </span>
                    {!collapsed && (
                      <div className="flex-1 ml-3 -mr-9 border-t border-gray-300"></div>
                    )}
                  </div>


                  {visibleItems.map((item) => {

                    const getBase = (path) =>
                      path.split("/").slice(0, 3).join("/");

                    const currentBase =
                      getBase(location.pathname);


                    const isParentActive =
                      item.children?.some(
                        (child) =>
                          location.pathname === child.path ||
                          location.pathname.startsWith(child.path + "/") ||
                          getBase(child.path) === currentBase
                      );


                    //////////////////////////////////////////////////
                    // FLAT ROLES
                    //////////////////////////////////////////////////

                    if (
                      flatRoles.includes(activeRole) &&
                      item.children
                    ) {

                      return item.children
                        .filter(
                          (child) =>
                            !child.roles ||
                            child.roles.includes(activeRole)
                        )
                        .map((child) => {
                          const isActive =
                            location.pathname === child.path ||
                            location.pathname.startsWith(child.path + "/") ||
                            getBase(child.path) === currentBase;
                          return (
                            <li key={child.label}>
                              <Link
                                to={child.path}
                                className={`flex items-center py-3 rounded-e-lg group ${collapsed
                                  ? "justify-center px-0"
                                  : "px-10"
                                  } ${isActive
                                    ? "bg-lavender--600 text-white"
                                    : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                                  }`}
                              >
                                {!collapsed && (
                                  <span className="text-lg ms-3">
                                    {child.label}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        });
                    }


                    //////////////////////////////////////////////////
                    // DROPDOWN MENU
                    //////////////////////////////////////////////////

                    return (
                      <li key={item.label}>
                        {item.children ? (
                          <>
                            <div
                              className={`flex items-center py-3 cursor-pointer rounded-e-lg group ${collapsed
                                ? "justify-center px-0"
                                : "px-10"
                                } ${isParentActive
                                  ? "bg-lavender--600 text-white"
                                  : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                                }`}
                              onClick={() =>
                                toggleMenu(item.label)
                              }
                            >
                              <item.icon className="w-[24px] h-[24px]" />
                              {!collapsed && (
                                <span className="text-lg ms-3">
                                  {item.label}
                                </span>
                              )}
                              {!collapsed && (
                                <svg
                                  className={`w-4 h-4 ml-2 transition-transform ${openMenus[item.label]
                                    ? "rotate-180"
                                    : ""
                                    }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              )}
                            </div>

                            {(!openMenus[item.label] &&
                              isParentActive) &&
                              toggleMenu(item.label)}

                            {openMenus[item.label] && (

                              <div className={
                                collapsed
                                  ? "mt-2 flex flex-col items-center gap-3"
                                  : "mt-2 space-y-2 ml-14"
                              }>

                                {item.children
                                  .filter(
                                    (child) =>
                                      !child.roles ||
                                      child.roles.includes(activeRole)
                                  )
                                  .map((child) => {

                                    const isActive =
                                      location.pathname === child.path ||
                                      location.pathname.startsWith(child.path + "/");

                                    return (

                                      <Link
                                        key={child.label}
                                        to={child.path}
                                        title={child.label}

                                        className={
                                          collapsed
                                            ? `w-1.5 h-1.5 rounded-full cursor-pointer 
${isActive
                                              ? "bg-lavender--600 opacity-100 scale-110"
                                              : "bg-gray-500 hover:bg-lavender--600 opacity-70 hover:opacity-100"
                                            }`
                                            :
                                            `flex items-center gap-2 px-6 py-3 rounded-lg ${isActive
                                              ? "text-lavender--600 font-semibold"
                                              : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                                            }`
                                        }

                                        onClick={() => {
                                          setActiveChildParent(item.label);
                                          setOpenMenus({
                                            [item.label]: true
                                          });
                                        }}

                                      >

                                        {!collapsed && (
                                          <>
                                            <span
                                              className={`w-2 h-2 rounded-full ${isActive
                                                ? "bg-lavender--600"
                                                : "bg-gray-500"
                                                }`}
                                            ></span>

                                            {child.label}
                                          </>
                                        )}

                                      </Link>

                                    );

                                  })}

                              </div>
                            )}
                          </>

                        ) : (

                          <Link
                            to={item.path}
                            className={`flex items-center py-3 rounded-e-lg group ${collapsed
                              ? "justify-center px-0"
                              : "px-10"
                              } ${location.pathname === item.path ||
                                location.pathname.startsWith(item.path + "/") ||
                                getBase(item.path) === currentBase
                                ? "bg-lavender--600 text-white"
                                : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                              }`}
                          >
                            <item.icon className="w-[24px] h-[24px]" />
                            {!collapsed && (
                              <span className="text-lg ms-3">
                                {item.label}
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </div>
              );
            })}
          </ul>
        </div>
      </aside>


    </div>
  );

}

export default Sidebar; 