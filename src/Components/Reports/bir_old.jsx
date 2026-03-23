import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import './pagination.css'; // Ensure this path is correct
const URL = import.meta.env.VITE_BACKEND_API_URL;

import down from './icon/downloade.svg'
import print from './icon/print.svg'

const tableHeading = [
  'Sl. no.',
  'Member ID',
  'Member Name',
  'Member Tamil Name',
  'DOB',
  'Family ID',
  'Status',
];

const ReportPage = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Zero-based index for pagination
  const [itemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const componentRef = useRef();

  const fetchData = async () => {

    
    try {
      const response = await axios.get(`${URL}/reports/birthday`, {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          fromdate: dateRange.from || undefined,
          todate: dateRange.to || undefined,
          search: searchTerm || undefined,
          page: currentPage + 1, // API expects 1-based index
          limit: itemsPerPage,
        },
      });
      console.log(response);
      
      setData(response.data.Birthday);
      setFilteredData(response.data.Birthday);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchData();
    } else {
      fetchData(); // This will be called if the condition is not met
    }
  }, [statusFilter, dateRange, searchTerm, currentPage]);
  

  useEffect(() => {
    // Reset to page 1 (index 0) when search term changes
    setCurrentPage(0);
  }, [searchTerm]);

  useEffect(() => {
    // Reset to page 1 (index 0) when search term changes
    setCurrentPage(0);
    // console.log("render");
  }, [dateRange]);


  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const headers = [
      tableHeading,
    ];
    const rows = filteredData.map((item, index) => [
      index + 1,
      item.member_id,
      item.member_name,
      item.member_tamil_name,
      moment(item.date_of_birth).format('YYYY-MM-DD'),
      item.secondary_family_id || item.primary_family_id,
      item.status,
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
    });

    doc.save('BirthdayReports.pdf');
  };

  // Calculate the offset based on the current page
  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredData.slice(offset, offset + itemsPerPage);

  return (
    <div className="relative h-auto ml-5 w-[100%] bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-lavender--600">BirthdayReports</h2>
          <div className="flex gap-x-5">
            <button
              onClick={handleDownloadPDF}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
             <img src={down}/>
            </button>
            {/* <button onClick={handlePrint} className="text-blue-600 cursor-pointer hover:text-blue-800">
             <img src={print}/>
            </button> */}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div>
            <label className="block mb-1 text-gray-600">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
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
                {tableHeading.map(heading => (
                  <th key={heading} className="px-4 py-2 text-left border-b text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item, index) => (
                <tr key={index} className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <td className="px-4 py-2 text-sm">{offset + index + 1}</td>
                  <td className="px-4 py-2 text-sm">{item.member_id}</td>
                  <td className="px-4 py-2 text-sm">{item.member_name}</td>
                  <td className="px-4 py-2 text-sm">{item.member_tamil_name}</td>
                  <td className="px-4 py-2 text-sm">{moment(item.date_of_birth).format('DD-MM-YYYY')}</td>
                  <td className="px-4 py-2 text-sm">{item.secondary_family_id || item.primary_family_id}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`text-${item.status === 'Active' ? 'green' : 'red'}-500`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
        <div className="flex items-center justify-center select-none">
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={'...'}
            pageCount={Math.ceil(filteredData.length / itemsPerPage)}
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
      </div>
    </div>
  );
};

export default ReportPage;
