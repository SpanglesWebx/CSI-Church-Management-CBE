const Offerings = require('../Schema/offerSchema');
const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");
const Pastor = require("../Schema/pastorSchema");
const PastorFamilyMember = require("../Schema/pastorFamilyMemberSchema");
const Subscription = require("../Schema/Subscription");
const BibleSentence = require("../Schema/BibleSentence");


const SundayClass = require("../Schema/SundayClass");
const { SundaySchoolEvent } = require("../Schema/sundaysclEventSchema");
const SundayExam = require("../Schema/sundayExamSchema");
const { WomenEvent } = require("../Schema/womenEventSchema");
const WomenActivity = require("../Schema/WomenActivitySchema");


const ChoirMember = require("../Schema/ChoirMemberSchema");
const ChoirMaster = require("../Schema/ChoirMasterSchema");
const { ChoirEvent, ChoirEventBy } = require("../Schema/choirEventSchema");


const CouplesFellowship = require("../Schema/CouplesFellowshipSchema");
const { CoupleEvent } = require("../Schema/coupleEventSchema");

const Notification = require("../Schema/NotificationSchema");


exports.getOfferingsByMember = async (req, res) => {
  try {
    const { member_id } = req.params;
    if (!member_id) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // Check if the member exists in any of the collections
    const normalMember = await Member.findOne({ member_id });
    const pastorMember = await Pastor.findOne({ member_id });
    const pastorFamilyMember = await PastorFamilyMember.findOne({ member_id });

    let offerings = [];

    if (normalMember) {
      // Normal church member
      offerings = await Offerings.find({ member_id })
        .sort({ date: -1 })
        .select("category date amount");
    } else if (pastorMember) {
      // Pastor's personal offerings
      offerings = await Offerings.find({ member_id })
        .sort({ date: -1 })
        .select("category date amount");
    } else if (pastorFamilyMember) {
      // Pastor's family member offerings
      offerings = await Offerings.find({ member_id })
        .sort({ date: -1 })
        .select("category date amount");
    } else {
      // Check if belongs to a family (normal member family)
      const family = await Family.findOne({ "members.member_id": member_id });
      if (family) {
        offerings = await Offerings.find({
          member_id: { $in: family.members.map(m => m.member_id) },
        })
          .sort({ date: -1 })
          .select("category date amount");
      } else {
        return res.status(404).json({ error: "No member or offerings found" });
      }
    }

    return res.status(200).json(offerings);
  } catch (error) {
    console.error("Error fetching offerings:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMemberName = async (req, res) => {
  try {
    const { member_id } = req.params;

    if (!member_id) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const member =
      (await Member.findOne({ member_id })
        .select("member_name member_title dob marriage_date")) ||

      (await Pastor.findOne({ member_id })
        .select("member_name dob marriage_date")) ||

      (await PastorFamilyMember.findOne({ member_id })
        .select("member_name dob marriage_date"));

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json({
      name: member.member_name,
      title: member.member_title || "",
      dob: member.dob || "",
      marriage_date: member.marriage_date || ""
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFamilyIfHead = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findOne({ member_id: memberId });

    if (!member) {
      return res.status(404).json({
        isHead: false,
        message: "Member not found",
      });
    }

    if (member.isHead !== "Yes") {
      return res.status(200).json({
        isHead: false,
        message: "Member is not a family head",
      });
    }

    const family = await Family.findOne({
      "head.member_id": memberId,
    });

    if (!family) {
      return res.status(200).json({
        isHead: false,
        message: "Family record not found",
      });
    }

    // Get relation from Member collection
    const memberIds = family.members.map(m => m.member_id);

    const memberDetails = await Member.find(
      { member_id: { $in: memberIds } },
      { member_id: 1, relation_with_head: 1, photo: 1 }
    );

    const members = family.members
      .filter(m => m.member_id !== family.head.member_id)
      .map(m => {
        const extra = memberDetails.find(
          d => d.member_id === m.member_id
        );

        return {
          member_id: m.member_id,
          member_name: m.member_name,
          relation_with_head: extra?.relation_with_head || "",
          photo: extra?.photo || ""
        };
      });

    return res.status(200).json({
      isHead: true,
      family: {
        family_id: family.family_id,
        photo: family.photo || "",
        head: family.head,
        members,
      },
    });

  } catch (error) {
    console.error("Family fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFamilyByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check if the member is head first
    const familyAsHead = await Family.findOne({ head: memberId });
    if (familyAsHead) {
      return res.status(200).json({
        isHead: true,
        family_id: familyAsHead.family_id,
      });
    }

    // Else check if the member is part of any family
    const familyAsMember = await Family.findOne({ "members.ref_id": memberId });
    if (familyAsMember) {
      return res.status(200).json({
        isHead: false,
        family_id: familyAsMember.family_id,
      });
    }

    res.status(200).json({ isHead: false, family_id: null });
  } catch (error) {
    console.error("Error fetching family info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSubscriptionsByMember = async (req, res) => {
  try {

    const member_id = decodeURIComponent(req.params.member_id);

    if (!member_id) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const currentYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;

    const normalMember = await Member.findOne({ member_id });
    const pastorMember = await Pastor.findOne({ member_id });
    const pastorFamilyMember = await PastorFamilyMember.findOne({ member_id });

    let subscriptions = [];

    if (normalMember || pastorMember || pastorFamilyMember) {

      subscriptions = await Subscription.find({
        member_id,
        year: currentYear
      });

    } else {

      const family = await Family.findOne({ "members.member_id": member_id });

      if (family) {

        const familyMemberIds = family.members.map((m) => m.member_id);

        subscriptions = await Subscription.find({
          member_id: { $in: familyMemberIds },
          year: currentYear
        });

      } else {
        return res.status(404).json({
          error: "No subscriptions found for this member"
        });
      }
    }

    if (!subscriptions.length) {
      return res.status(200).json({
        success: true,
        subscriptions: []
      });
    }

    const allMonths = [
      "april", "may", "june", "july", "august", "september",
      "october", "november", "december", "january", "february", "march"
    ];

    const defaultMonth = { allocations: [], total: 0 };

    const formatted = subscriptions.map((sub) => {

      const months = {};

      allMonths.forEach((month) => {
        months[month] = sub[month] || defaultMonth;
      });

      return {
        year: sub.year,
        member_id: sub.member_id,
        member_name: sub.member_name,
        months
      };
    });

    res.status(200).json(formatted);

  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.getSingleSubscriptionView = async (req, res) => {
  try {

    const member_id = decodeURIComponent(req.params.member_id);

    const currentYear =
      new Date().getMonth() >= 3
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;

    const subscriptions = await Subscription.find({
      member_id,
      year: currentYear
    });

    if (!subscriptions.length) {
      return res.status(200).json({
        success: true,
        subscriptions: []
      });
    }

    const memberInfo = {
      member_id: subscriptions[0].member_id,
      member_name: subscriptions[0].member_name
    };

    res.status(200).json({
      success: true,
      memberInfo,
      subscriptions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findOne(
      { member_id: memberId },
      { member_name: 1, photo: 1, _id: 0 }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(member);

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getDailyVerse = async (req, res) => {
  try {
    const { memberId } = req.params;

    const today = new Date();
    const dayNumber = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

    const verses = await BibleSentence.find({ status: true }).sort({ _id: 1 });

    // if (!verses.length) {
    //   return res.status(404).json({ message: "No verses found" });
    // }

    if (!verses.length) {
      return res.status(200).json({});
    }

    // Unique verse per member per day
    const memberHash = memberId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const index = (dayNumber + memberHash) % verses.length;

    const verse = verses[index];


    res.status(200).json(verse);
  } catch (error) {
    console.error("Daily verse error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





exports.getMemberProfileFull = async (req, res) => {
  try {
    const { memberId } = req.params;

    // 1️⃣ Fetch Member using member_id
    const member = await Member.findOne({ member_id: memberId });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // 2️⃣ Fetch Family
    const family = await Family.findOne({ family_id: member.family_id });

    let head_name = "";
    let head_member_id = "";
    let relation_with_head = member.relation_with_head || "";

    // 3️⃣ If member is head
    if (member.isHead === "Yes") {
      head_name = member.member_name;
      head_member_id = member.member_id;
    }

    // 4️⃣ If member is not head
    else if (family) {
      head_name = family.head?.member_name || "";
      head_member_id = family.head?.member_id || "";
    }

    // 5️⃣ Send response
    res.status(200).json({
      message: "Member fetched successfully",
      data: {
        ...member.toObject(),
        head_name,
        head_member_id,
        relation_with_head,
        family_members: family?.members || []
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching member",
      error: error.message
    });
  }
};




exports.getUpcomingDashboardItems = async (req, res) => {
  try {

    const { memberId } = req.params;

    const member = await Member.findOne({ member_id: memberId });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    /* FIND CLASS */

    const sundayClass = await SundayClass.findOne({
      $or: [
        { "teacher.member_id": memberId },
        { "students.member_id": memberId }
      ]
    }).lean();

    let ssEvents = [];
    let ssExams = [];

    if (sundayClass) {

      const classFull = `${sundayClass.class_name} - ${sundayClass.section_name}`;

      /* EVENTS */

      const events = await SundaySchoolEvent.find({
        eventDate: { $gte: startOfToday }
      })
        .populate("eventBy", "name")
        .sort({ eventDate: 1 })
        .lean();

      ssEvents = events.filter(event => {

        return event.classEvents?.some(cls =>
          cls.className === classFull
        );

      });

      /* EXAMS */

      const exams = await SundayExam.find({
        examDate: { $gte: startOfToday }
      })
        .populate("examBy", "name")
        .sort({ examDate: 1 })
        .lean();

      ssExams = exams.filter(exam => {

        const classMatch = exam.classExams?.some(
          cls => cls.className === classFull
        );

        const studentMatch = exam.classExams?.some(cls =>
          cls.participants?.some(p => p.member_id === memberId)
        );

        const teacherMatch = exam.teacherDetails?.some(
          t => t.teacherId === memberId
        );

        return classMatch || studentMatch || teacherMatch;

      });

    }



    /* =====================================================
       WOMEN EVENTS
    ===================================================== */

    let womenEvents = [];

    if (member.gender === "Female" && member.status === "Active") {

      womenEvents = await WomenEvent.find({
        eventDate: { $gte: startOfToday }
      })
        .populate("eventBy", "name")
        .sort({ eventDate: 1 })
        .lean();
    }






    /* =====================================================
     CHOIR EVENTS
  ===================================================== */

    let choirEvents = [];

    const [isChoirMember, isChoirMaster] = await Promise.all([
      ChoirMember.findOne({ member_id: memberId }).lean(),
      ChoirMaster.findOne({ memberId: memberId }).lean()
    ]);

    if (isChoirMember || isChoirMaster) {

      choirEvents = await ChoirEvent.find({
        eventDate: { $gte: startOfToday }
      })
        .populate("eventBy", "name")
        .sort({ eventDate: 1 })
        .lean();
    }



    /* =====================================================
      COUPLE EVENTS
   ===================================================== */

    let coupleEvents = [];

    // Check if member is part of Couples Fellowship
    const coupleMember = await CouplesFellowship.findOne({
      $or: [
        { "husband.member_id": memberId },
        { "wife.member_id": memberId }
      ]
    }).lean();

    if (coupleMember) {

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Show only today's event
      const events = await CoupleEvent.find({
        eventDate: { $gte: startOfToday, $lte: endOfToday }
      })
        .populate("eventBy", "name")
        .sort({ eventDate: 1 })
        .lean();

      coupleEvents = events.map(event => {

        let participantData = null;

        event.coupleCompetitions?.forEach(comp => {
          comp.participants?.forEach(p => {
            if (
              p.husband_id === memberId ||
              p.wife_id === memberId
            ) {
              participantData = {
                competition: comp.competition,
                title: comp.title,
                prize: p.prize
              };
            }
          });
        });

        return {
          ...event,
          participantData
        };

      });

    }


    res.json({
      success: true,
      sundaySchoolEvents: ssEvents,
      sundaySchoolExams: ssExams,
      womenEvents,
      choirEvents,
      coupleEvents

    });

  } catch (error) {

    console.error("Dashboard upcoming error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};





exports.getNotifications = async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notifications = await Notification.find({
      status: "Active"
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const filtered = notifications
      .map(n => {

        const validItems = n.items.filter(item => {

          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);

          return today <= itemDate; // ✅ show until that date
        });

        if (validItems.length === 0) return null;

        return {
          _id: n._id,
          heading: n.heading,
          items: validItems
        };

      })
      .filter(Boolean);

    res.json({
      success: true,
      notifications: filtered
    });

  } catch (error) {

    console.error("Notification fetch error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};