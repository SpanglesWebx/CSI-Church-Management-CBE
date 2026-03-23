import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { FaPlus } from "react-icons/fa";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FaPrint } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import AsanamDonationPrintModal from "./AsanamDonationPrintModal";

export const AsanamDonation = () => {

  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");

const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [tamilName, setTamilName] = useState("");

  const [place, setPlace] = useState("");
  const [placeTamil, setPlaceTamil] = useState("");

  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [unitTamil, setUnitTamil] = useState("");

const [isPrintModalOpen,setIsPrintModalOpen]=useState(false);

  const token = sessionStorage.getItem("token");


  //////////////////////////////////////////////////
  // TAMIL TRANSLITERATION
  //////////////////////////////////////////////////

  const transliterateTamil = async (text, setter) => {

    try {

      if (!text.trim()) {

        setter("");

        return;

      }

      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`
      );

      if (res.data[0] === "SUCCESS") {

        setter(res.data[1][0][1][0]);

      }

    }
    catch (err) {

      console.log(err);

    }

  };


  //////////////////////////////////////////////////
  // LOAD DATA
  //////////////////////////////////////////////////

  const fetchDonations = async () => {

    try {

      const res = await axios.get(
        `${URL}/asanam-donations`,
        {
          params: {
            search,
            sort: sortType,
            startDate,
            endDate
          },
          headers: {
            Authorization: token
          }
        }
      );

      setDonations(res.data || []);

    }
    catch (err) {

      console.log(err);

    }

  };


  //////////////////////////////////////////////////
  // SAVE DONATION
  //////////////////////////////////////////////////

  const saveDonation = async () => {

    try {

      await axios.post(

        `${URL}/asanam-donations/add`,

        {
          name,
          tamil_name: tamilName,
          place,
          place_tamil: placeTamil,
          item,
          quantity,
          unit,
          unit_tamil: unitTamil
        },

        {
          headers: {
            Authorization: token
          }
        }

      );


      setIsModalOpen(false);

      fetchDonations();

    }
    catch (err) {

      console.log(err);

    }

  };



const downloadDonationPDF = async()=>{

try{

const res = await axios.get(

`${URL}/asanam-donations/pdf/download`,

{
params:{
search,
sort:sortType,
startDate,
endDate
},

headers:{
Authorization:token
},

responseType:"blob"

}

);

const url = window.URL.createObjectURL(
new Blob([res.data])
);

const link=document.createElement("a");

link.href=url;

link.setAttribute(
"download",
"Asanam-Donation.pdf"
);

document.body.appendChild(link);

link.click();

link.remove();

}
catch(err){

console.log(err);

}

};
  //////////////////////////////////////////////////
  // AUTO TAMIL CONVERSION
  //////////////////////////////////////////////////

  useEffect(() => {

    transliterateTamil(name, setTamilName);

  }, [name]);


  useEffect(() => {

    transliterateTamil(place, setPlaceTamil);

  }, [place]);


useEffect(() => {

fetchDonations();

}, [search, sortType,startDate,endDate]);


  return (

    <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">




{/* HEADER */}
<div className="flex justify-between items-center mb-3">

{/* LEFT TITLE */}
<h1 className="text-lg font-semibold">
Asanam Donation
</h1>


{/* RIGHT ICONS */}
<div className="flex items-center gap-3">

<FiDownload
size={20}
className="text-lavender--600 cursor-pointer"
title="Download"
onClick={downloadDonationPDF}
/>


<FaPrint
size={20}
className="text-lavender--600 cursor-pointer"
title="Print"
onClick={()=>setIsPrintModalOpen(true)}
/>

</div>

</div>





      {/* TOP BAR */}
<div className="flex items-center justify-between p-2">

{/* SEARCH */}
<div className="relative">

{/* SEARCH */}
<div className="relative">

<div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">

<svg
className="w-3 h-3 text-gray-500"
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 20 20"
>

<path
stroke="currentColor"
strokeWidth="2"
d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
/>

</svg>

</div>

<input
type="search"
placeholder="Search Name / Place / Item"
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="block py-1 text-sm text-gray-900 rounded w-56 ps-8 bg-gray-50"
/>

</div>

</div>



{/* DATE FILTER */}

<div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

<label className="text-l font-medium text-gray-600 mb-1">
From
</label>

<input
type="date"
value={startDate}
onChange={(e)=>setStartDate(e.target.value)}
className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
/>

<label className="text-l font-medium text-gray-600 mb-1">
To
</label>

<input
type="date"
value={endDate}
onChange={(e)=>setEndDate(e.target.value)}
className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
/>

</div>



{/* RIGHT SIDE */}

<div className="flex items-center gap-4">

<select
value={sortType}
onChange={(e)=>setSortType(e.target.value)}
className="border px-3 py-1 rounded text-sm"
>

<option value="">
Default Filter
</option>

<option value="name">
Name (A-Z)
</option>

<option value="place">
Place
</option>

<option value="item">
Item
</option>

</select>



<button
onClick={()=>setIsModalOpen(true)}
className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
>

<FaPlus/>

Donation

</button>

</div>

</div>



      {/* TABLE */}
      {donations.length > 0 && (

        <div className="overflow-x-auto">

          <table className="w-full text-sm text-gray-500">

            <thead className="text-base text-gray-700 border-b">

              <tr>

                <th className="p-2 text-center">
                  SI NO
                </th>

                <th className="p-2 text-left">
                  Name
                </th>

                <th className="p-2 text-left">
                  Place
                </th>

                <th className="p-2 text-left">
                  Item
                </th>

                <th className="p-2 text-center">
                  Quantity
                </th>

              </tr>

            </thead>


            <tbody>

              {donations.map((d, index) => (

                <tr key={d._id} className="border-b">

                  <td className="p-2 text-center">
                    {index + 1}
                  </td>

                  <td className="p-2">
                    {d.name}
                  </td>

                  <td className="p-2">
                    {d.place}
                  </td>

                  <td className="p-2">
                    {d.item}
                  </td>

                  <td className="p-2 text-center">
                    {d.quantity} {d.unit}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}



      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Donation"
      >

        <div className="grid grid-cols-2 gap-3">

          <div>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>


          <div>
            <label>Tamil Name</label>
            <input
              value={tamilName}
              onChange={(e) => setTamilName(e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>


          <div>
            <label>Place</label>
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>


          <div>
            <label>Place Tamil</label>
            <input
              value={placeTamil}
              onChange={(e) => setPlaceTamil(e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>

        </div>


        <div className="grid grid-cols-3 gap-3 mt-3">

          <div>
            <label>Item</label>
            <input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>


          <div>
            <label>Quantity</label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>


<div>
  <label className="block text-sm font-medium text-gray-700">
    Unit
  </label>

<select
value={unit}
onChange={(e)=>{

const value=e.target.value;

setUnit(value);

const tamilMap={

Piece:"காய்",

Kg:"கிலோ",

Bundle:"சிப்பம்",

Bag:"பை",

Sack:"மூடை",

Tin:"டின்",

Bunch:"தார்",

Can:"கேன்",

Liter:"லிட்டர்",

Packet:"பாக்கெட்"

};

setUnitTamil(tamilMap[value] || "");

}}
className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
>

<option value="">Select Unit</option>

<option value="Piece">Piece (காய்)</option>

<option value="Kg">Kg (கிலோ)</option>

<option value="Bundle">Bundle (சிப்பம்)</option>

<option value="Bag">Bag (பை)</option>

<option value="Sack">Sack (மூடை)</option>

<option value="Tin">Tin (டின்)</option>

<option value="Bunch">Bunch (தார்)</option>

<option value="Can">Can (கேன்)</option>

<option value="Liter">Liter (லிட்டர்)</option>

<option value="Packet">Packet (பாக்கெட்)</option>

</select>

</div>

        </div>


        <div className="flex justify-end mt-4">

          <button
            onClick={saveDonation}
            className="bg-lavender--600 text-white px-4 py-1 rounded"
          >
            Save
          </button>

        </div>

      </Modal>


<AsanamDonationPrintModal
isOpen={isPrintModalOpen}
onClose={()=>setIsPrintModalOpen(false)}
search={search}
sortType={sortType}
startDate={startDate}
endDate={endDate}
/>

    </div>

  );

};