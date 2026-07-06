require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("express-async-errors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth-routes");
const studentCourseRoutes = require("./routes/student-routes/course-routes");
const studentOrderRoutes = require("./routes/student-routes/order-routes");
const errorHandler = require("./middleware/error-middleware");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/student/courses", studentCourseRoutes);
app.use("/student/order", studentOrderRoutes);
// more routes will be added here as we build them

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});