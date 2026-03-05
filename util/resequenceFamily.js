const Family = require("../Schema/familySchema");
const Member = require("../Schema/memberSchema");

module.exports = async function resequenceFamilyChildren(familyId) {
  const family = await Family.findOne({ family_id: familyId });
  if (!family) return;

  const base = family.head.member_id.split("/")[0];
  const headId = family.head.member_id;

  // Extract only valid children (never include head)
  let subs = family.members
    .filter(m => m.member_id !== headId && m.member_id.startsWith(base + "/"))
    .map(m => ({
      doc: m,
      num: Number(m.member_id.split("/")[1])
    }))
    .filter(x => x.num >= 2) // absolutely block /1
    .sort((a, b) => a.num - b.num);

  let expected = 2;

  for (const s of subs) {
    const newId = `${base}/${expected}`;

    if (s.doc.member_id !== newId) {
      // ensure we never overwrite an existing ID
      const exists = await Member.findOne({ member_id: newId });
      if (!exists) {
        await Member.updateOne(
          { member_id: s.doc.member_id },
          { member_id: newId }
        );
        s.doc.member_id = newId;
      }
    }

    expected++;
  }

  await family.save();
};
