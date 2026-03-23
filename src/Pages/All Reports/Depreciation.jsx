import React, { useEffect, useState } from "react";
import axios from "axios";
import { Download } from "lucide-react";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";

export const Depreciation = () => {
  const token = window.sessionStorage.getItem("token");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [depreciationData, setDepreciationData] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch table data (similar pattern to TrialBalance)
const fetchDepreciation = async () => {
  if (!fromDate || !toDate) return;

  setLoading(true);

  try {
    const res = await axios.get(
      `${URL}/depreciation?from=${fromDate}&to=${toDate}`,
      { headers: { Authorization: token } }
    );

    if (res.data.status === "Success") {
      setDepreciationData(res.data.data);
    }

  } catch (error) {
    console.log(error);
    setResponse({ status: "Failed", message: "Failed to fetch depreciation" });
  }

  setLoading(false);
};

  const downloadDepreciation = async () => {
    try {
      const res = await axios.get(
        `${URL}/depreciation/pdf?from=${fromDate}&to=${toDate}`,
        {
          headers: { Authorization: token },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `Depreciation-${fromDate}-to-${toDate}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);

      setResponse({ status: "Success", message: "PDF Downloaded" });

    } catch (err) {
      console.error(err);
      setResponse({ status: "Failed", message: "Download failed" });
    }
  };



  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h4 className="font-semibold">Depreciation Report</h4>

        <div className="flex flex-wrap items-center p-4 gap-3">
          <label className="text-l font-medium text-gray-600">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="block py-1 text-sm text-gray-900 rounded px-3 bg-gray-50 border"
          />

          <label className="text-l font-medium text-gray-600">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="block py-1 text-sm text-gray-900 rounded px-3 bg-gray-50 border"
          />

<button
  onClick={fetchDepreciation}
  disabled={loading || !fromDate || !toDate}
  className={`px-3 py-2 text-white rounded text-sm flex items-center gap-2
  ${loading
      ? "bg-lavender--600/60 cursor-not-allowed"
      : "bg-lavender--600 hover:bg-lavender--700"
    }`}
>

  {loading ? (
    <>
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      Loading...
    </>
  ) : (
    "Search"
  )}

</button>

          {fromDate && toDate && (
            <button
              onClick={downloadDepreciation}
              className="ml-auto px-3 py-2 bg-lavender--600 text-white rounded text-sm flex items-center gap-2"
            >
              <Download size={16} /> Download
            </button>
          )}
        </div>

        {/* ======= TABLE (SAME STYLE AS TRIAL BALANCE) ======= */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                {/* <th className="p-2 text-center">SI No</th> */}
                <th className="p-2 text-center">PARTICULARS</th>
                <th className="p-2 text-center">W.D.V AS ON</th>
                <th className="p-2 text-center">ADDITIONS</th>
                <th className="p-2 text-center">DELETIONS</th>
                <th className="p-2 text-center">GROSS BLOCK</th>
                <th className="p-2 text-center">DEPR. RATE</th>
                <th className="p-2 text-center">DEPR. AMOUNT</th>
                <th className="p-2 text-center">W.D.V AS ON</th>
              </tr>
            </thead>

<tbody>
  {depreciationData.length === 0 ? (
    <tr>
      <td colSpan="9" className="text-center p-2">
        No Records Found
      </td>
    </tr>
  ) : (
    depreciationData.map((row, index) => {

      if (row.type === "category") {
        return (
          <tr key={index}>
            <td colSpan="9" className="p-2 font-bold text-left bg-gray-100">
              {row.particulars}
            </td>
          </tr>
        );
      }

      if (row.type === "total") {
        return (
          <tr key={index} className="font-bold bg-gray-50">
            {/* <td></td> */}
            <td className="text-left">{row.particulars}</td>
            <td className="text-right">{row.wdvOpening}</td>
            <td className="text-right">{row.additions}</td>
            <td className="text-right">{row.deletions}</td>
            <td className="text-right">{row.grossBlock}</td>
            <td></td>
            <td className="text-right">{row.deprAmount}</td>
            <td className="text-right">{row.wdvClosing}</td>
          </tr>
        );
      }

if (row.type === "grandTotal") {
  return (
    <tr
      key={index}
      className="font-bold border-t-2 border-b-2 border-black"
    >
      <td className="text-left py-2">{row.particulars}</td>
      <td className="text-right">{row.wdvOpening}</td>
      <td className="text-right">{row.additions}</td>
      <td className="text-right">{row.deletions}</td>
      <td className="text-right">{row.grossBlock}</td>
      <td></td>
      <td className="text-right">{row.deprAmount}</td>
      <td className="text-right">{row.wdvClosing}</td>
    </tr>
  );
}

if (row.type === "addition") {
  return (
    <tr key={index}>
      <td className="p-2 text-left pl-8 text-gray-600">
        {row.particulars}
      </td>
      <td></td>
      <td className="text-right">{row.additions}</td>
      <td></td>
      <td className="text-right">{row.grossBlock}</td>
      <td className="text-right">{row.deprRate}</td>
      <td className="text-right">{row.deprAmount}</td>
      <td className="text-right">{row.wdvClosing}</td>
    </tr>
  );
}

if (row.type === "calculation") {
  return (
    <tr key={index} className="font-semibold">
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td className="text-right">{row.grossBlock}</td>
      <td className="text-right">{row.deprRate}</td>
      <td className="text-right">{row.deprAmount}</td>
      <td className="text-right">{row.wdvClosing}</td>
    </tr>
  );
}

      if (row.type === "gap") {
        return (
          <tr key={index}>
            <td colSpan="9" className="p-2"></td>
          </tr>
        );
      }

      return (
        <tr key={index} className="border-b">
          {/* <td className="p-2 text-center font-semibold">{index + 1}</td> */}
          <td className="p-2 text-left">{row.particulars}</td>
          <td className="p-2 text-right">{row.wdvOpening}</td>
          <td className="p-2 text-right"></td>
          <td className="p-2 text-right"></td>
          <td className="p-2 text-right">{row.grossBlock}</td>
          <td className="p-2 text-right">{row.deprRate}</td>
          <td className="p-2 text-right">{row.deprAmount}</td>
          <td className="p-2 text-right">{row.wdvClosing}</td>
        </tr>
      );
    })
  )}
</tbody>
          </table>
        </div>
      </div>

      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </>
  );
};
