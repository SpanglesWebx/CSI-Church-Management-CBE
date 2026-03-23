import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import './pagination.css'; // Ensure this path is correct

import down from './icon/downloade.svg';
import print from './icon/print.svg';

const tableHeading = [
  'Sl. no.',
  'Family ID',
  'Husband Name',
  'Wife Name',
  'Marriage Date',
  'Day',
];

const Reminders = () => {
  const [Data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(0); // Zero-based index for pagination
  const [itemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [dayFilter, setDayFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const componentRef = useRef();



//   const Data = [
//     {  familyId: 'BIL202401', husband: 'David', wife: 'Reenu', marriageDate: '11/11/2000', day: 'Monday' },
//     { familyId: 'BIL202402', husband: 'Joseph', wife: 'Rani', marriageDate: '11/11/2012', day: 'Monday' },
// ];
  const fetchData = async () => {
    try {
      const response = await axios.get(`${URL}/reports/marriage`, {
        params: {
          day: dayFilter !== 'All' ? dayFilter : undefined,
          fromdate: dateRange.from || undefined,
          todate: dateRange.to || undefined,
          search: searchTerm || undefined,
          page: currentPage + 1, // API expects 1-based index
          limit: itemsPerPage,
        },
      });
      console.log(response.data.Marriage);
      
      setData(response.data.Marriage);
      setFilteredData(response.data.Marriage);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dayFilter, dateRange, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, dateRange]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const headers = [tableHeading];
    const rows = filteredData.map((item, index) => [
      index + 1,
      item.family_id,
      item.husband_name,
      item.wife_name,
      moment(item.marriage_date).format('YYYY-MM-DD'),
      moment(item.marriage_date).format('dddd'), // Day of the week
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
    });

    doc.save('MarriageReports.pdf');
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredData.slice(offset, offset + itemsPerPage);

  return (
    <div className="relative h-full ml-5 bg-gray-100">
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
          <div className="col-span-2">
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
                  <th key={heading} className="px-4 py-2 text-left border-b text-base text-gray-700 bg-white">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{offset + index + 1}</td>
                  <td className="px-4 py-2">{item.family_id}</td>
                  <td className="px-4 py-2">{item.husband_name}</td>
                  <td className="px-4 py-2">{item.wife_name}</td>
                  <td className="px-4 py-2">{moment(item.marriage_date).format('DD-MM-YYYY')}</td>
                  <td className="px-4 py-2">{moment(item.marriage_date).format('dddd')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
        <div className="flex items-center justify-center">
          <ReactPaginate
            previousLabel={<img className="transform scale-x-[-1]" width="25" height="25" src="https://img.icons8.com/fluency/48/000000/circled-chevron-right.png" alt="Previous" />}
            nextLabel={<img width="25" height="25" src="https://img.icons8.com/fluency/48/circled-chevron-right.png" alt="Next" />}
            breakLabel={'...'}
            pageCount={Math.ceil(filteredData.length / itemsPerPage)}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            activeClassName={'active'}
            forcePage={currentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Reminders;


