require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth-routes");
const studentCourseRoutes = require("./routes/student-routes/course-routes");
const studentOrderRoutes = require("./routes/student-routes/order-routes");
const instructorRoutes = require("./routes/instructor-routes");
const adminRoutes = require("./routes/admin-routes");
const errorHandler = require("./middleware/error-middleware");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(mongoSanitize());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/student/courses", studentCourseRoutes);
app.use("/student/order", studentOrderRoutes);
app.use("/instructor", instructorRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});