const { SundaySchoolEvent } = require("../Schema/sundaysclEventSchema");
const SundaySchoolClass = require("../Schema/SundayClass");
const SundayExam = require("../Schema/sundayExamSchema");
const Attendance = require("../Schema/Attendance");

exports.getSundaySchoolDashboard = async (req, res) => {
    try {

        /* --------------------------------
           TOTAL CLASSES
        -------------------------------- */
        const totalClasses = await SundaySchoolClass.countDocuments();

        /* --------------------------------
           TOTAL TEACHERS
           (1 teacher per class)
        -------------------------------- */
        const teacherResult = await SundaySchoolClass.distinct("teacher.member_id");
        const totalTeachers = teacherResult.length;

        /* --------------------------------
           TOTAL STUDENTS
        -------------------------------- */
        const classData = await SundaySchoolClass.find({}, "students");

        let totalStudents = 0;

        classData.forEach(cls => {
            totalStudents += cls.students.length;
        });

        /* --------------------------------
           EVENTS THIS MONTH
        -------------------------------- */
        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const eventsThisMonth = await SundaySchoolEvent.countDocuments({
            eventDate: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });

        /* --------------------------------
           RECENT EXAM
        -------------------------------- */
        const recentExam = await SundayExam
            .findOne()
            .sort({ createdAt: -1 })
            .select("examName examDate examcenter");

        /* --------------------------------
           RECENT EVENT
        -------------------------------- */
        const recentEvent = await SundaySchoolEvent
            .findOne()
            .sort({ createdAt: -1 })
            .select("eventName eventDate venue");

        res.json({
            totalStudents,
            totalClasses,
            totalTeachers,
            eventsThisMonth,
            announcements: {
                exam: recentExam,
                event: recentEvent
            }
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
};



exports.getTeacherDashboard = async (req, res) => {
    try {

        /* ------------------------------
           GET TEACHER ID FROM PARAM
        ------------------------------ */

        const { teacherId } = req.query;

        if (!teacherId || teacherId === "null") {
            return res.status(400).json({
                message: "Invalid teacher id"
            });
        }

        /* ------------------------------
           GET CLASS
        ------------------------------ */

        const teacherClass = await SundaySchoolClass.findOne({
            "teacher.member_id": teacherId
        });

        if (!teacherClass) {
            return res.status(404).json({
                message: "Teacher class not found"
            });
        }

        const totalStudents = teacherClass.students.length;

        /* ------------------------------
           RECENT EVENTS
        ------------------------------ */



        const events = await SundaySchoolEvent.find({
            "classEvents.className": `${teacherClass.class_name} - ${teacherClass.section_name}`
        })
            .sort({ eventDate: -1 })
            .limit(2)
            .select("eventName eventDate venue");

        /* ------------------------------
           RECENT EXAMS
        ------------------------------ */



        const exams = await SundayExam.find({
            "classExams.className": `${teacherClass.class_name} - ${teacherClass.section_name}`
        })
            .sort({ examDate: -1 })
            .limit(2)
            .select("examName examDate examcenter");

        /* ------------------------------
           TODAY ATTENDANCE
        ------------------------------ */


        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            class: teacherClass._id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        let attendanceData = {
            marked: false,
            present: 0,
            absent: 0
        };

        if (attendance) {

            const presentCount = attendance.attendance.filter(
                a => a.present
            ).length;

            attendanceData = {
                marked: true,
                present: presentCount,
                absent: attendance.attendance.length - presentCount
            };

        }
        /* ------------------------------
           RESPONSE
        ------------------------------ */

        res.json({
            class: teacherClass,
            totalStudents,
            events,
            exams,
            attendance: attendanceData
        });

    } catch (error) {

        console.error("Teacher dashboard error:", error);

        res.status(500).json({
            message: "Dashboard error"
        });

    }
};