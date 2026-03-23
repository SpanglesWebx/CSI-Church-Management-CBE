import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import './pagination.css'; // Ensure this path is correct

const URL = import.meta.env.VITE_BACKEND_API_URL;

import down from './icon/downloade.svg';
import print from './icon/print.svg';

const marriageTableHeading = [
  'Sl. no.',
  'Family ID',
  'Husband Name',
  'Wife Name',
  'Marriage Date',
  'Day',
];

const birthdayTableHeading = [
  'Sl. no.',
  'Member ID',
  'Member Name',
  'DOB',
  'Day',
  'Family ID',
];

const Reminders = () => {
  const token = window.sessionStorage.getItem("token");

  const [activeTab, setActiveTab] = useState('birthday'); // Track active tab
  const [currentPage, setCurrentPage] = useState(0); // Zero-based index for pagination
  const [itemsPerPage] = useState(15); // Updated for 15 items per page
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [dayFilter, setDayFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const componentRef = useRef();

  // Fetch marriage data from API (static for now)
  const fetchMarriageData = async () => {
    try {
      const params = {
        fromDate: dateRange.from, // Start date filter
        toDate: dateRange.to,     // End date filter
        day: dayFilter !== 'All' ? dayFilter : undefined, // Optional day filter
        searchTerm: searchTerm || undefined, // Optional search term
        page: currentPage + 1,   // Current page (zero-based index on frontend, 1-based on backend)
        limit: itemsPerPage      // Items per page
      };

      const response = await axios.get(`${URL}/reports/marriage_reminders`, {
        headers: {
          Authorization: token,
        },
        params
      });
      console.log(response.data);
      
      // // Set filtered data and manage pagination info
      setFilteredData(response.data.MarriageData);
      // setTotalPages(response.data.totalPages); // Backend returns total count of items
    } catch (error) {
      console.error('Error fetching marriage data', error);
    }
  };

  // Fetch birthday data from API with search params and pagination
  const fetchBirthdayData = async () => {
    try {
      const params = {
        fromDate: dateRange.from, // Start date filter
        toDate: dateRange.to,     // End date filter
        day: dayFilter !== 'All' ? dayFilter : undefined, // Optional day filter
        searchTerm: searchTerm || undefined, // Optional search term
        page: currentPage + 1,   // Current page (zero-based index on frontend, 1-based on backend)
        limit: itemsPerPage      // Items per page
      };

      const response = await axios.get(`${URL}/reports/birthday_reminders`, {
        headers: {
          Authorization: token,
        },
        params
      });
      
      // Set filtered data and manage pagination info
      setFilteredData(response.data.MarriageData);
      setTotalPages(response.data.totalPages); // Backend returns total count of items
    } catch (error) {
      console.error('Error fetching birthday data', error);
    }
  };
// Fetch birthday data from API with search params and pagination
// const fetchBirthdayData = async () => {
//   try {
//     const params = {
//       fromDate: dateRange.from, // Start date filter
//       toDate: dateRange.to,     // End date filter
//       searchTerm: searchTerm || {}, // Optional search term
//       page: currentPage + 1,   // Current page (zero-based index on frontend, 1-based on backend)
//       limit: itemsPerPage      // Items per page
//     };

//     const response = await axios.get(`${URL}/reports/birthday_reminders`, {
//       headers: {
//         Authorization: token,
//       },
//       params
//     });
    
//     // Filter the data locally based on the dayFilter
//     let fetchedData = response.data.BirthDayReminder;
    
//     // Apply local filtering based on the day filter
//     if (dayFilter !== 'All') {
//       fetchedData = fetchedData.filter(item =>
//         moment(item.date_of_birth).format('dddd') === dayFilter
//       );
//     }
    
//     // Set filtered data and manage pagination info
//     setFilteredData(fetchedData);
//     setTotalPages(response.data.totalPages); // Backend returns total count of items
//   } catch (error) {
//     console.error('Error fetching birthday data', error);
//   }
// };

  useEffect(() => {
    if (activeTab === 'birthday') {
    
      fetchBirthdayData();
    } else {
    
      fetchMarriageData();
    }
  }, [currentPage, dateRange, dayFilter, searchTerm]);

  useEffect(() => {
    if (activeTab === 'birthday') {
      console.log("birthday");
      
      
      setCurrentPage(0)
      setFilteredData([])
      setTotalPages(0)
      setDateRange({ from: '', to: '' })
      // setDateRange({ from: '0,0', to: '0,0' })

      setDayFilter('All')
      setSearchTerm("")
      fetchBirthdayData();
    } else {
      console.log("fetchMarriageData");
      
      setCurrentPage(0)
      setFilteredData([])
      setTotalPages(0)
      setDateRange({ from: '', to: '' })
      setDayFilter('All')
      setSearchTerm("")
      fetchMarriageData();
    }
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(0); // Reset to page 0 on filters change
  }, [searchTerm, dateRange, dayFilter]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected); // ReactPaginate returns zero-based page index
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const headers = [activeTab === 'birthday' ? birthdayTableHeading : marriageTableHeading];
    const rows = filteredData.map((item, index) => activeTab === 'birthday' ? [
      index + 1,
      item.member_id,
      item.member_name,
      moment(item.date_of_birth).format('YYYY-MM-DD'),
      moment(item.date_of_birth).format('dddd'), // Day of the week
      item.family_id,
    ] : [
      index + 1,
      item.familyId,
      item.husband,
      item.wife,
      moment(item.marriageDate).format('YYYY-MM-DD'),
      moment(item.marriageDate).format('dddd'), // Day of the week
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
    });

    doc.save(`${activeTab === 'birthday' ? 'BirthdayDateReports' : 'MarriageDateReports'}.pdf`);
  };

  return (
    <div className="relative h-full ml-5 w-[100%] bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-purple-500">Reports</h2>
          <div className="flex gap-x-5">
            <button onClick={handleDownloadPDF} className="text-blue-600 cursor-pointer hover:text-blue-800">
              <img src={down} alt="Download" />
            </button>
            <button onClick={handlePrint} className="text-blue-600 cursor-pointer hover:text-blue-800">
              <img src={print} alt="Print" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <button
            className={`px-4 py-2 ${activeTab === 'birthday' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('birthday')}
          >
            Birthday Reminder (Next Week)
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'marriage' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('marriage')}
          >
            Marriage Reminder (Next Week)
          </button>
        </div>
        <br />
        <div className="grid grid-cols-5 gap-2 mb-4">
          <div>
            <label className="block mb-1 text-gray-600">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Day</label>
            <select
              value={dayFilter}
              onChange={e => setDayFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div className="col-span-2 w-[50%] ">
            <label className="block mb-1 text-gray-600">Search</label>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div ref={componentRef}>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {(activeTab === 'birthday' ? birthdayTableHeading : marriageTableHeading).map(heading => (
                  <th key={heading} className="px-4 py-2 text-base text-left text-gray-700 bg-white border-b">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  {activeTab === 'birthday' ? (
                    <>
                      <td className="px-4 py-2 text-gray-600 border-b">{index + 1}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{item.member_id}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{item.member_name}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{moment(item.date_of_birth).format('YYYY-MM-DD')}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{moment(item.date_of_birth).format('dddd')}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{item.family_id}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 text-gray-600 border-b">{index + 1}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{item.FamilyID}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{item.HusbandName}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{item.WifeName}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{moment(item.MarriageDate).format('YYYY-MM-DD')}</td>
                      <td className="px-4 py-2 text-gray-600 border-b">{moment(item.MarriageDate).format('dddd')}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center m-2 select-none">
          <ReactPaginate
            previousLabel={<img className="transform scale-x-[-1]" width="25" height="25" src="https://img.icons8.com/fluency/48/000000/circled-chevron-right.png" alt="circled-chevron-right" />}
            nextLabel={<img width="25" height="25" src="https://img.icons8.com/fluency/48/circled-chevron-right.png" alt="circled-chevron-right" />}
            breakLabel={'...'}
            pageCount={totalPages}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            activeClassName={'active'} // Ensure this matches the CSS class
            forcePage={currentPage} // Ensure the pagination component reflects the current page
          />
      </div>
      
        )}
      </div>
          {/* <ReactPaginate
            previousLabel={<img className="transform scale-x-[-1]" width="25" height="25" src="https://img.icons8.com/fluency/48/000000/circled-chevron-right.png" alt="circled-chevron-right" />}
            nextLabel={<img width="25" height="25" src="https://img.icons8.com/fluency/48/circled-chevron-right.png" alt="circled-chevron-right" />}
            breakLabel={'...'}
            pageCount={totalPages}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            activeClassName={'active'}
            forcePage={currentPage} // Ensure the pagination component reflects the current page
          /> */}
    </div>
  );
};

export default Reminders;
