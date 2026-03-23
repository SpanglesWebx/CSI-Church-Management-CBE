import React, { useEffect, useState } from "react";
import Chart from "../../Components/DashBoard/Chart";
import StatsCard from "../../Components/DashBoard/StatusCard";
import FamilyList from "../../Components/DashBoard/FamilyList";
import ExpenseList from "../../Components/DashBoard/ExpenseList";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";
import Preview from "../Tree/Preview";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import MembersSummaryCard from "../../Components/DashBoard/MembersSummaryCard";
import MemberTypesCard from "../../Components/DashBoard/MemberTypesCard";
import FamilyHeadsCard from "../../Components/DashBoard/FamilyHeadsCard";



function Dashboard() {
  const [families, setFamilies] = useState(0);
 
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


  const [isLoading, setIsLoading] = useState(false);

  const fetchFamilyCount = async () => {
    const res = await axios.get(`${URL}/family/count`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data.totalFamilies;
  };


  // const fetchMemberCount = async () => {
  //   const res = await axios.get(`${URL}/new-members/count`, {
  //     headers: {
  //       Authorization: token,
  //     },
  //   });

  //   return res.data.totalMembers;
  // };



  const fetchMemberCount = async () => {
    const res = await axios.get(`${URL}/new-members/count`, {
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
    const res = await axios.get(`${URL}/new-members/subscribed/count`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data.totalSubscribedMembers;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const familyCountData = await fetchFamilyCount();
        const memberCountData = await fetchMemberCount();
        const subscribedCountData = await fetchSubscribedMemberCount();

        setFamilies(familyCountData);
        setMemberStats(memberCountData);
        setSubscribedMemberCount(subscribedCountData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);




  return (
    <div className="p-4 ">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* <StatsCard
          title="Subscribed Members"
          value={subscribedMemberCount}
          icon={<FiUsers size={42} color="#8aaee0" />}
          loading={isLoading}
        />

        <StatsCard
          title="Total Members"
          value={memberCount}
          icon={<FiUsers size={42} color="#8aaee0" />}
          loading={isLoading}
        /> */}
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
        {/* <div className="w-full md:w-2/3">
          <Chart />
        </div> */}
      </div>
      {/* <div className="mt-4">
        <ExpenseList />
      </div> */}


      {/* SECOND ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">

        <MemberTypesCard
          types={memberStats.types}
          loading={isLoading}
        />

        <FamilyHeadsCard
          headYes={memberStats.headYes}
          headNo={memberStats.headNo}
          loading={isLoading}
        />

      </div>

      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </div>
  );
}

export default Dashboard;
