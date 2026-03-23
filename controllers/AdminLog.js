const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Schema/adminlogSchema');
const Member = require('../Schema/memberSchema'); // to check member_id + primary_email
const Pastor = require("../Schema/pastorSchema")
const nodemailer = require("nodemailer");
const { sendSMS } = require("../util/sms");
// const { v4: uuidv4 } = require("uuid");

const otpStore = {};
const loginOtpStore = {};

//created at 15/09/2025 at 11.02AM without sms
// exports.signupRequest = async (req, res) => {
//   try {
//     const { member_id } = req.body;

//     // 1. Find member in Member OR Pastor collection
//     let member = await Member.findOne({ member_id });
//     if (!member) {
//       member = await Pastor.findOne({ member_id });
//     }
//     if (!member) return res.status(404).json({ message: "Member/Pastor not found" });

//     // 2. Check if user already exists
//     const existingUser = await User.findOne({ member_id });

//     if (existingUser) {
//       if (existingUser.isPreCreated || !existingUser.password) {
//         // continue → send OTP
//       } else {
//         return res.status(400).json({ message: "User already exists, please login." });
//       }
//     }

//     // 3. Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = Date.now() + 3 * 60 * 1000;
//     otpStore[member_id] = { otp, expiresAt };

//     // 4. Send OTP primary_email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: member.primary_email,
//       subject: "Church Management - Signup OTP",
//       text: `Hello ${member.member_name},\n\nYour OTP is: ${otp}\n\nThis OTP will expire in 3 minutes.`,
//     });

//     return res.json({ primary_email: member.primary_email });
//   } catch (err) {
//     console.error("❌ Signup request error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

exports.checkMember = async (req, res) => {

  try {

    const { member_id, mode } = req.body;

    let member = await Member.findOne({ member_id });

    if (!member)
      member = await Pastor.findOne({ member_id });

    if (!member)
      return res.status(404).json({
        message: "Member/Pastor not found"
      });

    const existingUser = await User.findOne({ member_id });

    // 🚫 Block ONLY for Signup
    if (mode !== "forgot") {

      if (existingUser && existingUser.password) {

        return res.status(400).json({
          message: "User already exists, please login."
        });

      }

    }

    const targetEmail = member.primary_email;

    if (!targetEmail)
      return res.status(400).json({
        message: "Primary Email not registered"
      });

    return res.json({
      email: targetEmail,
      member_name: member.member_name
    });

  } catch (err) {

    console.error("Check member error:", err);

    return res.status(500).json({
      message: "Server error"
    });

  }

};

//created at 13/01/2026 at 11.57AM with sms and primary_email
exports.signupRequest = async (req, res) => {
  try {
    const { member_id, mode } = req.body;

    // 1. Find member in Member OR Pastor collection
    let member = await Member.findOne({ member_id });
    if (!member) member = await Pastor.findOne({ member_id });
    if (!member) return res.status(404).json({ message: "Member/Pastor not found" });

    // 2. Check if user already exists
    const existingUser = await User.findOne({ member_id });



    if (mode !== "forgot") {

      if (existingUser) {
        if (!(existingUser.isPreCreated || !existingUser.password)) {
          return res.status(400).json({
            message: "User already exists, please login."
          });
        }
      }

    }

    // 🔥 Detect treasurer role
    const isTreasurer = existingUser?.roles?.includes("treasurer");

    // 3. Generate OTP (unchanged)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000;
    otpStore[member_id] = { otp, expiresAt };

    //Once you go live, REMOVE this line.
    console.log("DEV OTP for", member_id, "=>", otp);

    // ================= TREASURER → SMS OTP =================
    if (isTreasurer) {
      if (!member.primary_contact_number)
        return res.status(400).json({ message: "Primary contact number not registered." });

      let mobile = member.primary_contact_number.trim();

      if (!mobile.startsWith("+")) {
        mobile = "+91" + mobile;
      }

      await sendSMS(mobile, otp);


      return res.json({
        mode: "mobile",
        mobile: member.primary_contact_number.replace(/\d(?=\d{2})/g, "*"),
      });
    }
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
    // ================= EXISTING EMAIL OTP FLOW =================
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   },
    //   tls: {
    //     rejectUnauthorized: false
    //   }
    // });
    const transporter = nodemailer.createTransport({
  host: "node2.grabersites.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
    // Use PRIMARY EMAIL first
    const targetEmail = member.primary_email;

    if (!targetEmail)
      return res.status(400).json({
        message: "Primary Email not registered"
      });

    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: targetEmail,
    //   subject: "Church Management - Signup OTP",
    //   text: `Hello ${member.member_name},\n\nYour OTP is: ${otp}\n\nThis OTP will expire in 3 minutes.`,
    // });

    await transporter.sendMail({
      from: `"CSI Christ Church" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: "CSI Christ Church - OTP Verification",
      text: `Dear ${member.member_name},

Your One Time Password (OTP) for the CSI Christ Church Portal is:

${otp}

This OTP will expire in 3 minutes.

If you did not request this OTP, please ignore this email.

Blessings,
CSI Christ Church
Coimbatore`
    });

    return res.json({
      mode: "email",
      email: targetEmail
    });

  } catch (err) {
    console.error("❌ Signup request error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// -------------------- VERIFY OTP & CREATE USER --------------------
exports.verifyOtp = async (req, res) => {
  try {
    const { member_id, otp } = req.body;

    const stored = otpStore[member_id];
    if (!stored) return res.status(400).json({ message: "No OTP found, please request again." });

    if (Date.now() > stored.expiresAt) {
      delete otpStore[member_id];
      return res.status(400).json({ message: "OTP expired, please request again." });
    }

    if (stored.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // OTP verified, allow frontend to enable password
    delete otpStore[member_id];
    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.completeSignup = async (req, res) => {
  try {
    const { member_id, password } = req.body;

    // 1️⃣ Check if member or pastor exists
    let member = await Member.findOne({ member_id });
    if (!member) member = await Pastor.findOne({ member_id });
    if (!member) {
      return res.status(404).json({ message: "Member/Pastor not found" });
    }

    // 2️⃣ Check if user already exists
    let user = await User.findOne({ member_id });

    if (user) {
      if (user.isPreCreated || !user.password) {
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        const targetEmail = member.primary_email;

        if (!targetEmail) {
          return res.status(400).json({
            message: "Primary Email not registered"
          });
        }

        user.password = hashedPassword;
        user.email = targetEmail;   // ⭐ ADD THIS
        user.isPreCreated = false;

        await user.save();

        return res
          .status(200)
          .json({ message: "Signup completed successfully. You can login now." });
      } else {
        return res
          .status(400)
          .json({ message: "User already exists, please login." });
      }
    }

    // 3️⃣ Create new user account
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use PRIMARY EMAIL first
    const targetEmail = member.primary_email;

    if (!targetEmail) {
      return res.status(400).json({
        message: "Primary Email not registered"
      });
    }

    const newUser = new User({
      member_id,
      member_name: member.member_name,
      email: targetEmail,
      password: hashedPassword,
      roles: ["member"],
      isPreCreated: false,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "Signup completed successfully. You can login now." });
  } catch (err) {
    console.error("❌ Complete signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//login common for all 
// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     console.log("🟢 Login attempt:", username, password);

//     const user = await User.findOne({
//       member_id: { $regex: `^${username}$`, $options: "i" },
//     });

//     if (!user) {
//       console.log("🔴 No user found with member_id:", username);
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     console.log("🟢 User found:", user.member_id);
//     console.log("🧂 Stored password (hashed):", user.password);

//     if (!user.password) {
//       console.log("⚠️ User has no password set");
//       return res.status(401).json({ message: "User has not set a password yet." });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("🧩 Password match result:", isMatch);

//     if (!isMatch) {
//       console.log("❌ Incorrect password for:", user.member_id);
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { userId: user._id, member_id: user.member_id, roles: user.roles },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     console.log("✅ Login successful for:", user.member_id);
//     return res.json({ message: "Login successful", token, roles: user.roles });
//   } catch (error) {
//     console.error("❌ Login error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

//treasurer login with otp & common for others 12.40 PM 13/01/2026
exports.login = async (req, res) => {
  try {
    const { username, password, otp } = req.body;
    console.log("🟢 Login attempt:", username, password);

    const user = await User.findOne({
      member_id: { $regex: `^${username}$`, $options: "i" },
    });

    if (!user) {
      console.log("🔴 No user found with member_id:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("🟢 User found:", user.member_id);
    console.log("🧂 Stored password (hashed):", user.password);

    if (!user.password) {
      console.log("⚠️ User has no password set");
      return res.status(401).json({ message: "User has not set a password yet." });
    }

    let isMatch = true;

    // Only check password if OTP not provided
    if (!otp) {

      if (!password)
        return res.status(400).json({
          message: "Password required"
        });

      isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {

        return res.status(401).json({
          message: "Wrong password",
          memberExists: true
        });

      }

    }
    console.log("🧩 Password match result:", isMatch);

    if (!isMatch) {

      console.log("❌ Incorrect password for:", user.member_id);

      return res.status(401).json({
        message: "Wrong password",
        memberExists: true
      });

    }

    // ================= TREASURER OTP LAYER =================

    if (user.roles.includes("treasurer")) {

      if (!otp) {

        let member =
          await Member.findOne({ member_id: user.member_id }) ||
          await Pastor.findOne({ member_id: user.member_id });

        const targetEmail = member.primary_email;

        if (!targetEmail)
          return res.status(400).json({
            message: "Primary Email not registered"
          });

        const otpCode =
          Math.floor(100000 + Math.random() * 900000).toString();

        loginOtpStore[user.member_id] = {
          otp: otpCode,
          expiresAt: Date.now() + 3 * 60 * 1000
        };

        console.log("LOGIN EMAIL OTP:", otpCode);

const transporter = nodemailer.createTransport({
  host: "node2.grabersites.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

        await transporter.sendMail({

          from: process.env.EMAIL_USER,

          to: targetEmail,

          subject: "Church Login OTP",

          text: `Your Login OTP is ${otpCode}. Valid for 3 minutes.`

        });

        return res.json({

          step: "OTP_REQUIRED",

          email: targetEmail,

          member_name: user.member_name

        });

      }

      // OTP VERIFY

      const record =
        loginOtpStore[user.member_id];

      if (!record || Date.now() > record.expiresAt)
        return res.status(400).json({
          message: "OTP expired. Please login again."
        });

      if (record.otp !== otp)
        return res.status(400).json({
          message: "Invalid OTP"
        });

      delete loginOtpStore[user.member_id];

    }

    // if (user.roles.includes("treasurer")) {

    //   // STEP-1: Password ok but OTP not provided → Send OTP
    //   if (!otp) {
    //     let member = await Member.findOne({ member_id: user.member_id }) || await Pastor.findOne({ member_id: user.member_id });

    //     if (!member?.primary_contact_number) {
    //       return res.status(400).json({ message: "Primary contact number missing." });
    //     }

    //     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    //     loginOtpStore[user.member_id] = {
    //       otp: otpCode,
    //       expiresAt: Date.now() + 3 * 60 * 1000
    //     };

    //     console.log("🔐 LOGIN OTP for", user.member_id, "=>", otpCode);

    //     let mobile = member.primary_contact_number.replace(/\D/g, "");
    //     if (!mobile.startsWith("91")) mobile = "91" + mobile;
    //     mobile = "+" + mobile;

    //     await sendSMS(mobile, otpCode);

    //     return res.json({
    //       step: "OTP_REQUIRED",
    //       mobile: member.primary_contact_number.replace(/\d(?=\d{2})/g, "*")
    //     });
    //   }

    //   // STEP-2: Verify OTP
    //   const record = loginOtpStore[user.member_id];
    //   if (!record || Date.now() > record.expiresAt)
    //     return res.status(400).json({ message: "OTP expired. Please login again." });

    //   if (record.otp !== otp)
    //     return res.status(400).json({ message: "Invalid OTP" });

    //   delete loginOtpStore[user.member_id];
    // }
    // ================= END TREASURER OTP LAYER =================

    //     if (user.isLoggedIn && user.currentSessionId) {
    //   return res.status(403).json({
    //     message: "This account is already logged in on another browser/device"
    //   });
    // }
    // const sessionId = uuidv4();

    // user.isLoggedIn = true;
    // user.currentSessionId = sessionId;
    // await user.save();


    const token = jwt.sign(
      { userId: user._id, member_id: user.member_id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login successful for:", user.member_id);
    return res.json({ message: "Login successful", token, roles: user.roles });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//with pagination and the search
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};

    // 🔍 Search by member_name OR roles
    if (search) {
      query.$or = [
        { member_name: { $regex: search, $options: "i" } },
        { roles: { $elemMatch: { $regex: search, $options: "i" } } }
      ];
    }

    query.roles = { $ne: ["member"] };

    // Fetch users with pagination (excluding password)
    const users = await User.find(query, "-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Attach member_name from Member collection if missing
    const usersWithNames = await Promise.all(
      users.map(async (u) => {
        if (!u.member_name) {
          const member = await Member.findOne(
            { member_id: u.member_id },
            "member_name"
          );
          return {
            ...u,
            member_name: member ? member.member_name : null,
          };
        }
        return u;
      })
    );

    // Total count for pagination
    const totalUsers = await User.countDocuments(query);

    res.json({
      users: usersWithNames,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("❌ Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- UPDATE USER ROLE --------------------
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, roles } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { roles },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Roles updated successfully", user });
  } catch (err) {
    console.error("❌ Update user role error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//created on 15/09/2025 at 9.44 AM to create user including the pastor also
exports.createUserByAdmin = async (req, res) => {
  try {
    const { member_id, roles } = req.body;

    // ✅ Validate input
    if (!member_id) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    // ✅ Try finding in Member collection
    let person = await Member.findOne({ member_id });

    // ✅ If not found, try Pastor collection
    if (!person) {
      person = await Pastor.findOne({ member_id });
    }

    if (!person) {
      return res.status(404).json({ message: "Member/Pastor not found" });
    }

let existingUser = await User.findOne({ member_id });

if (existingUser) {

  // ✅ Merge roles (avoid duplicates)
  const newRoles = Array.from(
    new Set([
      ...(existingUser.roles || []),
      ...(roles || []),
      "member" // always ensure member exists
    ])
  );

  existingUser.roles = newRoles;

  await existingUser.save();

  return res.status(200).json({
    message: "Roles updated successfully",
    user: existingUser
  });
}

    // ✅ Always include "member" role
    const assignedRoles = Array.from(new Set(["member", ...(roles || [])]));

    // ✅ Create user entry (no password yet → signup will set it)
    const newUser = new User({
      member_id: person.member_id,
      email: person.primary_email || "",
      member_name: person.member_name,
      roles: assignedRoles,
      isPreCreated: true,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully by admin",
      user: {
        _id: newUser._id,
        member_id: newUser.member_id,
        member_name: newUser.member_name,
        email: newUser.email,
        roles: newUser.roles,
        isPreCreated: newUser.isPreCreated,
      },
    });
  } catch (err) {
    console.error("❌ createUserByAdmin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCemeteryManagers = async (req, res) => {
  try {
    const managers = await User.find(
      { roles: "cemeterymanager" },
      "-password"
    ).lean();

    res.json(managers);
  } catch (err) {
    console.error("❌ Error fetching cemetery managers:", err);
    res.status(500).json({ message: "Server error" });
  }
};






// -------------------- FORGOT PASSWORD RESET --------------------
exports.resetPassword = async (req, res) => {

  try {

    const { member_id, password } = req.body;

    const user = await User.findOne({ member_id });

    if (!user)
      return res.status(404).json({
        message: "User not found"
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    return res.json({
      message: "Password updated successfully"
    });

  } catch (err) {

    console.error("Reset password error:", err);

    return res.status(500).json({
      message: "Server error"
    });

  }

};

