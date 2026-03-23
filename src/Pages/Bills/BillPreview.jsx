import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { URL } from "../../App";
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import './BillPreview.css'



const BillPreview = () => {
  const [startDate, setStartDate] = useState(() =>
    moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(() =>
    moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD")
  );
  const token = window.sessionStorage.getItem("token");
  const { familyId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const familyHead = members.find(m => m.relation?.toLowerCase() === "head");
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyAndOfferings = async () => {
      try {
        // // ✅ 1. Fetch the new full family endpoint
        // const familyRes = await axios.get(`${URL}/family/${familyId}/full`, {
        //   headers: { Authorization: token },
        // });

        // const { head, members } = familyRes.data;

        // // ✅ 2. Combine head and members (head first)
        // const allMembers = [head, ...(members || [])];
        // setMembers(allMembers);
        const familyRes = await axios.get(`${URL}/family/tree/list/${familyId}`, {
          headers: { Authorization: token },
        });

        const { FamilyDetails } = familyRes.data;
        setMembers(FamilyDetails);


        // ✅ 3. Create member ID list including head
        const memberIds = FamilyDetails.map(m => m.member_id);

        // ✅ 4. Fetch offerings for all these members
        const offeringsRes = await axios.post(
          `${URL}/offerings/by-members`,
          { memberIds },
          { headers: { Authorization: token } }
        );

        setOfferings(offeringsRes.data);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyAndOfferings();
  }, [familyId]);




  const groupOfferingsByCategory = (memberId) => {
    const memberOfferings = offerings.filter(o => o.member_id === memberId);
    const grouped = {};

    memberOfferings.forEach(offering => {
      const category = offering.category || "Uncategorized";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(offering);
    });

    return grouped;
  };

  const renderOfferings = (member) => {
    const grouped = groupOfferingsByCategory(member.member_id);
    return Object.entries(grouped).map(([category, list]) => (
      <div key={category} className="mb-3">
        <h3 className="text-sm font-semibold underline text-blue-800">{category}</h3>
        <ul className="pl-4 text-sm list-disc">
          {list.map((o, i) => (
            <li key={i}>
              {moment(o.date).format("DD-MM-YYYY")} - ₹{o.amount} - {o.description}
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  //   const handleDownloadExcel = async () => {
  //   try {
  //     const familyHead = members.find(m => m.relation === "Head");

  //     const workbook = new ExcelJS.Workbook();
  //     const worksheet = workbook.addWorksheet("Offerings", {
  //       pageSetup: {
  //         paperSize: 11, // A5
  //         orientation: "portrait",
  //         fitToPage: true,
  //         fitToWidth: 1,
  //         margins: {
  //           left: 0.3,
  //           right: 0.3,
  //           top: 0.5,
  //           bottom: 0.5,
  //           header: 0.3,
  //           footer: 0.3,
  //         },
  //       },
  //     });

  //     // Church Name
  //     worksheet.mergeCells("A2:D2");
  //     const churchCell = worksheet.getCell("A2");
  //     churchCell.value = "CSI CHURCH VYRAKUDI";
  //     churchCell.font = { bold: true, size: 16, color: { argb: "FF8378FF" } };
  //     churchCell.alignment = { horizontal: "center" };

  //     // Title
  //     worksheet.mergeCells("A1:D1");
  //     const titleCell = worksheet.getCell("A1");
  //     titleCell.value = `Family Offerings Bill (${familyId || "Unknown"})`;
  //     titleCell.alignment = { horizontal: "center" };
  //     titleCell.font = { bold: true, size: 14 };

  //     let currentRow = 4;

  //     members
  //       .filter(m => offerings.some(o => o.member_id === m.member_id))
  //       .forEach((member) => {
  //         const memberOfferings = offerings
  //           .filter(o => o.member_id === member.member_id)
  //           .sort((a, b) => new Date(b.date) - new Date(a.date));

  //         if (memberOfferings.length === 0) return;

  //         // Member Name
  //         worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  //         worksheet.getCell(`A${currentRow}`).value =
  //           `Member Name: ${member.member_name} (${member.member_tamil_name})`;
  //         worksheet.getCell(`A${currentRow}`).font = { bold: true };
  //         currentRow++;

  //         // Member ID
  //         worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  //         worksheet.getCell(`A${currentRow}`).value =
  //           `Member ID: ${member.member_id}`;
  //         worksheet.getCell(`A${currentRow}`).font = { bold: true };
  //         currentRow++;

  //         // Table Header
  //         worksheet.getRow(currentRow).values = [
  //           "Sl. No",
  //           "Offering Category",
  //           "Date of Payment",
  //           "Amount (₹)"
  //         ];
  //         const headerRow = worksheet.getRow(currentRow);
  //         headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  //         headerRow.fill = {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FF8378FF" },
  //         };
  //         headerRow.alignment = { horizontal: "center" };
  //         headerRow.border = {
  //           top: { style: "thin" },
  //           bottom: { style: "thin" },
  //           left: { style: "thin" },
  //           right: { style: "thin" },
  //         };
  //         currentRow++;

  //         let memberTotal = 0;

  //         // Offerings Rows
  //         memberOfferings.forEach((offering, index) => {
  //           worksheet.getRow(currentRow).values = [
  //             index + 1,
  //             offering.category || "Uncategorized",
  //             moment(offering.date).format("DD-MM-YYYY"),
  //             offering.amount
  //           ];
  //           memberTotal += Number(offering.amount || 0);

  //           worksheet.getRow(currentRow).eachCell(cell => {
  //             cell.border = {
  //               top: { style: "thin" },
  //               bottom: { style: "thin" },
  //               left: { style: "thin" },
  //               right: { style: "thin" },
  //             };
  //             cell.alignment = { horizontal: "center" };
  //           });

  //           currentRow++;
  //         });

  //         // Total Amount Row
  //         worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  //         worksheet.getCell(`A${currentRow}`).value = "Total Amount (₹)";
  //         worksheet.getCell(`A${currentRow}`).font = { bold: true };
  //         worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };

  //         worksheet.getCell(`D${currentRow}`).value = memberTotal;
  //         worksheet.getCell(`D${currentRow}`).font = { bold: true };
  //         worksheet.getCell(`D${currentRow}`).alignment = { horizontal: "center" };
  //         worksheet.getCell(`D${currentRow}`).border = {
  //           top: { style: "thin" },
  //           bottom: { style: "thin" },
  //           left: { style: "thin" },
  //           right: { style: "thin" },
  //         };

  //         currentRow += 2; // Spacing after each member
  //       });

  //     // Adjust Column Widths
  //     worksheet.columns = [
  //       { width: 10 },
  //       { width: 30 },
  //       { width: 22 },
  //       { width: 15 },
  //     ];

  //     const buffer = await workbook.xlsx.writeBuffer();
  //     const blob = new Blob([buffer], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //     });


  //     saveAs(blob, `Family Offerings Bill(${familyId || "Unknown"}).xlsx`);
  //   } catch (error) {
  //     console.error("Excel generation failed:", error);
  //     alert("Failed to generate Excel. Check console.");
  //   }
  // };






  const handleDownloadExcel = async () => {
    try {
      const familyHead = members[0];


      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Offerings", {
        pageSetup: {
          paperSize: 9, // A4
          orientation: "portrait",
          fitToPage: true,
          fitToWidth: 1,
          horizontalCentered: true,
          margins: {
            left: 0.3,
            right: 0.3,
            top: 0.5,
            bottom: 0.5,
            header: 0.3,
            footer: 0.3,
          },
        },
      });

      // Church Name - should be on top
      worksheet.mergeCells("A1:D1");
      const churchCell = worksheet.getCell("A1");
      churchCell.value = "CSI CHURCH VYRAKUDI";
      churchCell.font = { bold: true, size: 16, color: { argb: "FF8378FF" } };
      churchCell.alignment = { horizontal: "center" };

      // Title - should be second
      worksheet.mergeCells("A2:D2");
      const titleCell = worksheet.getCell("A2");
      titleCell.value = `Family Offerings Bill (${familyHead.member_name || 'Unknown'})`;                 //  ${familyId || "Unknown"} Family ID display
      titleCell.alignment = { horizontal: "center" };
      titleCell.font = { bold: true, size: 14 };
      // Head Name and ID - styled like preview using members[0]
      // if (familyHead) {
      //   worksheet.mergeCells("A3:D3");
      //   const headInfoCell = worksheet.getCell("A3");

      //   headInfoCell.value = {
      //     richText: [
      //       {
      //         text: "Family Head: ",
      //         font: {
      //           bold: true,
      //           size: 14,
      //           color: { argb: "FF8378FF" },
      //         },
      //       },
      //       {
      //         text: `${familyHead.member_name}  — ID: ${familyHead.member_id}`,
      //         font: {
      //           bold: false,
      //           size: 12,
      //           color: { argb: "FF000000" },
      //         },
      //       },
      //     ],
      //   };
      //   headInfoCell.alignment = { horizontal: "center" };
      // }


      // Dates row - left aligned under title
      const formattedStart = moment(startDate).format("DD/MM/YYYY");
      const formattedEnd = moment(endDate).format("DD/MM/YYYY");
      worksheet.mergeCells("A5:D4");
      const dateInfoCell = worksheet.getCell("A5");
      dateInfoCell.value = `Dates   FROM   ${formattedStart}   TO   ${formattedEnd}`;
      dateInfoCell.font = { bold: true, size: 11 };
      dateInfoCell.alignment = { horizontal: "left" };


      let currentRow = 7;
      let grandTotal = 0;

      members
        .filter(m => offerings.some(o => o.member_id === m.member_id))
        .forEach((member) => {
          const memberOfferings = offerings
            .filter(o =>
              moment(o.date).isBetween(startDate, endDate, undefined, "[]") &&
              o.member_id === member.member_id
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          if (memberOfferings.length === 0) return;

          // Member Name
          worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
          worksheet.getCell(`A${currentRow}`).value =
            `Member: ${member.member_name} (${member.member_tamil_name}) - ${member.member_id}`;
          worksheet.getCell(`A${currentRow}`).font = { bold: true };
          currentRow++;

          // Member ID
          // worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
          // worksheet.getCell(`A${currentRow}`).value =
          //   `Member ID: ${member.member_id}`;
          // worksheet.getCell(`A${currentRow}`).font = { bold: true };
          // currentRow++;


          // Relation to Head
          if (member.relation !== "Head" && familyHead) {
            worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
            worksheet.getCell(`A${currentRow}`).value =
              `Relation: ${member.relation} of (${familyHead.member_name})`;
            worksheet.getCell(`A${currentRow}`).font = { bold: true };
            currentRow++;
          }



          // Table Header
          worksheet.getRow(currentRow).values = [
            "Sl. No",
            "Offering Category",
            "Date of Payment",
            "Amount (₹)"
          ];
          const headerRow = worksheet.getRow(currentRow);
          headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
          headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF8378FF" },
          };
          headerRow.alignment = { horizontal: "center" };
          headerRow.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          currentRow++;

          // Offerings Rows
          memberOfferings.forEach((offering, index) => {
            worksheet.getRow(currentRow).values = [
              index + 1,
              offering.category || "Uncategorized",
              moment(offering.date).format("DD-MM-YYYY"),
              offering.amount
            ];
            grandTotal += Number(offering.amount || 0);

            worksheet.getRow(currentRow).eachCell(cell => {
              cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
              };
              cell.alignment = { horizontal: "center" };
            });

            currentRow++;
          });

          currentRow += 2; // Spacing after each member
        });

      // Grand Total Row
      worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = "Grand Total (₹)";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "right" };

      worksheet.getCell(`D${currentRow}`).value = grandTotal;
      worksheet.getCell(`D${currentRow}`).font = { bold: true };
      worksheet.getCell(`D${currentRow}`).alignment = { horizontal: "center" };
      worksheet.getCell(`D${currentRow}`).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      // Adjust Column Widths
      worksheet.columns = [
        { width: 10 },
        { width: 30 },
        { width: 22 },
        { width: 15 },
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      saveAs(blob, `Family Bill (${familyHead.member_name || 'unknown'}).xlsx`);
    } catch (error) {
      console.error("Excel generation failed:", error);
      alert("Failed to generate Excel. Check console.");
    }
  };



  return (
    <div className="p-6 bg-white rounded shadow max-w-3xl mx-auto print:max-w-full print:shadow-none print:p-2">
      {/* Family Head Info Centered */}
      {members.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
          <span style={{ color: "#8378FF", fontSize: "18px", fontWeight: "700" }}>Family Head:</span>{" "}
          <span style={{ fontSize: "18px", fontWeight: "400" }}>
            {members[0]?.member_name}  — ID: {members[0]?.member_id} {/*({members[0]?.member_tamil_name}) */}
          </span>
        </div>
      )}



      {/* Top bar with title and download */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-xl font-bold underline text-center w-full">
          Family Offerings Bill
        </h1>

        <div className="ml-auto flex gap-2">
          <button
            onClick={handleDownloadExcel}
            className="ml-auto px-4 py-2 bg-[#8378FF] text-white rounded hover:bg-indigo-700 text-sm flex items-center gap-2"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#8378FF] text-white rounded hover:bg-indigo-700 text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-print"></i>
          </button>
        </div>


      </div>

      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 print:hidden"
      >
        ← Back
      </button>
      <div className="flex justify-between items-center my-4 px-2 print:px-0">
        {/* Date Filter - Left Side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold whitespace-nowrap">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold whitespace-nowrap">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded shadow-sm"
            />
          </div>
        </div>

        {/* Grand Total - Right Side */}
        <div className="font-semibold text-base">
          Grand Total ₹: {
            offerings
              .filter(o =>
                moment(o.date).isBetween(startDate, endDate, undefined, "[]")
              )
              .reduce((sum, curr) => sum + Number(curr.amount || 0), 0)
              .toLocaleString()
          }
        </div>
      </div>




      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {members.filter(member =>
            offerings.some(o =>
              o.member_id === member.member_id &&
              moment(o.date).isBetween(startDate, endDate, undefined, "[]")
            )
          ).length === 0 ? (
            <p className="text-center text-gray-600 font-medium mt-6">
              No offerings found for this family.
            </p>

          ) : (
            members
              .filter(member =>
                offerings.some(o =>
                  o.member_id === member.member_id &&
                  moment(o.date).isBetween(startDate, endDate, undefined, "[]")
                )
              )

              .map((member, idx) => (
                <div
                  key={member.member_id}
                  className="mb-6 border-b pb-4 print:break-inside-avoid"
                >
                  <div className="mb-2">
                    <span className="font-semibold">Member Name: </span>
                    {member.member_name} ({member.member_tamil_name})
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold">Member ID: </span>
                    {member.member_id}
                  </div>
                  {/* ✅ Relation */}
                  {member.relation !== "Head" && members[0] && (
                    <div className="mb-4 text-base">
                      <span
                        className="font-semibold"
                        style={{ color: "#8378FF", fontSize: "16px" }}
                      >
                        Relation:
                      </span>{" "}
                      {member.relation} of {members[0]?.member_name}
                    </div>
                  )}

                  <table className="w-full border border-gray-300 text-sm mb-4">
                    <thead>
                      <tr className="bg-[#8378FF] text-white">
                        <th className="border px-2 py-1 text-left">Sl. No</th>
                        <th className="border px-2 py-1 text-left">
                          Offering Category
                        </th>
                        <th className="border px-2 py-1 text-left">
                          Date of Payment
                        </th>
                        <th className="border px-2 py-1 text-left">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offerings
                        .filter(o =>
                          moment(o.date).isBetween(startDate, endDate, undefined, "[]") &&
                          o.member_id === member.member_id
                        )
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((offering, index) => (
                          <tr key={index}>
                            <td className="border px-2 py-1">{index + 1}</td>
                            <td className="border px-2 py-1">
                              {offering.category || "Uncategorized"}
                            </td>
                            <td className="border px-2 py-1">
                              {moment(offering.date).format("DD-MM-YYYY")}
                            </td>
                            <td className="border px-2 py-1">₹{offering.amount}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))
          )}
        </>
      )}
      {/* Grand Total Section */}
      {/* <div className="text-right font-semibold text-base mt-6 pr-2 print:pr-0">
        Grand Total ₹:
        {
          offerings
            .filter(o =>
              moment(o.date).isBetween(startDate, endDate, undefined, "[]")
            )
            .reduce((sum, curr) => sum + Number(curr.amount || 0), 0)
            .toLocaleString()
        }
      </div> */}

    </div>


  );
};

export default BillPreview;
