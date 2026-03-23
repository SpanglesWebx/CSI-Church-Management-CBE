import React, { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import { MdDelete, MdVerified } from 'react-icons/md';
import { URL } from '../../App';
import axios from 'axios';

export const AddMarriageCert = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [groomPhoto, setGroomPhoto] = useState(null);
const [bridePhoto, setBridePhoto] = useState(null);
  const token = sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [pastors, setPastors] = useState([
    { name: "", qualification: "", responsibility: "", pastor_role: "" }
  ]);
  const [pastorList, setPastorList] = useState([]);
  const [activeTab, setActiveTab] = useState("groom");
  const [isChurchMember, setIsChurchMember] = useState("");

  const [churchDetails, setChurchDetails] = useState({
    churchName: "",
    pastorateName: "",
    diocese: ""
  });
  const [isBrideChurchMember, setIsBrideChurchMember] = useState("");

  const [brideChurchDetails, setBrideChurchDetails] = useState({
    churchName: "",
    pastorateName: "",
    diocese: ""
  });
  const [certBeforeBannsIssued, setCertBeforeBannsIssued] = useState("");
  const [certBeforeBannsIssuedDate, setCertBeforeBannsIssuedDate] = useState("");
  const [certBeforeBannsReceived, setCertBeforeBannsReceived] = useState("");
  const [certBeforeBannsReceivedDate, setCertBeforeBannsReceivedDate] = useState("");
  const [certAfterBannsIssued, setCertAfterBannsIssued] = useState("");
  const [certAfterBannsIssuedDate, setCertAfterBannsIssuedDate] = useState("");
  const [certAfterBannsReceived, setCertAfterBannsReceived] = useState("");
  const [certAfterBannsReceivedDate, setCertAfterBannsReceivedDate] = useState("");
  const [marriageCertIssued, setMarriageCertIssued] = useState("");
  const [marriageCertIssuedDate, setMarriageCertIssuedDate] = useState("");
  const [witnesses, setWitnesses] = useState([
    { name: "", fatherName: "", address: "", phone: "" }
  ]);
  const [isGroomMember, setIsGroomMember] = useState(true);

  const [groomMemberIdSearch, setGroomMemberIdSearch] = useState("");
  const [groomMemberNameSearch, setGroomMemberNameSearch] = useState("");

  const [groomDropdownById, setGroomDropdownById] = useState([]);
  const [groomDropdownByName, setGroomDropdownByName] = useState([]);

  const [groomData, setGroomData] = useState({
    memberId: "",
    memberName: "",
    phone: "",
    nonMemberName: "",
    nonMemberPhone: "",
  });
  const latestSearchRef = useRef("");
  const [groomForm, setGroomForm] = useState({
    dob: "",
    age: "",
    profession: "",
    maritalStatus: "",
    fatherName: "",
    motherName: "",
    address: "",
    pincode: "",
    phone: "",
  });

  // Bride member toggle
  const [isBrideMember, setIsBrideMember] = useState(true);

  // Search inputs
  const [brideMemberIdSearch, setBrideMemberIdSearch] = useState("");
  const [brideMemberNameSearch, setBrideMemberNameSearch] = useState("");

  // Dropdowns
  const [brideDropdownById, setBrideDropdownById] = useState([]);
  const [brideDropdownByName, setBrideDropdownByName] = useState([]);

  // Bride form
  const [brideForm, setBrideForm] = useState({
    dob: "",
    age: "",
    profession: "",
    maritalStatus: "",
    fatherName: "",
    motherName: "",
    address: "",
    pincode: "",
    phone: "",
  });

  // Non-member bride
  const [brideData, setBrideData] = useState({
    nonMemberName: "",
    nonMemberPhone: "",
  });
  const [marriageMeta, setMarriageMeta] = useState({
    marriageId: "",
    registerSlNo: ""
  });
  // Banns & Wedding details
  const [betrothalDate, setBetrothalDate] = useState("");
  const [betrothalPlace, setBetrothalPlace] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingInOurChurch, setWeddingInOurChurch] = useState("");
  const [bannsLicense, setBannsLicense] = useState("");

  const [banns1, setBanns1] = useState("");
  const [banns2, setBanns2] = useState("");
  const [banns3, setBanns3] = useState("");

  const TAB_ORDER = ["groom", "bride", "banns", "pastor"];
  const [completedTabs, setCompletedTabs] = useState({
    groom: false,
    bride: false,
    banns: false,
    pastor: false
  });

  const isGroomTabValid = () => {
    if (!marriageMeta.marriageId || !marriageMeta.registerSlNo) return false;

    if (isGroomMember) {
      return groomMemberIdSearch || groomMemberNameSearch;
    } else {
      return groomData.nonMemberName && groomData.nonMemberPhone;
    }
  };

  const isBrideTabValid = () => {
    if (isBrideMember) {
      return brideMemberIdSearch || brideMemberNameSearch;
    } else {
      return brideData.nonMemberName && brideData.nonMemberPhone;
    }
  };

  const isBannsTabValid = () => {
    return weddingDate && banns1;
  };

  const isPastorTabValid = () => {
    return pastors.length > 0 && pastors[0].name;
  };

  const canProceed = () => {
    switch (activeTab) {
      case "groom": return isGroomTabValid();
      case "bride": return isBrideTabValid();
      case "banns": return isBannsTabValid();
      case "pastor": return isPastorTabValid();
      default: return false;
    }
  };

  const handleSaveAndNext = () => {
    // mark tab as completed
    setCompletedTabs(prev => ({
      ...prev,
      [activeTab]: true
    }));

    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const nextTab = TAB_ORDER[currentIndex + 1];

    if (nextTab) {
      setActiveTab(nextTab);
    }
  };

  const handlePrevious = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const prevTab = TAB_ORDER[currentIndex - 1];

    if (prevTab) {
      setActiveTab(prevTab);
    }
  };


  const groomName =
    isGroomMember
      ? groomMemberNameSearch
      : groomData.nonMemberName;

  const brideName =
    isBrideMember
      ? brideMemberNameSearch
      : brideData.nonMemberName;




  const handleChurchMemberChange = (value) => {
    setIsChurchMember(value);

    if (value === "Yes") {
      setChurchDetails({
        churchName: "CSI Christ Church Trichy Road Coimbatore",
        pastorateName: "CSI Christ Church Trichy Road Coimbatore",
        diocese: "Coimbatore Diocese"
      });
    } else {
      setChurchDetails({
        churchName: "",
        pastorateName: "",
        diocese: ""
      });
    }
  };

  const handleBrideChurchMemberChange = (value) => {
    setIsBrideChurchMember(value);

    if (value === "Yes") {
      setBrideChurchDetails({
        churchName: "CSI Christ Church Trichy Road Coimbatore",
        pastorateName: "CSI Christ Church Trichy Road Coimbatore",
        diocese: "Coimbatore Diocese"
      });
    } else {
      setBrideChurchDetails({
        churchName: "",
        pastorateName: "",
        diocese: ""
      });
    }
  };

  const handleCertBeforeBannsChange = (value) => {
    setCertBeforeBannsIssued(value);

    // If switched to No, clear date
    if (value !== "Yes") {
      setCertBeforeBannsIssuedDate("");
    }
  };


  const updatePastor = (index, field, value) => {
    const data = [...pastors];
    data[index][field] = value;
    setPastors(data);
  };

  const addPastorRow = () => {
    setPastors([...pastors, { name: "", qualification: "", responsibility: "" }]);
  };

  const removePastorRow = (index) => {
    setPastors(pastors.filter((_, i) => i !== index));
  };

  const canAddRow = (row) =>
    row.name.trim() && row.qualification.trim() && row.responsibility.trim();

  const TABS = [
    { key: "groom", label: "Bridegroom" },
    { key: "bride", label: "Bride" },
    { key: "banns", label: "Banns & Certificates" },
    { key: "pastor", label: "Marriage Solmenized By" }
  ];

  const updateWitness = (index, field, value) => {
    const data = [...witnesses];
    data[index][field] = value;
    setWitnesses(data);
  };

  const addWitness = () => {
    setWitnesses([
      ...witnesses,
      { name: "", fatherName: "", address: "", phone: "" }
    ]);
  };

  const removeWitness = (index) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const canAddWitness = (witness) =>
    witness.name.trim() &&
    witness.fatherName.trim() &&
    witness.address.trim() &&
    witness.phone.trim();

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearchMaleById = useRef(
    debounce(async (val) => {
      if (!val) {
        setGroomDropdownById([]);
        return;
      }

      latestSearchRef.current = val;

      try {
        const res = await axios.get(
          `${URL}/groom-members/search-by-id?id=${encodeURIComponent(val)}`,
          { headers: { Authorization: token } }
        );

        if (latestSearchRef.current === val) {
          setGroomDropdownById(res.data || []);
        }
      } catch (err) {
        if (latestSearchRef.current !== val) return;

        if (err.response?.status === 404) {
          setGroomDropdownById([
            { member_id: "none", member_name: "No members found" },
          ]);
        } else {
          setGroomDropdownById([]);
        }
      }
    }, 300)
  ).current;

  const debouncedSearchMaleByName = useRef(
    debounce(async (val) => {
      if (!val) {
        setGroomDropdownByName([]);
        return;
      }

      latestSearchRef.current = val;

      try {
        const res = await axios.get(
          `${URL}/groom-members/search-by-name?name=${encodeURIComponent(val)}`,
          { headers: { Authorization: token } }
        );

        if (latestSearchRef.current === val) {
          setGroomDropdownByName(res.data || []);
        }
      } catch (err) {
        if (latestSearchRef.current !== val) return;

        if (err.response?.status === 404) {
          setGroomDropdownByName([
            { member_id: "none", member_name: "No members found" },
          ]);
        } else {
          setGroomDropdownByName([]);
        }
      }
    }, 300)
  ).current;

  const handleSelectGroomMember = (m) => {
    if (m.member_id === "none") return;

    setGroomMemberIdSearch(m.member_id);
    setGroomMemberNameSearch(m.member_name);

    setGroomForm({
      dob: m.dob || "",
      age: m.age || "",
      profession: m.occupation || "",
      maritalStatus: m.marital_status || "",
      fatherName: m.father_name || "",
      motherName: m.mother_name || "",
      address: m.present_address || "",
      pincode: m.present_pincode || "",
      phone: m.primary_contact_number || "",
    });

    setGroomDropdownById([]);
    setGroomDropdownByName([]);
  };

  const debouncedSearchBrideById = useRef(
    debounce(async (val) => {
      if (!val) {
        setBrideDropdownById([]);
        return;
      }

      latestSearchRef.current = val;

      try {
        const res = await axios.get(
          `${URL}/bride-members/search-by-id?id=${encodeURIComponent(val)}`,
          { headers: { Authorization: token } }
        );

        if (latestSearchRef.current === val) {
          setBrideDropdownById(res.data || []);
        }
      } catch (err) {
        if (latestSearchRef.current !== val) return;

        if (err.response?.status === 404) {
          setBrideDropdownById([
            { member_id: "none", member_name: "No members found" },
          ]);
        } else {
          setBrideDropdownById([]);
        }
      }
    }, 300)
  ).current;

  const debouncedSearchBrideByName = useRef(
    debounce(async (val) => {
      if (!val) {
        setBrideDropdownByName([]);
        return;
      }

      latestSearchRef.current = val;

      try {
        const res = await axios.get(
          `${URL}/bride-members/search-by-name?name=${encodeURIComponent(val)}`,
          { headers: { Authorization: token } }
        );

        if (latestSearchRef.current === val) {
          setBrideDropdownByName(res.data || []);
        }
      } catch (err) {
        if (latestSearchRef.current !== val) return;

        if (err.response?.status === 404) {
          setBrideDropdownByName([
            { member_id: "none", member_name: "No members found" },
          ]);
        } else {
          setBrideDropdownByName([]);
        }
      }
    }, 300)
  ).current;

  const handleSelectBrideMember = (m) => {
    if (m.member_id === "none") return;

    setBrideMemberIdSearch(m.member_id);
    setBrideMemberNameSearch(m.member_name);

    setBrideForm({
      dob: m.dob || "",
      age: m.age || "",
      profession: m.occupation || "",
      maritalStatus: m.marital_status || "",
      fatherName: m.father_name || "",
      motherName: m.mother_name || "",
      address: m.present_address || "",
      pincode: m.present_pincode || "",
      phone: m.primary_contact_number || "",
    });

    setBrideDropdownById([]);
    setBrideDropdownByName([]);
  };

  // inside AddMarriageCert component
  const fetchPreview = async () => {
  try {
    const res = await axios.get(
      `${URL}/marriage-certificate/preview-code`,
      { headers: { Authorization: token } }
    );
 
    if (res.data?.marriageCode) {
      setMarriageMeta(prev => ({
        ...prev,
        marriageId: res.data.marriageCode
      }));
    }
  } catch (err) {
    console.error(
      "preview code fetch failed",
      err?.response?.data || err.message
    );
  }
};
 
 
useEffect(() => {
  fetchPreview();
}, []);

  useEffect(() => {
    axios
      .get(`${URL}/pastors/active/list`, {
        headers: { Authorization: token }
      })
      .then(res => {
        setPastorList(res.data.data || []);
      })
      .catch(err => {
        console.error("Failed to load pastors", err);
      });
  }, []);

  const resetForm = async () => {
    // Tabs
    setActiveTab("groom");
    setCompletedTabs({
      groom: false,
      bride: false,
      banns: false,
      pastor: false
    });

    // Marriage meta (reset everything)
    setMarriageMeta({
      marriageId: "",
      registerSlNo: ""
    });

    // Groom
    setIsGroomMember(true);
    setGroomMemberIdSearch("");
    setGroomMemberNameSearch("");
    setGroomDropdownById([]);
    setGroomDropdownByName([]);
    setGroomData({
      memberId: "",
      memberName: "",
      phone: "",
      nonMemberName: "",
      nonMemberPhone: "",
    });
    setGroomForm({
      dob: "",
      age: "",
      profession: "",
      maritalStatus: "",
      fatherName: "",
      motherName: "",
      address: "",
      pincode: "",
      phone: "",
    });
    setIsChurchMember("");
    setChurchDetails({
      churchName: "",
      pastorateName: "",
      diocese: ""
    });

    // Bride
    setIsBrideMember(true);
    setBrideMemberIdSearch("");
    setBrideMemberNameSearch("");
    setBrideDropdownById([]);
    setBrideDropdownByName([]);
    setBrideData({
      nonMemberName: "",
      nonMemberPhone: "",
    });
    setBrideForm({
      dob: "",
      age: "",
      profession: "",
      maritalStatus: "",
      fatherName: "",
      motherName: "",
      address: "",
      pincode: "",
      phone: "",
    });
    setIsBrideChurchMember("");
    setBrideChurchDetails({
      churchName: "",
      pastorateName: "",
      diocese: ""
    });

    // Banns
    setBetrothalDate("");
    setBetrothalPlace("");
    setWeddingDate("");
    setWeddingInOurChurch("");
    setBannsLicense("");
    setBanns1("");
    setBanns2("");
    setBanns3("");

    setCertBeforeBannsIssued("");
    setCertBeforeBannsIssuedDate("");
    setCertBeforeBannsReceived("");
    setCertBeforeBannsReceivedDate("");
    setCertAfterBannsIssued("");
    setCertAfterBannsIssuedDate("");
    setCertAfterBannsReceived("");
    setCertAfterBannsReceivedDate("");
    setMarriageCertIssued("");
    setMarriageCertIssuedDate("");

    // Pastors & Witnesses
    setPastors([{ name: "", qualification: "", responsibility: "" }]);
    setWitnesses([{ name: "", fatherName: "", address: "", phone: "" }]);

    fetchPreview();
  };

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const handleSaveMarriage = async () => {
    if (saving) return;

    try {
      setSaving(true);

const formData = new FormData();

formData.append("registerSlNo", marriageMeta.registerSlNo);
formData.append("marriageCode", marriageMeta.marriageId);

// groom
formData.append("groom", JSON.stringify({
  isMember: isGroomMember,
  memberId: groomMemberIdSearch || "",
  memberName: groomMemberNameSearch || "",
  nonMemberName: groomData.nonMemberName || "",
  nonMemberPhone: groomData.nonMemberPhone || "",
  ...groomForm,
}));

// bride
formData.append("bride", JSON.stringify({
  isMember: isBrideMember,
  memberId: brideMemberIdSearch || "",
  memberName: brideMemberNameSearch || "",
  nonMemberName: brideData.nonMemberName || "",
  nonMemberPhone: brideData.nonMemberPhone || "",
  ...brideForm,
}));

formData.append("groomChurch", JSON.stringify(churchDetails));
formData.append("brideChurch", JSON.stringify(brideChurchDetails));
formData.append("banns", JSON.stringify({
  betrothalDate,
  betrothalPlace,
  weddingDate,
  weddingInOurChurch,
  bannsLicense,
  banns1,
  banns2,
  banns3,
  certBeforeBannsIssued,
  certBeforeBannsIssuedDate,
  certBeforeBannsReceived,
  certBeforeBannsReceivedDate,
  certAfterBannsIssued,
  certAfterBannsIssuedDate,
  certAfterBannsReceived,
  certAfterBannsReceivedDate,
  marriageCertIssued,
  marriageCertIssuedDate,
}));

formData.append("pastors", JSON.stringify(pastors));
formData.append("witnesses", JSON.stringify(witnesses));

// Attach photos
if (groomPhoto) formData.append("groomPhoto", groomPhoto);
if (bridePhoto) formData.append("bridePhoto", bridePhoto);


const res = await axios.post(
  `${URL}/marriage-certificate`,
  formData,
  {
    headers: {
      Authorization: token,
      "Content-Type": "multipart/form-data",
    },
  }
);

      if (res.status === 201) {
        const { marriageCode, marriageId } = res.data;

        setMarriageMeta((prev) => ({ ...prev, marriageId }));

        showToast("Success", `Marriage saved. ID: ${marriageCode}`);

        await resetForm();

        setCompletedTabs((prev) => ({ ...prev, pastor: true }));

      } else {
        showToast(
          "Failed",
          res.data?.message || "Save failed"
        );
      }
    } catch (err) {
      console.error(
        "Save marriage error:",
        err?.response?.data || err.message
      );

      showToast(
        "Failed",
        err.response?.data?.message || "Server error"
      );
    } finally {
      setSaving(false);
    }
  };



  return (
    <>
      <FaArrowLeft
        size={18}
        title='Back'
        onClick={() => navigate("/admin/mrgcertlist")}
        className="cursor-pointer mb-4"
      />
      <h1 className="text-lg text-lavender--600 font-semibold">Add Marriage</h1>

      <div className="flex justify-center mb-5">
        <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-[80%]">

          {/* Sliding highlight */}
          <div
            className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
            style={{
              width: `calc(${100 / TABS.length}% - 0.25rem)`,
              transform: `translateX(${TABS.findIndex(t => t.key === activeTab) * 100}%)`
            }}
          />

          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 py-1 text-center rounded-full transition-all pointer-events-none
          ${activeTab === tab.key ? "text-white" : "text-gray-700"}
        `}
            >
              <span className="flex items-center justify-center gap-1">
                {tab.label}
                {completedTabs[tab.key] && (
                  <MdVerified className="text-green-500" size={18} />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>


      {activeTab === "groom" && (
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Bridegroom</h1>
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="mb-4 flex justify-end">
              <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                <div
                  className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                  style={{
                    width: "calc(50% - 0.25rem)",
                    transform: isGroomMember ? "translateX(0)" : "translateX(100%)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setIsGroomMember(true);
                    setGroomData({
                      memberId: "",
                      memberName: "",
                      phone: "",
                      nonMemberName: "",
                      nonMemberPhone: "",
                    });
                    setGroomMemberIdSearch("");
                    setGroomMemberNameSearch("");
                    setGroomDropdownById([]);
                    setGroomDropdownByName([]);
                  }}
                  className={`relative flex-1 py-1 text-center rounded-full ${isGroomMember ? "text-white" : "text-gray-700"
                    }`}
                >
                  Member
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsGroomMember(false);
                    setGroomData({
                      memberId: "",
                      memberName: "",
                      phone: "",
                      nonMemberName: "",
                      nonMemberPhone: "",
                    });
                    setGroomMemberIdSearch("");
                    setGroomMemberNameSearch("");
                    setGroomDropdownById([]);
                    setGroomDropdownByName([]);
                  }}
                  className={`relative flex-1 py-1 text-center rounded-full ${!isGroomMember ? "text-white" : "text-gray-700"
                    }`}
                >
                  Non-Member
                </button>
              </div>
            </div>
            {isGroomMember ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 relative">
                  {/* Member ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member ID <span className='text-red-500 font-bold text-[17px]'>*</span></label>
                    <input
                      type="text"
                      value={groomMemberIdSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGroomMemberIdSearch(val);
                        debouncedSearchMaleById(val);
                      }}
                      placeholder='Search Member ID'
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Member Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Name <span className='text-red-500 font-bold text-[17px]'>*</span></label>
                    <input
                      type="text"
                      value={groomMemberNameSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGroomMemberNameSearch(val);
                        debouncedSearchMaleByName(val);
                      }}
                      placeholder='Search Member Name'
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  {(groomDropdownById.length > 0 || groomDropdownByName.length > 0) && (
                    <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                      {(groomDropdownById.length > 0
                        ? groomDropdownById
                        : groomDropdownByName
                      ).map((m) => (
                        <li
                          key={m.member_id}
                          className={`px-3 py-2 text-sm flex justify-between cursor-pointer
                              ${m.member_id === "none"
                              ? "text-gray-500 cursor-not-allowed"
                              : "hover:bg-indigo-50"
                            }`}
                          onClick={() => handleSelectGroomMember(m)}   // 👈 HERE
                        >
                          <span className="w-1/2 font-medium">
                            {m.member_id === "none" ? "-" : m.member_id}
                          </span>

                          {/* Name column */}
                          <span className="w-1/2">
                            {m.member_name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  {/* Non Member Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name <span className='text-red-500 font-bold text-[17px]'>*</span></label>
                    <input
                      type="text"
                      value={groomData.nonMemberName}
                      onChange={(e) =>
                        setGroomData({ ...groomData, nonMemberName: e.target.value })
                      }
                      placeholder='Enter Name'
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Non Member Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone <span className='text-red-500 font-bold text-[17px]'>*</span></label>
                    <input
                      type="text"
                      value={groomData.nonMemberPhone}
                      maxLength={10}
                      onChange={(e) =>
                        setGroomData({
                          ...groomData,
                          nonMemberPhone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder='Enter Phone Number'
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marriage ID <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>
              <input
                type="text"
                readOnly
                value={marriageMeta.marriageId}
                onChange={(e) =>
                  setMarriageMeta({
                    ...marriageMeta,
                    marriageId: e.target.value
                  })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sl No in Reg <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Sl No."
                value={marriageMeta.registerSlNo}
                onChange={(e) =>
                  setMarriageMeta({
                    ...marriageMeta,
                    registerSlNo: e.target.value
                  })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                value={groomForm.dob}
                onChange={(e) =>
                  setGroomForm({ ...groomForm, dob: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="text"
                placeholder="Enter Date of Birth"
                value={groomForm.age}
                onChange={(e) =>
                  setGroomForm({ ...groomForm, age: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profession
              </label>
              <input
                type="text"
                placeholder="Enter Profession"
                value={groomForm.profession}
                onChange={(e) =>
                  setGroomForm({ ...groomForm, profession: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marital Status
              </label>
              <input
                type="text"
                placeholder="Enter Marital Status"
                value={groomForm.maritalStatus}
                onChange={(e) =>
                  setGroomForm({ ...groomForm, maritalStatus: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Father Name
              </label>
              <input
                type="text"
                placeholder="Enter Father Name"
                value={groomForm.fatherName}
                onChange={(e) =>
                  setGroomForm({ ...groomForm, fatherName: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mother Name
              </label>
              <input
                type="text"
                placeholder="Enter Mother Name"
                value={groomForm.motherName}
                onChange={(e) =>
                  setGroomForm({ ...groomForm, motherName: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                placeholder="Enter Address"
                value={groomForm.address}
                onChange={(e) =>
                  setGroomForm({ ...groomForm, address: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
                type="text"
                placeholder="Enter Pincode"
                value={groomForm.pincode}
                onChange={(e) =>
                  setGroomForm({ ...groomForm, pincode: e.target.value.replace(/\D/g, "") })
                }
                maxLength={6}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={groomForm.phone}
                onChange={(e) =>
                  setGroomForm({
                    ...groomForm,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                }
                maxLength={10}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Our Church Member
              </label>

              <select
                value={isChurchMember}
                onChange={(e) => handleChurchMemberChange(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Church Name
              </label>
              <input
                type="text"
                placeholder="Enter Church Name"
                value={churchDetails.churchName}
                onChange={(e) =>
                  setChurchDetails({ ...churchDetails, churchName: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pastorate Name
              </label>
              <input
                type="text"
                placeholder="Enter Pastorate Name"
                value={churchDetails.pastorateName}
                onChange={(e) =>
                  setChurchDetails({ ...churchDetails, pastorateName: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Diocese
              </label>
              <input
                type="text"
                placeholder="Enter Diocese"
                value={churchDetails.diocese}
                onChange={(e) =>
                  setChurchDetails({ ...churchDetails, diocese: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Groom Photo</label>
<input
  type="file"
  accept=".jpg, .jpeg, .png"
  onChange={(e) => setGroomPhoto(e.target.files[0])}
  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
/>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bride" && (
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Bride</h1>
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="mb-4 flex justify-end">
              <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                <div
                  className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                  style={{
                    width: "calc(50% - 0.25rem)",
                    transform: isBrideMember ? "translateX(0)" : "translateX(100%)",
                  }}
                />

                {/* MEMBER */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBrideMember(true);
                    setBrideData({
                      nonMemberName: "",
                      nonMemberPhone: "",
                    });
                    setBrideMemberIdSearch("");
                    setBrideMemberNameSearch("");
                    setBrideDropdownById([]);
                    setBrideDropdownByName([]);
                  }}
                  className={`relative flex-1 py-1 text-center rounded-full ${isBrideMember ? "text-white" : "text-gray-700"
                    }`}
                >
                  Member
                </button>

                {/* NON MEMBER */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBrideMember(false);
                    setBrideData({
                      nonMemberName: "",
                      nonMemberPhone: "",
                    });
                    setBrideMemberIdSearch("");
                    setBrideMemberNameSearch("");
                    setBrideDropdownById([]);
                    setBrideDropdownByName([]);
                  }}
                  className={`relative flex-1 py-1 text-center rounded-full ${!isBrideMember ? "text-white" : "text-gray-700"
                    }`}
                >
                  Non-Member
                </button>
              </div>
            </div>

            {isBrideMember ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 relative">
                  {/* Member ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Member ID <span className='text-red-500 font-bold text-[17px]'>*</span>
                    </label>
                    <input
                      type="text"
                      value={brideMemberIdSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBrideMemberIdSearch(val);
                        debouncedSearchBrideById(val);
                      }}
                      placeholder="Search Member ID"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Member Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Member Name <span className='text-red-500 font-bold text-[17px]'>*</span>
                    </label>
                    <input
                      type="text"
                      value={brideMemberNameSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBrideMemberNameSearch(val);
                        debouncedSearchBrideByName(val);
                      }}
                      placeholder="Search Member Name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {(brideDropdownById.length > 0 ||
                    brideDropdownByName.length > 0) && (
                      <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                        {(brideDropdownById.length > 0
                          ? brideDropdownById
                          : brideDropdownByName
                        ).map((m) => (
                          <li
                            key={m.member_id}
                            className={`px-3 py-2 text-sm flex justify-between cursor-pointer
                  ${m.member_id === "none"
                                ? "text-gray-500 cursor-not-allowed"
                                : "hover:bg-indigo-50"
                              }`}
                            onClick={() => handleSelectBrideMember(m)}
                          >
                            <span className="w-1/2 font-medium">
                              {m.member_id === "none" ? "-" : m.member_id}
                            </span>
                            <span className="w-1/2">{m.member_name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  {/* Non Member Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name <span className='text-red-500 font-bold text-[17px]'>*</span>
                    </label>
                    <input
                      type="text"
                      value={brideData.nonMemberName}
                      onChange={(e) =>
                        setBrideData({
                          ...brideData,
                          nonMemberName: e.target.value,
                        })
                      }
                      placeholder="Enter Name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Non Member Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone <span className='text-red-500 font-bold text-[17px]'>*</span>
                    </label>
                    <input
                      type="text"
                      value={brideData.nonMemberPhone}
                      maxLength={10}
                      onChange={(e) =>
                        setBrideData({
                          ...brideData,
                          nonMemberPhone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="Enter Phone Number"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marriage ID <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>
              <input
                type="text"
                readOnly
                value={marriageMeta.marriageId}
                onChange={(e) =>
                  setMarriageMeta({
                    ...marriageMeta,
                    marriageId: e.target.value
                  })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sl No in Reg <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Sl No."
                value={marriageMeta.registerSlNo}
                onChange={(e) =>
                  setMarriageMeta({
                    ...marriageMeta,
                    registerSlNo: e.target.value
                  })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                value={brideForm.dob}
                onChange={(e) =>
                  setBrideForm({ ...brideForm, dob: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="text"
                placeholder="Enter Date of Birth"
                value={brideForm.age}
                onChange={(e) =>
                  setBrideForm({ ...brideForm, age: e.target.value.replace(/\D/g, "") })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profession
              </label>
              <input
                type="text"
                placeholder="Enter Profession"
                value={brideForm.profession}
                onChange={(e) =>
                  setBrideForm({ ...brideForm, profession: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marital Status
              </label>
              <input
                type="text"
                placeholder="Enter Marital Status"
                value={brideForm.maritalStatus}
                onChange={(e) =>
                  setBrideForm({ ...brideForm, maritalStatus: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Father Name
              </label>
              <input
                type="text"
                placeholder="Enter Father Name"
                value={brideForm.fatherName}
                onChange={(e) =>
                  setBrideForm({ ...brideForm, fatherName: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mother Name
              </label>
              <input
                type="text"
                placeholder="Enter Mother Name"
                value={brideForm.motherName}
                onChange={(e) =>
                  setBrideForm({ ...brideForm, motherName: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                placeholder="Enter Address"
                value={brideForm.address}
                onChange={(e) =>
                  setBrideForm({ ...brideForm, address: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
                type="text"
                placeholder="Enter Pincode"
                value={brideForm.pincode}
                onChange={(e) =>
                  setBrideForm({
                    ...brideForm,
                    pincode: e.target.value.replace(/\D/g, ""),
                  })
                }
                maxLength={6}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={brideForm.phone}
                onChange={(e) =>
                  setBrideForm({
                    ...brideForm,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                }
                maxLength={10}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Our Church Member
              </label>

              <select
                value={isBrideChurchMember}
                onChange={(e) => handleBrideChurchMemberChange(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Church Name
              </label>
              <input
                type="text"
                placeholder="Enter Church Name"
                value={brideChurchDetails.churchName}
                onChange={(e) =>
                  setBrideChurchDetails({
                    ...brideChurchDetails,
                    churchName: e.target.value
                  })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pastorate Name
              </label>
              <input
                type="text"
                placeholder="Enter Pastorate Name"
                value={brideChurchDetails.pastorateName}
                onChange={(e) =>
                  setBrideChurchDetails({
                    ...brideChurchDetails,
                    pastorateName: e.target.value
                  })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Diocese
              </label>
              <input
                type="text"
                placeholder="Enter Diocese"
                value={brideChurchDetails.diocese}
                onChange={(e) =>
                  setBrideChurchDetails({
                    ...brideChurchDetails,
                    diocese: e.target.value
                  })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bride Photo</label>
<input
  type="file"
  accept=".jpg, .jpeg, .png"
  onChange={(e) => setBridePhoto(e.target.files[0])}
  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
/>
            </div>
          </div>
        </div>
      )}

      {activeTab === "banns" && (
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Banns & Certificates</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bridegroom
              </label>
              <input
                type="text"
                value={groomName || ""}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Bride */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bride
              </label>
              <input
                type="text"
                value={brideName || ""}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Betrothal Date
              </label>
              <input
                type="date"
                value={betrothalDate}
                onChange={(e) => setBetrothalDate(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Place
              </label>
              <input
                type="text"
                value={betrothalPlace}
                onChange={(e) => setBetrothalPlace(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wedding Date <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wedding in our Church
              </label>
              <select
                value={weddingInOurChurch}
                onChange={(e) => setWeddingInOurChurch(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Banns / License
              </label>
              <input
                type="text"
                value={bannsLicense}
                onChange={(e) => setBannsLicense(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Banns 1 <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>
              <input
                type="date"
                value={banns1}
                onChange={(e) => setBanns1(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Banns 2
              </label>
              <input
                type="date"
                value={banns2}
                onChange={(e) => setBanns2(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Banns 3
              </label>
              <input
                type="date"
                value={banns3}
                onChange={(e) => setBanns3(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cert Before Banns Issued
              </label>
              <select
                value={certBeforeBannsIssued}
                onChange={(e) => handleCertBeforeBannsChange(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>

            </div>
            {certBeforeBannsIssued === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Issued On
                </label>
                <input
                  type="date"
                  value={certBeforeBannsIssuedDate}
                  onChange={(e) => setCertBeforeBannsIssuedDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cert Before Banns Received
              </label>
              <select
                value={certBeforeBannsReceived}
                onChange={(e) => {
                  const value = e.target.value;
                  setCertBeforeBannsReceived(value);

                  // clear date if No
                  if (value !== "Yes") {
                    setCertBeforeBannsReceivedDate("");
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>

            </div>
            {certBeforeBannsReceived === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Received On
                </label>
                <input
                  type="date"
                  value={certBeforeBannsReceivedDate}
                  onChange={(e) => setCertBeforeBannsReceivedDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cert After Banns Issued
              </label>
              <select
                value={certAfterBannsIssued}
                onChange={(e) => {
                  const value = e.target.value;
                  setCertAfterBannsIssued(value);

                  // clear date if No
                  if (value !== "Yes") {
                    setCertAfterBannsIssuedDate("");
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {certAfterBannsIssued === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Issued On
                </label>
                <input
                  type="date"
                  value={certAfterBannsIssuedDate}
                  onChange={(e) => setCertAfterBannsIssuedDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cert After Banns Received
              </label>
              <select
                value={certAfterBannsReceived}
                onChange={(e) => {
                  const value = e.target.value;
                  setCertAfterBannsReceived(value);

                  // clear date if No
                  if (value !== "Yes") {
                    setCertAfterBannsReceivedDate("");
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {certAfterBannsReceived === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Received On
                </label>
                <input
                  type="date"
                  value={certAfterBannsReceivedDate}
                  onChange={(e) => setCertAfterBannsReceivedDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marriage Cert Issued
              </label>
              <select
                value={marriageCertIssued}
                onChange={(e) => {
                  const value = e.target.value;
                  setMarriageCertIssued(value);

                  // clear date if No
                  if (value !== "Yes") {
                    setMarriageCertIssuedDate("");
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {marriageCertIssued === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Issued On
                </label>
                <input
                  type="date"
                  value={marriageCertIssuedDate}
                  onChange={(e) => setMarriageCertIssuedDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "pastor" && (
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Marriage Solmenized By</h1>
          {pastors.map((row, i) => (
            <div key={i} className="flex items-end gap-4 mt-3">
              <div className="flex gap-4 flex-grow">
<div className="flex-1">
  <label className="block text-sm font-medium text-gray-700">
    Presbyter's Name <span className='text-red-500 font-bold text-[17px]'>*</span>
  </label>

  <select
    value={row.name}
    // onChange={(e) => updatePastor(i, "name", e.target.value)}
onChange={(e) => {
  const selected = pastorList.find(p => 
    `${p.title ? p.title + " " : ""}${p.pastor_name}` === e.target.value
  );

  updatePastor(i, "name", e.target.value);
  updatePastor(i, "pastor_role", selected?.pastor_role || "");
}}
    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
  >
    <option value="">Select Presbyter</option>

    {pastorList.map((p) => (
      <option
        key={p._id}
        value={`${p.title ? p.title + " " : ""}${p.pastor_name}`}
      >
        {p.pastor_name}
      </option>
    ))}
  </select>
</div>


                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Qualification <span className='text-red-500 font-bold text-[17px]'>*</span>
                  </label>
                  <input
                    type='text'
                    placeholder='Enter Qualification'
                    value={row.qualification}
                    onChange={(e) => updatePastor(i, "qualification", e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Responsibility In Church <span className='text-red-500 font-bold text-[17px]'>*</span>
                  </label>
                  <input
                    type='text'
                    placeholder='Enter Responsibility'
                    value={row.responsibility}
                    onChange={(e) => updatePastor(i, "responsibility", e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              </div>

              {/* Buttons */}
              {i === pastors.length - 1 ? (
                <button
                  onClick={addPastorRow}
                  disabled={!canAddRow(row)}
                  className={`px-2 py-2 rounded-md whitespace-nowrap text-white ${canAddRow(row)
                    ? "bg-lavender--600"
                    : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                  <FaPlus className='text-white' size={20} />
                </button>
              ) : (
                <button
                  onClick={() => removePastorRow(i)}
                  className="px-2 py-2 bg-red-500 text-white rounded-md whitespace-nowrap"
                >
                  <MdDelete className='text-white' size={20} />
                </button>
              )}
            </div>
          ))}
          <div className="mt-4">

            {witnesses.map((witness, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 items-end"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Witness {i + 1}
                  </label>
                  <input
                    type="text"
                    value={witness.name}
                    placeholder='Enter Witness Name'
                    onChange={(e) => updateWitness(i, "name", e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={witness.fatherName}
                    placeholder='Enter Witness Father Name'
                    onChange={(e) => updateWitness(i, "fatherName", e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={witness.address}
                    placeholder='Enter Witness Address'
                    onChange={(e) => updateWitness(i, "address", e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={witness.phone}
                    placeholder='Enter Witness Address'
                    onChange={(e) => updateWitness(i, "phone", e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {/* Buttons */}
                <div className="sm:col-span-2 flex justify-end gap-2">
                  {i === witnesses.length - 1 && (
                    <button
                      onClick={addWitness}
                      disabled={!canAddWitness(witness)}
                      className={`px-4 py-2 rounded-md text-white ${canAddWitness(witness)
                        ? "bg-lavender--600"
                        : "bg-gray-300 cursor-not-allowed"
                        }`}
                    >
                      Add Witness
                    </button>
                  )}

                  {i !== 0 && (
                    <button
                      onClick={() => removeWitness(i)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      <div className="mt-4 grid grid-cols-2 items-center">
        <div className="justify-self-start">
          {activeTab !== "groom" && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-lavender--600 text-white rounded"
            >
              Previous
            </button>
          )}
        </div>

        <div className="justify-self-end">
          {activeTab !== "pastor" && (
            <button
              onClick={handleSaveAndNext}
              disabled={!canProceed()}
              className={`px-4 py-2 rounded text-white ${canProceed()
                ? "bg-lavender--600"
                : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              Save & Add Next
            </button>
          )}
          {activeTab === "pastor" && (
            <button
              onClick={handleSaveMarriage}
              disabled={!canProceed() || saving}
              className={`px-4 py-2 rounded text-white flex items-center gap-2
              ${saving || !canProceed()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-lavender--600"
                }`}
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {saving ? "Saving..." : "Save Marriage"}
            </button>
          )}
        </div>
      </div>


      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

    </>
  )
}








