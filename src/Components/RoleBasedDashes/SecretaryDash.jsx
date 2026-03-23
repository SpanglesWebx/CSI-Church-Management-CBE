





// import React, { useEffect, useState } from "react";
// import Chart from "../../Components/DashBoard/Chart";

// import StatsCard from "../../Components/DashBoard/StatusCard";
// import FamilyList from "../../Components/DashBoard/FamilyList";
// import ExpenseList from "../../Components/DashBoard/ExpenseList";
// import axios from "axios";
// import { URL } from "../../App";
// import { useNavigate } from "react-router-dom";

// import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
// import { MdOutlineFamilyRestroom } from "react-icons/md";
// import { FiUsers } from "react-icons/fi";
// import MemberTypesCard from "../DashBoard/MemberTypesCard";
// import FamilyHeadsCard from "../../Components/DashBoard/FamilyHeadsCard";
// import MembersSummaryCard from "../../Components/DashBoard/MembersSummaryCard";
// import { FaReceipt } from "react-icons/fa";
// import { MdPayments } from "react-icons/md";
// import { HiOutlineDocumentText } from "react-icons/hi";

// import FinanceStatsCard from "../../Components/DashBoard/Accounts/FinanceStatsCard";
// import CashBalanceCard from "../../Components/DashBoard/Accounts/CashBalanceCard";
// import BankBalanceCard from "../../Components/DashBoard/Accounts/BankBalanceCard";
// import SectionDivider from "../../Components/DashBoard/SectionDivider";
// import CemeteryFinanceStatsCard from "../../Components/DashBoard/Cemetery/CemeteryFinanceStatsCard";
// import CemeteryCashBalanceCard from "../../Components/DashBoard/Cemetery/CemeteryCashBalanceCard";
// import CemeteryBankBalanceCard from "../../Components/DashBoard/Cemetery/CemeteryBankBalanceCard";
// import WomenFinanceStatsCard from "../../Components/DashBoard/WomenAccounts/WomenFinanceStatsCard";
// import WomenCashBalanceCard from "../../Components/DashBoard/WomenAccounts/WomenCashBalanceCard";
// import WomenBankBalanceCard from "../../Components/DashBoard/WomenAccounts/WomenBankBalanceCard";

// export const SecretaryDash = () => {
//   const [families, setFamilies] = useState(0);
//   const [memberCount, setMemberCount] = useState(0);
//   const [subscribedMemberCount, setSubscribedMemberCount] = useState(0);
//   const navigate = useNavigate();
//   const token = window.sessionStorage.getItem("token");
//   const [Response, setResponse] = useState({
//     status: null,
//     message: "",
//   });


//   const [memberStats, setMemberStats] = useState({
//     total: 0,
//     types: [],
//     headYes: 0,
//     headNo: 0
//   });


//   const [generalFund, setGeneralFund] = useState({
//     receiptsCount: 0,
//     receiptsAmount: 0,
//     paymentsCount: 0,
//     paymentsAmount: 0,
//     journalsCount: 0,
//     journalsAmount: 0,
//   });

//   const [balanceSummary, setBalanceSummary] = useState({
//     cashInHand: 0,
//     pettyCash: 0,
//     banks: []
//   });

//   const [isLoading, setIsLoading] = useState(false);

//   const fetchFamilyCount = async () => {
//     const res = await axios.get(`${URL}/dashboard/Secretary/family-count`, {
//       headers: {
//         Authorization: token,
//       },
//     });

//     return res.data.totalFamilies;
//   };


//   const fetchMemberCount = async () => {
//     const res = await axios.get(`${URL}/dashboard/Secretary/member-count`, {
//       headers: { Authorization: token },
//     });

//     const data = res.data;

//     return {
//       total: data.totalMembers?.[0]?.count || 0,
//       types: data.memberTypes,
//       headYes: data.headYes?.[0]?.count || 0,
//       headNo: data.headNo?.[0]?.count || 0
//     };
//   };

//   const fetchSubscribedMemberCount = async () => {
//     const res = await axios.get(`${URL}/dashboard/Secretary/member-subscribed/count`, {
//       headers: {
//         Authorization: token,
//       },
//     });

//     return res.data.totalSubscribedMembers;
//   };


//   const fetchGeneralFund = async () => {
//     const res = await axios.get(
//       `${URL}/dashboard/Secretary/general-fund/today`,
//       {
//         headers: { Authorization: token }
//       }
//     );

//     return res.data;
//   };


//   const fetchBalanceSummary = async () => {
//     const res = await axios.get(
//       `${URL}/dashboard/Secretary/balance-summary`,
//       {
//         headers: { Authorization: token }
//       }
//     );

//     return res.data;
//   };



//   useEffect(() => {
//     let mounted = true;

//     const fetchData = async () => {
//       try {
//         setIsLoading(true);

//         const [
//           familyCountData,
//           memberCountData,
//           subscribedCountData,
//           generalFundData,
//           balanceSummaryData
//         ] = await Promise.all([
//           fetchFamilyCount(),
//           fetchMemberCount(),
//           fetchSubscribedMemberCount(),
//           fetchGeneralFund(),
//           fetchBalanceSummary()
//         ]);

//         if (!mounted) return;

//         setFamilies(familyCountData);
//         setMemberStats(memberCountData);
//         setSubscribedMemberCount(subscribedCountData);
//         setGeneralFund(generalFundData);
//         setBalanceSummary(balanceSummaryData);

//       } catch (error) {
//         console.error("Error fetching dashboard data:", error);
//       } finally {
//         if (mounted) setIsLoading(false);
//       }
//     };

//     fetchData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   return (
//     <div className="p-4">





//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

//         <div className="sm:col-span-2">
//           <MembersSummaryCard
//             subscribed={subscribedMemberCount}
//             total={memberStats.total}
//             loading={isLoading}
//           />
//         </div>

//         <StatsCard
//           title="Families"
//           value={families}
//           icon={<MdOutlineFamilyRestroom size={42} color="#8aaee0" />}
//           loading={isLoading}
//         />

//       </div>




//       <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">

//         <MemberTypesCard
//           types={memberStats.types}
//           loading={isLoading}
//         />

//         <FamilyHeadsCard
//           headYes={memberStats.headYes}
//           headNo={memberStats.headNo}
//           loading={isLoading}
//         />

//       </div>


//       <div className="mt-6">

//         <SectionDivider title="General Fund A/C" />



//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

//           <FinanceStatsCard
//             title="Receipts"
//             count={generalFund.receiptsCount}
//             amount={generalFund.receiptsAmount}
//             icon={<FaReceipt size={32} />}
//             loading={isLoading}
//           />

//           <FinanceStatsCard
//             title="Payments"
//             count={generalFund.paymentsCount}
//             amount={generalFund.paymentsAmount}
//             icon={<MdPayments size={32} />}
//             loading={isLoading}
//           />

//           <FinanceStatsCard
//             title="Journal"
//             count={generalFund.journalsCount}
//             amount={generalFund.journalsAmount}
//             icon={<HiOutlineDocumentText size={32} />}
//             loading={isLoading}
//           />

//         </div>

//       </div>







//       <div className="mt-6">



//         <SectionDivider title="Account Balances" />



//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//           <CashBalanceCard
//             cashInHand={balanceSummary.cashInHand}
//             pettyCash={balanceSummary.pettyCash}
//             loading={isLoading}
//           />

//           <BankBalanceCard
//             banks={balanceSummary.banks}
//             loading={isLoading}
//           />

//         </div>

//       </div>


//       <div className="mt-6">
//         <SectionDivider title="Cemetery Fund A/C" />

//         <CemeteryFinanceStatsCard />
//       </div>



//       <div className="mt-6">

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//           <CemeteryCashBalanceCard />

//           <CemeteryBankBalanceCard />

//         </div>

//       </div>


//       <div className="mt-6">

//         <SectionDivider title="Women Fund A/C" />

//         <WomenFinanceStatsCard />

//       </div>


//       <div className="mt-6">

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//           <WomenCashBalanceCard />

//           <WomenBankBalanceCard />

//         </div>

//       </div>


//       {/* Toast */}
//       {Response.status !== null ? (
//         Response.status === "Success" ? (
//           <SuccessMessage Message={Response.message} />
//         ) : (
//           <FailedMessage Message={Response.message} />
//         )
//       ) : null}

//     </div>
//   );
// }









import React, { useEffect, useState } from "react";
import Chart from "../../Components/DashBoard/Chart";

import StatsCard from "../../Components/DashBoard/StatusCard";
import FamilyList from "../../Components/DashBoard/FamilyList";
import ExpenseList from "../../Components/DashBoard/ExpenseList";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";

import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import MemberTypesCard from "../DashBoard/MemberTypesCard";
import FamilyHeadsCard from "../../Components/DashBoard/FamilyHeadsCard";
import MembersSummaryCard from "../../Components/DashBoard/MembersSummaryCard";
import { FaReceipt } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

import FinanceStatsCard from "../../Components/DashBoard/Accounts/FinanceStatsCard";
import CashBalanceCard from "../../Components/DashBoard/Accounts/CashBalanceCard";
import BankBalanceCard from "../../Components/DashBoard/Accounts/BankBalanceCard";
import SectionDivider from "../../Components/DashBoard/SectionDivider";
import CemeteryFinanceStatsCard from "../../Components/DashBoard/Cemetery/CemeteryFinanceStatsCard";
import CemeteryCashBalanceCard from "../../Components/DashBoard/Cemetery/CemeteryCashBalanceCard";
import CemeteryBankBalanceCard from "../../Components/DashBoard/Cemetery/CemeteryBankBalanceCard";
import WomenFinanceStatsCard from "../../Components/DashBoard/WomenAccounts/WomenFinanceStatsCard";
import WomenCashBalanceCard from "../../Components/DashBoard/WomenAccounts/WomenCashBalanceCard";
import WomenBankBalanceCard from "../../Components/DashBoard/WomenAccounts/WomenBankBalanceCard";

export const  SecretaryDash = () => {
  const [families, setFamilies] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [subscribedMemberCount, setSubscribedMemberCount] = useState(0);
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });


  const [memberStats, setMemberStats] = useState({
    total: 0,
    types: [],
    headYes: 0,
    headNo: 0
  });


  const [generalFund, setGeneralFund] = useState({
    receiptsCount: 0,
    receiptsAmount: 0,
    paymentsCount: 0,
    paymentsAmount: 0,
    journalsCount: 0,
    journalsAmount: 0,
  });

  const [balanceSummary, setBalanceSummary] = useState({
    cashInHand: 0,
    pettyCash: 0,
    banks: []
  });


  const [cemeteryFund, setCemeteryFund] = useState({
    receiptsCount: 0,
    receiptsAmount: 0,
    paymentsCount: 0,
    paymentsAmount: 0,
    journalsCount: 0,
    journalsAmount: 0,
  });


  const [cemeteryBalanceSummary, setCemeteryBalanceSummary] = useState({
    cashInHand: 0,
    pettyCash: 0,
    banks: [],
    totalBankBalance: 0
  });


  const [womenFund, setWomenFund] = useState({
    receiptsCount: 0,
    receiptsAmount: 0,
    paymentsCount: 0,
    paymentsAmount: 0,
    journalsCount: 0,
    journalsAmount: 0,
  });

  const [womenBalanceSummary, setWomenBalanceSummary] = useState({
    cashInHand: 0,
    pettyCash: 0,
    banks: [],
    totalBankBalance: 0
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchFamilyCount = async () => {
    const res = await axios.get(`${URL}/dashboard/secretary/family-count`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data.totalFamilies;
  };


  const fetchMemberCount = async () => {
    const res = await axios.get(`${URL}/dashboard/secretary/member-count`, {
      headers: { Authorization: token },
    });

    const data = res.data;

    return {
      total: data.totalMembers?.[0]?.count || 0,
      types: data.memberTypes,
      headYes: data.headYes?.[0]?.count || 0,
      headNo: data.headNo?.[0]?.count || 0
    };
  };

  const fetchSubscribedMemberCount = async () => {
    const res = await axios.get(`${URL}/dashboard/secretary/member-subscribed/count`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data.totalSubscribedMembers;
  };


  const fetchGeneralFund = async () => {
    const res = await axios.get(
      `${URL}/dashboard/secretary/general-fund/today`,
      {
        headers: { Authorization: token }
      }
    );

    return res.data;
  };


  const fetchBalanceSummary = async () => {
    const res = await axios.get(
      `${URL}/dashboard/secretary/balance-summary`,
      {
        headers: { Authorization: token }
      }
    );

    return res.data;
  };



  const fetchCemeteryFund = async () => {
    const res = await axios.get(
      `${URL}/dashboard/secretary/cemetery-fund/today`,
      {
        headers: { Authorization: token }
      }
    );

    return res.data;
  };


  const fetchCemeteryBalanceSummary = async () => {
    const res = await axios.get(
      `${URL}/dashboard/secretary/cemetery-balance-summary`,
      {
        headers: { Authorization: token }
      }
    );

    return res.data;
  };


  const fetchWomenFund = async () => {
    const res = await axios.get(
      `${URL}/dashboard/secretary/women-fund/today`,
      {
        headers: { Authorization: token }
      }
    );

    return res.data;
  };


  const fetchWomenBalanceSummary = async () => {
    const res = await axios.get(
      `${URL}/dashboard/secretary/women-balance-summary`,
      {
        headers: { Authorization: token }
      }
    );

    return res.data;
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [
          familyCountData,
          memberCountData,
          subscribedCountData,
          generalFundData,
          balanceSummaryData,
          cemeteryFundData,
          cemeteryBalanceData,
          womenFundData,
          womenBalanceData,
        ] = await Promise.all([
          fetchFamilyCount(),
          fetchMemberCount(),
          fetchSubscribedMemberCount(),
          fetchGeneralFund(),
          fetchBalanceSummary(),
          fetchCemeteryFund(),
          fetchCemeteryBalanceSummary(),
          fetchWomenFund(),
          fetchWomenBalanceSummary()
        ]);

        if (!mounted) return;

        setFamilies(familyCountData);
        setMemberStats(memberCountData);
        setSubscribedMemberCount(subscribedCountData);
        setGeneralFund(generalFundData);
        setBalanceSummary(balanceSummaryData);
        setCemeteryFund(cemeteryFundData);
        setCemeteryBalanceSummary(cemeteryBalanceData);
        setWomenFund(womenFundData);
        setWomenBalanceSummary(womenBalanceData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4">






      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="sm:col-span-2">
          <MembersSummaryCard
            subscribed={subscribedMemberCount}
            total={memberStats.total}
            loading={isLoading}
          />
        </div>

        <StatsCard
          title="Families"
          value={families}
          icon={<MdOutlineFamilyRestroom size={42} color="#8aaee0" />}
          loading={isLoading}
        />

      </div>







      <div className="mt-6">

        <SectionDivider title="General Fund A/C" />



        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <FinanceStatsCard
            title="Receipts"
            count={generalFund.receiptsCount}
            amount={generalFund.receiptsAmount}
            icon={<FaReceipt size={32} />}
            loading={isLoading}
          />

          <FinanceStatsCard
            title="Payments"
            count={generalFund.paymentsCount}
            amount={generalFund.paymentsAmount}
            icon={<MdPayments size={32} />}
            loading={isLoading}
          />

          <FinanceStatsCard
            title="Journal"
            count={generalFund.journalsCount}
            amount={generalFund.journalsAmount}
            icon={<HiOutlineDocumentText size={32} />}
            loading={isLoading}
          />

        </div>

      </div>







      <div className="mt-6">



        <SectionDivider title="Account Balances" />



        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <CashBalanceCard
            cashInHand={balanceSummary.cashInHand}
            pettyCash={balanceSummary.pettyCash}
            loading={isLoading}
          />

          <BankBalanceCard
            banks={balanceSummary.banks}
            loading={isLoading}
          />

        </div>

      </div>


      <div className="mt-6">
        <SectionDivider title="Cemetery Fund A/C" />

        <CemeteryFinanceStatsCard
          receiptsCount={cemeteryFund.receiptsCount}
          receiptsAmount={cemeteryFund.receiptsAmount}
          paymentsCount={cemeteryFund.paymentsCount}
          paymentsAmount={cemeteryFund.paymentsAmount}
          journalsCount={cemeteryFund.journalsCount}
          journalsAmount={cemeteryFund.journalsAmount}
          loading={isLoading}
        />
      </div>



      <div className="mt-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <CemeteryCashBalanceCard
            cashInHand={cemeteryBalanceSummary.cashInHand}
            pettyCash={cemeteryBalanceSummary.pettyCash}
            loading={isLoading}
          />

          <CemeteryBankBalanceCard
            banks={cemeteryBalanceSummary.banks}
            totalBankBalance={cemeteryBalanceSummary.totalBankBalance}
            loading={isLoading}
          />

        </div>

      </div>


      <div className="mt-6">

        <SectionDivider title="Women Fund A/C" />

        <WomenFinanceStatsCard
          receiptsCount={womenFund.receiptsCount}
          receiptsAmount={womenFund.receiptsAmount}
          paymentsCount={womenFund.paymentsCount}
          paymentsAmount={womenFund.paymentsAmount}
          journalsCount={womenFund.journalsCount}
          journalsAmount={womenFund.journalsAmount}
          loading={isLoading}
        />

      </div>


      <div className="mt-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <WomenCashBalanceCard
            cashInHand={womenBalanceSummary.cashInHand}
            pettyCash={womenBalanceSummary.pettyCash}
            loading={isLoading}
          />

          <WomenBankBalanceCard
            banks={womenBalanceSummary.banks}
            totalBankBalance={womenBalanceSummary.totalBankBalance}
            loading={isLoading}
          />

        </div>

      </div>


      {/* Toast */}
      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      ) : null}

    </div>
  );
}

