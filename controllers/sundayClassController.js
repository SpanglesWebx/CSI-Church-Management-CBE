const SundayClass = require("../Schema/SundayClass");
const Member = require("../Schema/memberSchema"); // you already have this

// Create new class
exports.createClass = async (req, res) => {
  try {
    const { teacherId, ...rest } = req.body;

    const teacher = await Member.findOne({ member_id: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }


    // ❗ Prevent duplicate teacher
    const existingClass = await SundayClass.findOne({
      "teacher.member_id": teacherId
    });

    if (existingClass) {
      return res.status(400).json({
        message: "Teacher already assigned to another class"
      });
    }

    const newClass = new SundayClass({
      ...rest,
      teacher: {
        member_id: teacher.member_id,
        name: teacher.member_name,
        tamil_name: teacher.member_tamil_name,
      },
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get all classes
// Get classes with filters & pagination
exports.getClasses = async (req, res) => {
  try {
    const {
      search = "",           // text search over class/section/teacher
      from = "",             // ISO date
      to = "",               // ISO date
      page = 1,
      limit = 10,
    } = req.query;

    const q = {};

    // text search across class_name, section_name, teacher fields
    if (search) {
      q.$or = [
        { class_name: { $regex: search, $options: "i" } },
        { section_name: { $regex: search, $options: "i" } },
        { "teacher.name": { $regex: search, $options: "i" } },
        { "teacher.member_id": { $regex: search, $options: "i" } },
      ];
    }

    // date range (overlap) on year_from/year_to
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date("1900-01-01");
      const toDate = to ? new Date(to) : new Date("2999-12-31");
      // overlap condition: not (class ends before from OR starts after to)
      q.$and = [
        { year_to: { $gte: fromDate } },
        { year_from: { $lte: toDate } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * perPage;

    const [items, totalCount] = await Promise.all([
      SundayClass.find(q).sort({ createdAt: -1 }).skip(skip).limit(perPage),
      SundayClass.countDocuments(q)
    ]);

    res.json({
      classes: items,
      page: pageNum,
      totalPages: Math.ceil(totalCount / perPage),
      totalCount
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: error.message });
  }
};


// Delete class
exports.deleteClass = async (req, res) => {
  try {
    await SundayClass.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers with their classes
exports.getTeachersWithClasses = async (req, res) => {
  try {
    const classes = await SundayClass.find();
    const teachers = classes.map(c => ({
      class_name: c.class_name,
      section_name: c.section_name,
      teacher: c.teacher,
    }));
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers with their classes and phone numbers

exports.getTeachersWithDetails = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetch classes (for teacher linkage)
    const classes = await SundayClass.find();

    // Map teacher details
    const results = await Promise.all(
      classes.map(async (c) => {
        if (!c.teacher?.member_id) return null;

        const teacherMember = await Member.findOne(
          { member_id: c.teacher.member_id },
          "member_id member_name member_tamil_name primary_contact_number"
        );

        return {
          teacher_id: teacherMember?.member_id,
          teacher_name: teacherMember?.member_name,
          teacher_tamil_name: teacherMember?.member_tamil_name,
          mobile_number: teacherMember?.primary_contact_number,
          class_name: c.class_name,
          section_name: c.section_name,
          class_id: c._id,
        };
      })
    );

    // Clean nulls
    let teachers = results.filter(Boolean);

    // ✅ Apply search
    if (search) {
      const regex = new RegExp(search, "i");
      teachers = teachers.filter(
        (t) =>
          regex.test(t.teacher_name) ||
          regex.test(t.teacher_tamil_name) ||
          regex.test(t.teacher_id) ||
          regex.test(t.mobile_number) ||
          regex.test(t.class_name) ||
          regex.test(t.section_name)
      );
    }

    // ✅ Pagination
    const total = teachers.length;
    const startIndex = (page - 1) * limit;
    const paginated = teachers.slice(startIndex, startIndex + limit);

    res.json({
      teachers: paginated,
      totalPages: Math.ceil(total / limit),
      total,
      page,
    });
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    res.status(500).json({ message: error.message });
  }
};



// Update Sunday Class
exports.updateSundayClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId, ...rest } = req.body;

    let teacherData = null;

    if (teacherId) {
      // fetch teacher details from Members
      const teacher = await Member.findOne({ member_id: teacherId });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }


      // ❗ Prevent duplicate teacher
      const existingClass = await SundayClass.findOne({
        "teacher.member_id": teacherId,
        _id: { $ne: id }
      });

      if (existingClass) {
        return res.status(400).json({
          message: "Teacher already assigned to another class"
        });
      }

      teacherData = {
        member_id: teacher.member_id,
        name: teacher.member_name,
        tamil_name: teacher.member_tamil_name,
      };
    }

    const updatedClass = await SundayClass.findByIdAndUpdate(
      id,
      {
        ...rest,
        ...(teacherData ? { teacher: teacherData } : {}), // only update if teacherId provided
      },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




exports.getEligibleStudents = async (req, res) => {
  try {

    const { page = 1, limit = 25, search = "" } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const classData = await SundayClass.findById(req.params.classId);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Find all sections of same class
    const sameClassNameClasses = await SundayClass.find(
      { class_name: classData.class_name },
      "students.member_id"
    );

    const alreadyEnrolledIds = sameClassNameClasses.flatMap((c) =>
      c.students.map((s) => s.member_id)
    );

    const fromYear = new Date(classData.year_from);
    const toYear = new Date(classData.year_to);

    // Base query
    const query = {
      member_id: { $nin: alreadyEnrolledIds },
      status: "Active"
    };

    // Search filter
    if (search) {
      query.$or = [
        { member_name: { $regex: search, $options: "i" } },
        { member_id: { $regex: search, $options: "i" } }
      ];
    }

    const members = await Member.find(query)
      .select("member_id member_name dob")
      .lean();

    // DOB filter
    const eligible = members.filter((m) => {

      if (!m.dob) return false;

      const dobDate = new Date(m.dob);

      return dobDate >= fromYear && dobDate <= toYear;

    });

    // Pagination
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = pageNumber * limitNumber;

    const paginated = eligible.slice(startIndex, endIndex);

    const totalPages = Math.ceil(eligible.length / limitNumber);

    res.json({
      data: paginated,
      totalPages,
      currentPage: pageNumber,
      total: eligible.length
    });

  } catch (err) {
    console.error("Error fetching eligible students:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.addStudentsToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { students } = req.body;

    const classData = await SundayClass.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    classData.students = students.map((s) => ({
      member_id: s.member_id,
      member_name: s.member_name,
      date_of_birth: s.date_of_birth || s.dob || null,
      parent_name: s.parent_name || "",
      address: s.address || ""
    }));

    await classData.save();

    res.json({
      message: "Students updated successfully",
      class: classData
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getClassWithStudents = async (req, res) => {
  try {
    const classData = await SundayClass.findById(req.params.classId);
    if (!classData) return res.status(404).json({ message: "Class not found" });
    res.json(classData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ➤ Get all students for classes taught by a teacher
exports.getStudentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Find all classes taught by this teacher
    const classes = await SundayClass.find({ "teacher.member_id": teacherId });

    // Collect all students with class info
    const students = classes.flatMap((cls) =>
      (cls.students || []).map((s) => ({
        ...s.toObject(),
        class_id: cls._id,
        class_name: cls.class_name,
        section_name: cls.section_name,
      }))
    );

    res.json({ students });
  } catch (err) {
    console.error("Error fetching teacher's students:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEventClassGroups = async (req, res) => {
  try {
    const classes = await SundayClass.find().select("class_name");

    // Extract unique base names before hyphen (like "Primary", "Junior")
    const classGroups = [...new Set(
      classes.map(c => c.class_name.split("-")[0].trim())
    )];

    res.json(classGroups);
  } catch (err) {
    console.error("Error fetching event class groups:", err);
    res.status(500).json({ message: "Failed to fetch class groups" });
  }
};