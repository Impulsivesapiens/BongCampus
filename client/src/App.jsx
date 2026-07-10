import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { ProtectedRoute, PublicRoute, RoleRoute } from "./components/common/route-guard";

// pages — we'll create these as we build
import AuthPage from "./pages/auth";
import LandingPage from "./pages/landing";
import StudentHome from "./pages/student/home";
import StudentCourses from "./pages/student/courses";
import CourseDetails from "./pages/student/course-details";
import PaymentPage from "./pages/student/payment";
import PurchasedCourses from "./pages/student/purchased-courses";
import CourseWatch from "./pages/student/course-watch";
import InstructorDashboard from "./pages/instructor/dashboard";
import CourseEditor from "./pages/instructor/course-editor";
import NotApproved from "./pages/instructor/not-approved";
import AdminUsers from "./pages/admin/users";
import AdminCourses from "./pages/admin/courses";
import AdminAnalytics from "./pages/admin/analytics";
import NotFound from "./pages/not-found";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* public */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

          {/* student */}
          <Route path="/student/home" element={<ProtectedRoute><RoleRoute allowedRole="user"><StudentHome /></RoleRoute></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute><RoleRoute allowedRole="user"><StudentCourses /></RoleRoute></ProtectedRoute>} />
          <Route path="/student/courses/:id" element={<ProtectedRoute><RoleRoute allowedRole="user"><CourseDetails /></RoleRoute></ProtectedRoute>} />
          <Route path="/student/payment" element={<ProtectedRoute><RoleRoute allowedRole="user"><PaymentPage /></RoleRoute></ProtectedRoute>} />
          <Route path="/student/courses/purchased" element={<ProtectedRoute><RoleRoute allowedRole="user"><PurchasedCourses /></RoleRoute></ProtectedRoute>} />
          <Route path="/student/courses/:id/watch" element={<ProtectedRoute><RoleRoute allowedRole="user"><CourseWatch /></RoleRoute></ProtectedRoute>} />

          {/* instructor */}
          <Route path="/instructor/dashboard" element={<ProtectedRoute><RoleRoute allowedRole="instructor"><InstructorDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/instructor/courses/create" element={<ProtectedRoute><RoleRoute allowedRole="instructor"><CourseEditor /></RoleRoute></ProtectedRoute>} />
          <Route path="/instructor/courses/:id" element={<ProtectedRoute><RoleRoute allowedRole="instructor"><CourseEditor /></RoleRoute></ProtectedRoute>} />
          <Route path="/instructor/not-approved" element={<NotApproved />} />

          {/* admin */}
          <Route path="/admin/users" element={<ProtectedRoute><RoleRoute allowedRole="admin"><AdminUsers /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute><RoleRoute allowedRole="admin"><AdminCourses /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><RoleRoute allowedRole="admin"><AdminAnalytics /></RoleRoute></ProtectedRoute>} />

          {/* fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;