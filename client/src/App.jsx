import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { ProtectedRoute, PublicRoute, RoleRoute } from "./components/common/route-guard";
import AppLayout from "./components/common/app-layout";

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
          {/* public — no navbar */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/instructor/not-approved" element={<NotApproved />} />

          {/* student */}
          <Route path="/student/home" element={
            <ProtectedRoute><RoleRoute allowedRole="user">
              <AppLayout><StudentHome /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/student/courses" element={
            <ProtectedRoute><RoleRoute allowedRole="user">
              <AppLayout><StudentCourses /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/student/courses/purchased" element={
            <ProtectedRoute><RoleRoute allowedRole="user">
              <AppLayout><PurchasedCourses /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/student/courses/:id" element={
            <ProtectedRoute><RoleRoute allowedRole="user">
              <AppLayout><CourseDetails /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/student/payment" element={
            <ProtectedRoute><RoleRoute allowedRole="user">
              <AppLayout><PaymentPage /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/student/courses/:id/watch" element={
            <ProtectedRoute><RoleRoute allowedRole="user">
              <AppLayout><CourseWatch /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />

          {/* instructor */}
          <Route path="/instructor/dashboard" element={
            <ProtectedRoute><RoleRoute allowedRole="instructor">
              <AppLayout><InstructorDashboard /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/instructor/courses/create" element={
            <ProtectedRoute><RoleRoute allowedRole="instructor">
              <AppLayout><CourseEditor /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/instructor/courses/:id" element={
            <ProtectedRoute><RoleRoute allowedRole="instructor">
              <AppLayout><CourseEditor /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />

          {/* admin */}
          <Route path="/admin/users" element={
            <ProtectedRoute><RoleRoute allowedRole="admin">
              <AppLayout><AdminUsers /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute><RoleRoute allowedRole="admin">
              <AppLayout><AdminCourses /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute><RoleRoute allowedRole="admin">
              <AppLayout><AdminAnalytics /></AppLayout>
            </RoleRoute></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;