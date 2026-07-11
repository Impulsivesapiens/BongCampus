const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerUser = async (req, res) => {
  const { userName, userEmail, password, role } = req.body;

  // check for duplicates
  const existingUser = await User.findOne({
    $or: [{ userEmail }, { userName }],
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message:
        existingUser.userEmail === userEmail
          ? "Email already in use"
          : "Username already taken",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const isInstructor = role === "instructor";

  const newUser = new User({
    userName,
    userEmail,
    password: hashedPassword,
    role: isInstructor ? "instructor" : "user",
    status: isInstructor ? "pending" : "active",
  });

  await newUser.save();

  if (isInstructor) {
    return res.status(201).json({
      success: true,
      message:
        "Instructor account created. Please wait for admin approval before logging in.",
    });
  }

  // auto-login for students
  const token = jwt.sign(
    {
      id: newUser._id,
      userName: newUser.userName,
      userEmail: newUser.userEmail,
      role: newUser.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, cookieOptions);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    user: {
      id: newUser._id,
      userName: newUser.userName,
      userEmail: newUser.userEmail,
      role: newUser.role,
    },
  });
};

const loginUser = async (req, res) => {
  const { userEmail, password } = req.body;

  const user = await User.findOne({ userEmail });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No account found with this email",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password",
    });
  }

  if (user.status === "pending") {
    return res.status(403).json({
      success: false,
      message: "Your instructor account is pending admin approval",
    });
  }

  if (user.status === "suspended") {
    return res.status(403).json({
      success: false,
      message: "Your account has been suspended. Contact support.",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
    },
  });
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const checkAuth = async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    success: true,
    user,
  });
};

module.exports = { registerUser, loginUser, logoutUser, checkAuth };