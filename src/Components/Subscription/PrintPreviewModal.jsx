import React from "react";
import { IoIosClose } from "react-icons/io";

const PrintPreviewModal = ({
  isOpen,
  onClose,
  selectedMembers,
  isLoading
}) => {

// Split members into pages of 24
const membersPerPage = 24;

const chunkedMembers = [];
for (let i = 0; i < selectedMembers.length; i += membersPerPage) {
  chunkedMembers.push(
    selectedMembers.slice(i, i + membersPerPage)
  );
}

const handlePrint = () => {

  const printWindow = window.open("", "", "width=900,height=1000");

  let pagesHTML = "";

  const membersPerPage = 24;

  for (let i = 0; i < selectedMembers.length; i += membersPerPage) {

    const pageMembers = selectedMembers.slice(i, i + membersPerPage);

    pagesHTML += `
      <div class="a4-page">
        <div class="grid">
    `;

pageMembers.forEach((member, index) => {

  const col = index % 3;

  if (col === 1 || col === 2) {
    pagesHTML += `<div></div>`; // gap column
  }

  const formatTitle = (title) => {
    if (!title) return "";
    const t = title.toLowerCase();
    if (t === "mister" || t === "master") return "Mr";
    if (t === "mistress") return "Mrs";
    if (t === "miss") return "Ms";
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const formattedTitle = formatTitle(member.member_title);
  const name = (member.member_name || "").toUpperCase();
  const shortName = name.substring(0,2);

const address = (member.present_address || "").toUpperCase();
const pincode = member.present_pincode || "";

const words = address.split(" ").filter(Boolean);

let lines = [];
let currentLine = "";

const maxCharsPerLine = 22;

words.forEach(word => {
  if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
    currentLine += " " + word;
  } else {
    lines.push(currentLine.trim());
    currentLine = word;
  }
});

if (currentLine) lines.push(currentLine.trim());

// limit to 3 lines
lines = lines.slice(0, 3);

// attach pincode to last line
if (pincode) {
  const lastIndex = lines.length - 1;
  let lastLine = lines[lastIndex] || "";

  const maxLength = 22;

  if (lastLine.length > maxLength) {
    lastLine = lastLine.substring(0, maxLength) + "...";
  }

  lines[lastIndex] = `${lastLine} - ${pincode}`;
}

let formattedAddress = "";

lines.forEach(line => {
  formattedAddress += `<div>${line}</div>`;
});


  const mobile = member.primary_contact_number || "";

  const siNumber = String(member.member_id || "")
    .replace(/\D/g, "")
    .slice(0,5);

  // create digit boxes
  let digitBoxes = "";
  siNumber.split("").forEach(digit => {
    digitBoxes += `<div class="digit">${digit}</div>`;
  });

  pagesHTML += `
    <div class="label">

      <div class="top">
        <div class="name">
          ${formattedTitle} ${name}
        </div>
        <div class="short-box">${shortName}</div>
      </div>

      <div class="address">
        ${formattedAddress}
      </div>

      <div class="bottom">

        ${mobile ? `<div class="mobile">Mob: ${mobile}</div>` : ""}

        <div class="si-row">
          <span>சந்தா எண் :</span>
          <div class="si-box">
            ${digitBoxes}
          </div>
        </div>

      </div>

    </div>
  `;
});


    pagesHTML += `
        </div>
      </div>
    `;
  }
  
  // current margin
  // margin: 13.5mm 9mm 10.5mm 3.5mm;
  // If the margin is not correct, use this 
  // margin: 12.5mm 6mm 11.5mm 6mm;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          @page {
            size: A4;
            margin: 12.5mm 6mm 11.5mm 7mm;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

.a4-page {
  width: 210mm;
  height: 289mm;
  box-sizing: border-box;
  page-break-after: always;
}

.a4-page:last-child {
  page-break-after: auto;
}

.grid {
  display: grid;
  grid-template-columns: 
    64mm   /* label 1 */
    6mm    /* gap 1 */
    64mm   /* label 2 */
    8.5mm   /* gap 2 */
    64mm;  /* label 3 */

  grid-template-rows: repeat(8, 34mm);
  row-gap: 2mm;
}

.label {
  height: 34mm;
  width: 64mm;
  padding: 5px;
  box-sizing: border-box;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
  


.short-box {
  border: 1px solid #000;
  padding: 2px 6px;
  font-weight: bold;
  font-size: 14px;
  margin-top: 12px;
}



.si-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
}

.si-box {
  display: flex;
  gap: 5px;
}

.digit {
  border: 1px solid #000;
  width: 20px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: bold;
}


.name {
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  // text-overflow: ellipsis;
  max-width: 80%;
}

          .address {
            font-size: 11px;
            line-height: 1.2;
          }

          .bottom {
            font-size: 14px;
            font-weight: bold;
          }

          .mobile {
            text-align: right;
          }

          .si {
            margin-top: 1px;
            font-weight: bold;
          }

        </style>
      </head>
      <body>
        ${pagesHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

      {/* Custom Large Modal */}
      <div
        className="relative bg-white rounded-lg shadow-lg flex flex-col"
        style={{
          width: "95vw",
          maxWidth: "1100px",
          maxHeight: "100vh",
        }}
      >

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <span className="font-semibold text-lavender--600">
            Preview Labels
          </span>
          <button onClick={onClose}>
            <IoIosClose className="w-6 h-6 text-red-500" />
          </button>
        </div>

        {/* Scrollable Body (HEIGHT scroll only) */}
<div
  className="flex flex-col items-center justify-start p-6 overflow-y-auto print-area"
  style={{ overflowX: "hidden", minHeight: "500px" }}
>
  {isLoading ? (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-lavender--600 border-solid mb-4"></div>
      <div className="text-gray-600 font-semibold">
        Loading labels...
      </div>
    </div>
  ) : (
    <>
      {/* EXISTING PRINT CONTENT HERE */}
      <div id="print-content">
{chunkedMembers.map((pageMembers, pageIndex) => (

  <div
    key={pageIndex}
    className="bg-white shadow-md border mb-10"
    style={{
      width: "21cm",
      height: "29.7cm",
      padding: "5mm",
      pageBreakAfter: "always",
    }}
  >
    <div
style={{
  display: "grid",
  gridTemplateColumns: "64mm 64mm 64mm",
  gridTemplateRows: "repeat(8, 34mm)",
  columnGap: "3mm",
  rowGap: "2mm",
}}
    >
      {pageMembers.map((member, index) => {

        const formatTitle = (title) => {
          if (!title) return "";
          const t = title.toLowerCase();
          if (t === "mister" || t === "master") return "Mr";
          if (t === "mistress") return "Mrs";
          if (t === "miss") return "Ms";
          return t.charAt(0).toUpperCase() + t.slice(1);
        };

        const formattedTitle = formatTitle(member.member_title);
        const shortName =
          member.member_name?.substring(0, 2).toUpperCase();

        const siNumber = String(member.member_id || "")
          .replace(/\D/g, "")
          .slice(0, 5);

        return (
          <div
            key={index}
            className="border p-2 text-[12px] flex flex-col justify-between"
            style={{
              width: "64mm",
              height: "34mm",
            }}
          >
            {/* TOP ROW */}
<div className="flex justify-between items-center overflow-hidden">
  
  <div
    className="font-bold text-[13px]"
    style={{
      whiteSpace: "nowrap",
      overflow: "hidden",
      // textOverflow: "ellipsis",
      maxWidth: "80%" // IMPORTANT
    }}
  >
    {formattedTitle} {member.member_name?.toUpperCase()}
  </div>

  <div className="border px-1 text-[15px] font-bold ml-2 flex-shrink-0">
    {shortName}
  </div>

</div>

            {/* ADDRESS */}
            <div
              className="text-[12px] leading-tight mt-1 overflow-hidden"
              style={{ minHeight: "36px" }}
            >
              {(() => {
const address = (member.present_address || "").toUpperCase();
const pincode = member.present_pincode || "";

const words = address.split(" ").filter(Boolean);

let lines = [];
let currentLine = "";

const maxCharsPerLine = 22;

words.forEach(word => {
  if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
    currentLine += " " + word;
  } else {
    lines.push(currentLine.trim());
    currentLine = word;
  }
});

if (currentLine) lines.push(currentLine.trim());

// limit to 3 lines
lines = lines.slice(0, 3);

// add pincode to last line
if (pincode) {
  const lastIndex = lines.length - 1;
  let lastLine = lines[lastIndex] || "";

  const maxLength = 22; // adjust if needed

  if (lastLine.length > maxLength) {
    lastLine = lastLine.substring(0, maxLength) + "...";
  }

  lines[lastIndex] = `${lastLine} - ${pincode}`;
}

return lines.map((line, i) => (
  <div key={i}>{line}</div>
));
              })()}
            </div>

            {/* MOBILE + SI NUMBER */}
            <div className="flex flex-col mt-1">

              {member.primary_contact_number && (
                <div className="text-[12px] text-right">
                  Mob: {member.primary_contact_number}
                </div>
              )}

              <div className="flex items-center justify-between mt-[1px]">
                <div className="text-[12px] font-semibold">
                  சந்தா எண் :
                </div>

                <div className="flex gap-[2px]">
                  {siNumber.split("").map((digit, i) => (
                    <div
                      key={i}
                      className="border w-[20px] h-[14px] flex items-center justify-center text-[13px]"
                    >
                      <b>{digit}</b>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  </div>

))}      </div>

      <button
        onClick={handlePrint}
        className="mt-6 px-6 py-2 bg-lavender--600 text-white rounded print:hidden"
      >
        Print
      </button>
    </>
  )}
</div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;







// import React from "react";
// import { IoIosClose } from "react-icons/io";

// const PrintPreviewModal = ({
//   isOpen,
//   onClose,
//   selectedMembers,
//   isLoading
// }) => {

// // Split members into pages of 24
// const membersPerPage = 24;

// const chunkedMembers = [];
// for (let i = 0; i < selectedMembers.length; i += membersPerPage) {
//   chunkedMembers.push(
//     selectedMembers.slice(i, i + membersPerPage)
//   );
// }

// const handlePrint = () => {

//   const printWindow = window.open("", "", "width=900,height=1000");

//   let pagesHTML = "";

//   const membersPerPage = 24;

//   for (let i = 0; i < selectedMembers.length; i += membersPerPage) {

//     const pageMembers = selectedMembers.slice(i, i + membersPerPage);

//     pagesHTML += `
//       <div class="a4-page">
//         <div class="grid">
//     `;

// pageMembers.forEach((member, index) => {

//   const col = index % 3;

//   if (col === 1 || col === 2) {
//     pagesHTML += `<div></div>`; // gap column
//   }

//   const formatTitle = (title) => {
//     if (!title) return "";
//     const t = title.toLowerCase();
//     if (t === "mister" || t === "master") return "Mr";
//     if (t === "mistress") return "Mrs";
//     if (t === "miss") return "Ms";
//     return t.charAt(0).toUpperCase() + t.slice(1);
//   };

//   const formattedTitle = formatTitle(member.member_title);
//   const name = (member.member_name || "").toUpperCase();
//   const shortName = name.substring(0,2);

// const address = (member.present_address || "").toUpperCase();
// const pincode = member.present_pincode || "";

// const words = address.split(" ").filter(Boolean);

// let lines = [];
// let currentLine = "";

// const maxCharsPerLine = 22;

// words.forEach(word => {
//   if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
//     currentLine += " " + word;
//   } else {
//     lines.push(currentLine.trim());
//     currentLine = word;
//   }
// });

// if (currentLine) lines.push(currentLine.trim());

// // limit to 3 lines
// lines = lines.slice(0, 3);

// // attach pincode to last line
// if (pincode) {
//   const lastIndex = lines.length - 1;
//   let lastLine = lines[lastIndex] || "";

//   const maxLength = 22;

//   if (lastLine.length > maxLength) {
//     lastLine = lastLine.substring(0, maxLength) + "...";
//   }

//   lines[lastIndex] = `${lastLine} - ${pincode}`;
// }

// let formattedAddress = "";

// lines.forEach(line => {
//   formattedAddress += `<div>${line}</div>`;
// });


//   const mobile = member.primary_contact_number || "";

//   const siNumber = String(member.member_id || "")
//     .replace(/\D/g, "")
//     .slice(0,5);

//   // create digit boxes
//   let digitBoxes = "";
//   siNumber.split("").forEach(digit => {
//     digitBoxes += `<div class="digit">${digit}</div>`;
//   });

//   pagesHTML += `
//     <div class="label">

//       <div class="top">
//         <div class="name">
//           ${formattedTitle} ${name}
//         </div>
//         <div class="short-box">${shortName}</div>
//       </div>

//       <div class="address">
//         ${formattedAddress}
//       </div>

//       <div class="bottom">

//         ${mobile ? `<div class="mobile">Mob: ${mobile}</div>` : ""}

//         <div class="si-row">
//           <span>சந்தா எண் :</span>
//           <div class="si-box">
//             ${digitBoxes}
//           </div>
//         </div>

//       </div>

//     </div>
//   `;
// });


//     pagesHTML += `
//         </div>
//       </div>
//     `;
//   }
  
//   // current margin
//   // margin: 13.5mm 9mm 10.5mm 3.5mm;
//   // If the margin is not correct, use this 
//   // margin: 12.5mm 6mm 11.5mm 6mm;

//   printWindow.document.write(`
//     <html>
//       <head>
//         <title>Print</title>
//         <style>
//           @page {
//             size: A4;
//             margin: 12.5mm 6mm 11.5mm 7mm;
//           }

//           body {
//             margin: 0;
//             font-family: Arial, sans-serif;
//           }

// .a4-page {
//   width: 210mm;
//   height: 289mm;
//   box-sizing: border-box;
//   page-break-after: always;
// }

// .a4-page:last-child {
//   page-break-after: auto;
// }

// .grid {
//   display: grid;
//   grid-template-columns: 
//     64mm   /* label 1 */
//     6mm    /* gap 1 */
//     64mm   /* label 2 */
//     8.5mm   /* gap 2 */
//     64mm;  /* label 3 */

//   grid-template-rows: repeat(8, 34mm);
//   row-gap: 2mm;
// }

// .label {
//   height: 34mm;
//   width: 64mm;
//   padding: 4px;
//   box-sizing: border-box;
//   font-size: 12px;
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
//   overflow: hidden;
// }

// .top {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// }
  


// .short-box {
//   border: 1px solid #000;
//   padding: 2px 6px;
//   font-weight: bold;
//   font-size: 14px;
//   margin-top: 12px;
// }



// .si-row {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-top: 2px;
// }

// .si-box {
//   display: flex;
//   gap: 5px;
// }

// .digit {
//   border: 1px solid #000;
//   width: 20px;
//   height: 18px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 17px;
//   font-weight: bold;
// }


//           .name {
//             font-weight: bold;
//             font-size: 14px;
//           }

//           .address {
//             font-size: 11px;
//             line-height: 1.2;
//           }

//           .bottom {
//             font-size: 14px;
//             font-weight: bold;
//           }

//           .mobile {
//             text-align: right;
//           }

//           .si {
//             margin-top: 1px;
//             font-weight: bold;
//           }

//         </style>
//       </head>
//       <body>
//         ${pagesHTML}
//       </body>
//     </html>
//   `);

//   printWindow.document.close();
//   printWindow.focus();
//   printWindow.print();
//   printWindow.close();
// };


//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

//       {/* Custom Large Modal */}
//       <div
//         className="relative bg-white rounded-lg shadow-lg flex flex-col"
//         style={{
//           width: "95vw",
//           maxWidth: "1100px",
//           maxHeight: "100vh",
//         }}
//       >

//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b">
//           <span className="font-semibold text-lavender--600">
//             Preview Labels
//           </span>
//           <button onClick={onClose}>
//             <IoIosClose className="w-6 h-6 text-red-500" />
//           </button>
//         </div>

//         {/* Scrollable Body (HEIGHT scroll only) */}
// <div
//   className="flex flex-col items-center justify-start p-6 overflow-y-auto print-area"
//   style={{ overflowX: "hidden", minHeight: "500px" }}
// >
//   {isLoading ? (
//     <div className="flex flex-col items-center justify-center h-full">
//       <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-lavender--600 border-solid mb-4"></div>
//       <div className="text-gray-600 font-semibold">
//         Loading labels...
//       </div>
//     </div>
//   ) : (
//     <>
//       {/* EXISTING PRINT CONTENT HERE */}
//       <div id="print-content">
// {chunkedMembers.map((pageMembers, pageIndex) => (

//   <div
//     key={pageIndex}
//     className="bg-white shadow-md border mb-10"
//     style={{
//       width: "21cm",
//       height: "29.7cm",
//       padding: "5mm",
//       pageBreakAfter: "always",
//     }}
//   >
//     <div
// style={{
//   display: "grid",
//   gridTemplateColumns: "64mm 64mm 64mm",
//   gridTemplateRows: "repeat(8, 34mm)",
//   columnGap: "3mm",
//   rowGap: "2mm",
// }}
//     >
//       {pageMembers.map((member, index) => {

//         const formatTitle = (title) => {
//           if (!title) return "";
//           const t = title.toLowerCase();
//           if (t === "mister" || t === "master") return "Mr";
//           if (t === "mistress") return "Mrs";
//           if (t === "miss") return "Ms";
//           return t.charAt(0).toUpperCase() + t.slice(1);
//         };

//         const formattedTitle = formatTitle(member.member_title);
//         const shortName =
//           member.member_name?.substring(0, 2).toUpperCase();

//         const siNumber = String(member.member_id || "")
//           .replace(/\D/g, "")
//           .slice(0, 5);

//         return (
//           <div
//             key={index}
//             className="border p-2 text-[12px] flex flex-col justify-between"
//             style={{
//               width: "64mm",
//               height: "34mm",
//             }}
//           >
//             {/* TOP ROW */}
//             <div className="flex justify-between items-center whitespace-nowrap overflow-hidden">
//               <div className="font-bold text-[13px] truncate">
//                 {formattedTitle}{" "}
//                 {member.member_name?.toUpperCase()}
//               </div>

//               <div className="border px-1 text-[15px] font-bold ml-2">
//                 {shortName}
//               </div>
//             </div>

//             {/* ADDRESS */}
//             {/* <div
//               className="text-[12px] leading-tight mt-1 overflow-hidden"
//               style={{ minHeight: "36px" }}
//             > */}
//             <div
//   className="text-[12px] leading-tight mt-1 overflow-hidden"
//   style={{
//     height: "36px",
//     display: "block"
//   }}
// >
//               {(() => {
// const address = (member.present_address || "").toUpperCase();
// const pincode = member.present_pincode || "";

// const words = address.split(" ").filter(Boolean);

// let lines = [];
// let currentLine = "";

// const maxCharsPerLine = 22;

// words.forEach(word => {
//   if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
//     currentLine += " " + word;
//   } else {
//     lines.push(currentLine.trim());
//     currentLine = word;
//   }
// });

// if (currentLine) lines.push(currentLine.trim());

// // limit to 3 lines
// lines = lines.slice(0, 3);

// // add pincode to last line
// if (pincode) {
//   const lastIndex = lines.length - 1;
//   let lastLine = lines[lastIndex] || "";

//   const maxLength = 22; // adjust if needed

//   if (lastLine.length > maxLength) {
//     lastLine = lastLine.substring(0, maxLength) + "...";
//   }

//   lines[lastIndex] = `${lastLine} - ${pincode}`;
// }

// // return lines.map((line, i) => (
// //   <div key={i}>{line}</div>
// // ));


// return (
//   <div style={{ textAlign: "left" }}>
//     {lines.join(" ")}
//   </div>
// );
//               })()}
//             </div>

//             {/* MOBILE + SI NUMBER */}
//             <div className="flex flex-col mt-1">

//               {member.primary_contact_number && (
//                 <div className="text-[12px] text-right">
//                   Mob: {member.primary_contact_number}
//                 </div>
//               )}

//               <div className="flex items-center justify-between mt-[1px]">
//                 <div className="text-[12px] font-semibold">
//                   சந்தா எண் :
//                 </div>

//                 <div className="flex gap-[2px]">
//                   {siNumber.split("").map((digit, i) => (
//                     <div
//                       key={i}
//                       className="border w-[20px] h-[14px] flex items-center justify-center text-[13px]"
//                     >
//                       <b>{digit}</b>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//             </div>
//           </div>
//         );
//       })}
//     </div>
//   </div>

// ))}      </div>

//       <button
//         onClick={handlePrint}
//         className="mt-6 px-6 py-2 bg-lavender--600 text-white rounded print:hidden"
//       >
//         Print
//       </button>
//     </>
//   )}
// </div>
//       </div>
//     </div>
//   );
// };

// export default PrintPreviewModal;
