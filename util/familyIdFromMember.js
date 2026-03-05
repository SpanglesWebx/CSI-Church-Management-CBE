// util/familyIdFromMember.js

exports.familyIdFromMemberId = (memberId) => {
  if (!memberId) return null;

  // remove /1 or /2 etc → keep MBR00023
  const base = memberId.split("/")[0];

  // remove MBR prefix → keep numeric part only
  const num = base.replace("MBR", "");

  // return family id
  return `FAM${num}`;
};
