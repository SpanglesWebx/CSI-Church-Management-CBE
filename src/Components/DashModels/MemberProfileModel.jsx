



import React from "react";
import Modal from "../Expense/SubscriptionModal";
import { URL } from "../../App";
import moment from "moment";

import { FaUser, FaPeopleRoof, FaCircleUser } from "react-icons/fa6";

const MemberProfileModal = ({ isOpen, onClose, member }) => {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [member?.photo]);

  if (!member) return null;

  const shortTitle = (title) => {
    switch (title) {
      case "Mister":
        return "Mr";
      case "Miss":
        return "Ms";
      case "Master":
        return "Mas";
      case "Mrs":
        return "Mrs";
      default:
        return title || "";
    }
  };


  const hasDualMembership =
    member.is_dual_member ||
    member.dual_member_id ||
    member.church_name;

  const hasMarriageInfo =
    member.marital_status ||
    member.marriage_date ||
    member.marriage_place;


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile Information">
      <div className="max-h-[75vh] overflow-y-auto px-1 space-y-3">


        {/* HEADER */}
        <div className="flex flex-col items-center text-center border-b pb-6 mb-4">

          {/* IMAGE */}
          <div className="mb-3">
            {member?.photo && !imgError ? (
              <img
                src={`${URL}${member.photo}`}
                alt={member.member_name}
                onError={() => setImgError(true)}
                className="w-28 h-28 rounded-full object-cover border-4 border-lavender--600"
              />
            ) : (
              <FaCircleUser className="w-28 h-28 text-lavender--600" />
            )}
          </div>

          {/* NAME */}
          <h2 className="text-xl font-bold text-lavender--600">
            {shortTitle(member.member_title)} {member.member_name}
          </h2>

          {/* MEMBER TYPE */}
          <p className="text-gray-600">{member.member_type}</p>

          {/* MEMBER + FAMILY */}
          <p className="text-sm mt-1 flex items-center justify-center gap-4">

            <span className="flex items-center gap-1 text-gray-600">
              <FaUser className="text-lavender--600" />
              {member.member_id}
            </span>

            <span className="flex items-center gap-1 text-gray-600">
              < FaPeopleRoof className="text-lavender--600" />
              {member.family_id}
            </span>

          </p>


          {member.isHead === "No" && (
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-700 border-b pb-4 mb-4">

              <div>
                <span className="font-semibold ">Head ID:</span>{" "}
                {member.head_member_id || "-"}
              </div>

              <div>
                <span className="font-semibold ">Head:</span>{" "}
                {member.head_name || "-"}
              </div>

              <div>
                <span className="font-semibold">Relation:</span>{" "}
                {member.relation_with_head || "-"}
              </div>

            </div>
          )}

        </div>

        {/* TRANSFER DETAILS */}
        {member.is_transferred === "Yes" && (
          <Section title="Transfer Details">
            <Field label="Old Family ID" value={member.old_family_id} />

            <Field
              label="Family Transferred On"
              value={
                member.family_changed_at
                  ? moment(member.family_changed_at).format(
                    "DD-MMM-YYYY hh:mm A"
                  )
                  : "-"
              }
            />

            <Field label="Old Member ID" value={member.old_member_id} />

            <Field
              label="Old Member ID Changed On"
              value={
                member.old_member_id_changed_at
                  ? moment(member.old_member_id_changed_at).format(
                    "DD-MMM-YYYY hh:mm A"
                  )
                  : "-"
              }
            />

            <Field label="Old Member Type" value={member.old_member_type} />

            <Field
              label="Old Member Type Changed On"
              value={
                member.old_member_type_changed_at
                  ? moment(member.old_member_type_changed_at).format(
                    "DD-MMM-YYYY hh:mm A"
                  )
                  : "-"
              }
            />
          </Section>
        )}


        {/* PERSONAL DETAILS */}
        <Section title="Personal Details">
          <Field
            label="Member Name"
            value={
              (member.member_title
                ? shortTitle(member.member_title) + " "
                : "") + member.member_name
            }
          />

          <Field
            label="Member Tamil Name"
            value={
              (member.member_tamil_title
                ? member.member_tamil_title + " "
                : "") + member.member_tamil_name
            }
          />

          <Field label="Father Name" value={member.father_name} />
          <Field label="Mother Name" value={member.mother_name} />
          <Field label="Gender" value={member.gender} />

          <Field
            label="Date of Birth"
            value={
              member.dob ? moment(member.dob).format("DD-MMM-YYYY") : "-"
            }
          />

          <Field label="Age" value={member.age} />
          <Field label="Place of Birth" value={member.place_of_birth} />

          <Field
            label="Primary Number"
            value={member.primary_contact_number}
          />

          <Field
            label="Contact Numbers"
            value={
              member.contact_numbers?.length
                ? member.contact_numbers.join(", ")
                : "-"
            }
          />

          <Field label="Aadhar Number" value={member.aadhar_number} />
          <Field label="Email" value={member.email} />
          <Field label="Blood Group" value={member.blood_group} />

          <Field
            label="Membership From"
            value={
              member.membership_from
                ? moment(member.membership_from).format("DD/MM/YYYY")
                : "-"
            }
          />

          <Field label="Qualification" value={member.qualification} />
          <Field label="Occupation" value={member.occupation} />

          <Field label="Status" value={member.status} />
          <Field label="Membership Status" value={member.membership_status} />

          {member.status === "Inactive" && (
            <>
              <Field label="Inactive Reason" value={member.inactive_reason} />
              <Field
                label="Inactive Description"
                value={member.inactive_description}
              />
            </>
          )}

          {member.membership_status === "Hold" && (
            <Field label="Hold Reason" value={member.hold_reason} />
          )}
        </Section>




        {/* DUAL MEMBERSHIP */}
        {hasDualMembership && (
          <Section title="Dual Membership">
            <Field label="Is Dual Member" value={member.is_dual_member} />
            <Field label="Dual Member ID" value={member.dual_member_id} />
            <Field label="Church Name" value={member.church_name} />
          </Section>
        )}

        {/* ADDRESS */}
        <Section title="Address">
          <Field label="Zone" value={member.zone} />
          <Field label="Area" value={member.area} />
          <Field label="Residential Address" value={member.present_address} />
          <Field label="Permanent Address" value={member.permanent_address} />
          <Field label="Official Address" value={member.official_address} />
          <Field label="Official Pincode" value={member.official_pincode} />
          <Field label="Residential Pincode" value={member.present_pincode} />
          <Field label="Permanent Pincode" value={member.permanent_pincode} />
        </Section>

        {/* SPIRITUAL INFORMATION */}
        <Section title="Spiritual Information">
          <Field label="Baptism Status" value={member.baptism} />
          <Field
            label="Baptism Date"
            value={
              member.baptism_date
                ? moment(member.baptism_date).format("DD-MMM-YYYY")
                : "-"
            }
          />
          <Field label="Baptized By" value={member.baptism_by} />
          <Field label="Baptized Church" value={member.baptism_church} />

          <Field label="Confirmation Status" value={member.confirmation} />
          <Field
            label="Confirmation Date"
            value={
              member.confirmation_date
                ? moment(member.confirmation_date).format("DD-MMM-YYYY")
                : "-"
            }
          />
          <Field label="Confirmed By" value={member.confirmation_by} />
          <Field label="Confirmed Church" value={member.confirmation_church} />
        </Section>

        {/* MARITAL */}
        {hasMarriageInfo && (
          <Section title="Marital Information">
            <Field label="Marital Status" value={member.marital_status} />
            <Field
              label="Marriage Date"
              value={
                member.marriage_date
                  ? moment(member.marriage_date).format("DD-MMM-YYYY")
                  : "-"
              }
            />
            <Field label="Marriage Place" value={member.marriage_place} />
          </Section>
        )}

      </div>
    </Modal>
  );
};

export default MemberProfileModal;

/* COMPONENTS */

const Section = ({ title, children }) => (
  <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
    <h1 className="text-lg text-lavender--600 font-semibold mb-3">{title}</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
      {children}
    </div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4">
    <span className="text-md font-bold text-gray-600">{label}</span>
    <span className="text-gray-800 whitespace-pre-wrap">{value || "-"}</span>
  </div>
);