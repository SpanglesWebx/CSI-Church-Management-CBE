import React from "react";
import { IoIosClose } from "react-icons/io";
import moment from "moment";

const BirthdayPreviewModal = ({
  isOpen,
  onClose,
  data,
  isLoading
}) => {

  // Split into A4 pages (24 per page like Subscription)
  const membersPerPage = 24;

  const chunkedMembers = [];
  for (let i = 0; i < data.length; i += membersPerPage) {
    chunkedMembers.push(
      data.slice(i, i + membersPerPage)
    );
  }

  const handlePrint = () => {

    const printWindow = window.open("", "", "width=900,height=1000");

    let pagesHTML = "";

    for (let i = 0; i < data.length; i += membersPerPage) {

      const pageMembers = data.slice(i, i + membersPerPage);

      pagesHTML += `
        <div class="a4-page">
          <div class="grid">
      `;

pageMembers.forEach((member, index) => {

  const col = index % 3;

  if (col === 1 || col === 2) {
    pagesHTML += `<div></div>`; // gap column
  }

        const memberId = member.member_id || "-";
        const name = (member.member_name || "").toUpperCase();

const formatTitle = (title) => {
  if (!title) return "";
  const t = title.toLowerCase();
  if (t === "mister") return "Mr";
  if ( t === "master") return "Master";
  if (t === "mistress") return "Mrs";
  if (t === "miss") return "Ms";
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const formattedTitle = formatTitle(member.member_title);


        const dob = member.dob
          ? moment(member.dob).format("DD/MM/YYYY")
          : "-";

        // Address split like subscription preview
const fullAddress = [
  member.present_address,
  member.present_pincode
].filter(Boolean).join(",");

const addressParts = fullAddress
  .toUpperCase()
  .split(",")
  .map(p => p.trim());

let addressLines = [];

if (addressParts.length <= 3) {
  addressLines = addressParts;
} else {
  addressLines = [
    addressParts[0],
    addressParts[1],
    addressParts.slice(2).join(", ")
  ];
}

// convert to <div> lines
let formattedAddress = "";
addressLines.slice(0, 3).forEach(line => {
  formattedAddress += `<div>${line}</div>`;
});


        pagesHTML += `
          <div class="label">

            <div class="top-row">
              <div class="member-id">${memberId}</div>
              <div class="dob">${dob}</div>
            </div>

<div class="name">
  ${formattedTitle ? formattedTitle + " " : ""}${name}
</div>

            <div class="address">
              ${formattedAddress}
            </div>

          </div>
        `;
      });

      pagesHTML += `
          </div>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Birthday Print</title>
          <style>
@page {
  size: A4;
  margin: 1.5cm 0.4cm 0.7cm 0.5cm;
}

            body {
              margin: 0;
              font-family: Arial, sans-serif;
            }

.a4-page {
  width: 210mm;
  height: 290mm;
  box-sizing: border-box;
  page-break-after: auto;
}

.grid {
  display: grid;
  grid-template-columns: 
    6.4cm   /* label 1 */
    0.6cm   /* gap 1 */
    6.4cm   /* label 2 */
    0.6cm   /* gap 2 */
    6.4cm;  /* label 3 */

  grid-template-rows: repeat(8, 3.4cm);
  row-gap: 0.15cm;
}


            .label {
              padding: 5px;
              box-sizing: border-box;
              font-size: 12px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }

            .top-row {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
            }

            .name {
              font-weight: bold;
              font-size: 11px;
              margin-top: 2px;
            }

            .address {
              font-size: 10px;
              line-height: 1.2;
              margin-top: 2px;
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

      <div
        className="relative bg-white rounded-lg shadow-lg flex flex-col"
        style={{
          width: "95vw",
          maxWidth: "1100px",
        }}
      >

<div className="flex justify-between items-center p-4 border-b">
  
  <div className="flex items-center gap-3">
    <span className="font-semibold text-lavender--600">
      Birthday Preview
    </span>

    <span className="bg-lavender--600 text-white text-xs px-3 py-1 rounded-full">
      Total : {data.length}
    </span>
  </div>

  <button onClick={onClose}>
    <IoIosClose className="w-6 h-6 text-red-500" />
  </button>
</div>


<div
  className="flex flex-col items-center p-6 overflow-y-auto"
  style={{ overflowX: "hidden", height: "90vh" }}
>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-lavender--600 border-solid mb-4"></div>
              <div className="text-gray-600 font-semibold">
                Loading...
              </div>
            </div>
          ) : (
            <>
              <div id="print-content">
                {chunkedMembers.map((pageMembers, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="bg-white shadow-md border mb-10"
style={{
  width: "21cm",
  height: "29.7cm",
  padding: "1.2cm 0.5cm",
  pageBreakAfter: "always",
}}

                  >
                    <div
                      style={{
                        display: "grid",
gridTemplateColumns: "repeat(3, 6.4cm)",
gridAutoRows: "3.4cm",
columnGap: "0.3cm",
rowGap: "0cm",
                        justifyContent: "center",
                      }}
                    >
                      {pageMembers.map((member, index) => {

                        const dob = member.dob
                          ? moment(member.dob).format("DD/MM/YYYY")
                          : "-";




                        return (
                          <div
                            key={index}
                            className="border p-2 text-[12px] flex flex-col justify-between"
style={{
  width: "6.4cm",
  height: "3.4cm",
}}
                          >

                            <div className="flex justify-between text-[11px]">
                              <div>{member.member_id}</div>
                              <div>{dob}</div>
                            </div>

{(() => {
  const formatTitle = (title) => {
    if (!title) return "";
    const t = title.toLowerCase();
    if (t === "mister" || t === "master") return "Mr";
    if (t === "mistress") return "Mrs";
    if (t === "miss") return "Ms";
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const formattedTitle = formatTitle(member.member_title);

  return (
    <div className="font-bold text-[13px]">
      {formattedTitle && `${formattedTitle} `}
      {member.member_name?.toUpperCase()}
    </div>
  );
})()}


{(() => {
  const fullAddress = [
    member.present_address,
    member.present_pincode
  ].filter(Boolean).join(",");

  const addressParts = fullAddress
    ?.toUpperCase()
    ?.split(",")
    ?.map((p) => p.trim()) || [];

  let addressLines = [];

  if (addressParts.length <= 3) {
    addressLines = addressParts;
  } else {
    addressLines = [
      addressParts[0],
      addressParts[1],
      addressParts.slice(2).join(", "),
    ];
  }

  return addressLines.slice(0, 3).map((line, i) => (
    <div key={i}>{line}</div>
  ));
})()}


                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePrint}
                className="mt-6 px-6 py-2 bg-lavender--600 text-white rounded"
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

export default BirthdayPreviewModal;
