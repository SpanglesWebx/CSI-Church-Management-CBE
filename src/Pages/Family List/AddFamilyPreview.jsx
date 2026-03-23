import React, { useEffect, useState } from 'react';
import profile from './img/profile.png'
import FamilyId from './img/FamilyId.png'
import Address from './img/Address.png'
import Eye from './img/eye.png'
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Spinners from "../../Components/Spinners";

const URL = import.meta.env.VITE_BACKEND_API_URL;
const FamilyList = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { id } = params
  console.log(id);
  const [Data, setData] = useState([]); // Initialize as an empty array

  useEffect(() => {
    const token = window.sessionStorage.getItem("token");
    const fetchData = async () => {
      try {
        const response = await axios.get(`${URL}/family/tree/list/${id}`, {
          headers: {
            Authorization: token,
          }
        });
        setData(response.data.FamilyDetails || []); // Safely handle empty or missing data
        console.log(response.data.FamilyDetails);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [id]); // Include `id` as a dependency to refetch on id change

  console.log(Data);

  // Only render familyData if Data exists and has at least one member
  const familyData = Data.length > 0 ? {
    head: {
      name: Data[0].member_name,
      id: id,
      address: Data[0].present_address || "",
      phone: Data[0].mobile_number,
    },
    members: Data
  } : null;

  return (
    <>
      {familyData ? (
        <div className="container mx-auto px-0 bg-white rounded-lg ">
          <p className="">
            <i onClick={() => navigate(-1)} className="hover:cursor-pointer fa-solid fa-arrow-left-long text-2xl m-2"></i>
          </p>
          {/* Family Header */}
          <div className="flex  justify-around p-4  mb-6 border-2 border-lavender--600 rounded ">

            <p className="text-[20px] font-semibold text-lavender--600 ">Family List</p>

            <div className="flex justify-around space-x-2">
              <div className="flex  justify-around space-x-2" >
                <img src={profile} style={{ width: "45px", height: "45px" }} />
                <div>
                  <p className="text-[20px] font-medium"> Family Head</p>
                  <p className="text-lg font-medium">{familyData.head.name}</p>
                  
                </div>
              </div>
              <div className="flex  justify-around space-x-2" >
                <img src={FamilyId} style={{ width: "45px", height: "45px" }} />
                <div>
                  <p className="text-[20px] font-medium"> Family ID</p>
                  <p className="text-lg font-medium ">{familyData.head.id}</p>
                  
                </div>
              </div>
              <div className="flex  justify-around space-x-2"  >
                <img src={Address} style={{ width: "45px", height: "45px" }} />
                <div>
                  <p className="text-[20px] font-medium">Address</p>
                  <p className="w-[250px]  text-lg font-medium ">{familyData.head.address}, Ph:{familyData.head.phone}</p>
                  {/* <p className="text-l font-medium">{familyData.head.phone}</p> */}
                  
                </div>
              </div>

            </div>
            <div>
              <Link to={`/admin/family/${id}/member/add/new`}
                className=" w-[150px] h-[40px]  px-4 py-2 text-white bg-lavender--600 rounded-lg hover:bg-lavender--600">
                + New member
              </Link>
            </div>
          </div>

          {/* Family Members Table */}
          <table className="min-w-full  border-collapse ">
            <thead>
              <tr className="text-left  border-b ">
                <th className="px-4 py-2">Sl. no.</th>
                <th className="px-4 py-2">Member Name</th>
                <th className="px-4 py-2">Member ID</th>
                <th className="px-4 py-2">Assigned Member ID</th>
                <th className="px-4 py-2">Relation</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {familyData.members.map((member, index) => (
                <tr key={member.id} className="border-b ">
                  <td className="px-4  py-3">{String(index + 1).padStart(2, '0')}</td>
                  <td className="px-4  py-3">{member.member_name}</td>
                  <td className="px-4  py-3">{member.member_id}</td>
                  <td className="px-4  py-3">{member.assigned_member_id}</td>
                  <td className="px-4  py-3">{member.relation}</td>
                  <td className="px-4  py-3">
                    <span className={member.status === 'Active' ? 'text-green-500' : 'text-red-500'}>{member.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/admin/member/${member.member_id}/preview`}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" style={{ width: "40px", height: "40px" }}>
                      {/* <i className="text-blue-500">👁️</i> */}
                      <i className="text-[#5868b3] fa-solid fa-eye"></i>
                      {/* <img src={Eye} style={{ width:"35px",height:"25px"}}/> */}
                    </Link>
                    {/* <Link
                      title="Add Member"
                      to={`/admin/family/${item.family_id}/member/add/new`}
                      className="px-3 py-1 space-x-2 text-sm text-white rounded bg-lavender-600 hover:bg-lavender-700 focus:ring-4 focus:ring-lavender-300"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </Link> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>) : <> <div className=" h-[50%] flex justify-center items-center"> <Spinners /></div></>}
    </>
  );
};

export default FamilyList;
