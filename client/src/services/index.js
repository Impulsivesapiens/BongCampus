import axiosInstance from "../lib/axiosInstance";

// Auth
export const registerService = (data) => axiosInstance.post("/auth/register", data);
export const loginService = (data) => axiosInstance.post("/auth/login", data);
export const logoutService = () => axiosInstance.post("/auth/logout");
export const checkAuthService = () => axiosInstance.get("/auth/check-auth");

// Student — courses
export const getAllCoursesService = (params) => axiosInstance.get("/student/courses", { params });
export const getCourseDetailsService = (id) => axiosInstance.get(`/student/courses/${id}`);
export const getCourseAccessService = (id) => axiosInstance.get(`/student/courses/${id}/access`);
export const getPurchasedCoursesService = () => axiosInstance.get("/student/courses/purchased");

// Student — orders
export const createOrderService = (data) => axiosInstance.post("/student/order/create", data);
export const verifyPaymentService = (data) => axiosInstance.post("/student/order/verify", data);
export const cancelOrderService = (data) => axiosInstance.post("/student/order/cancel", data);

// Instructor — courses
export const getInstructorCoursesService = () => axiosInstance.get("/instructor/courses");
export const getInstructorCourseService = (id) => axiosInstance.get(`/instructor/courses/${id}`);
export const createCourseService = (data) => axiosInstance.post("/instructor/courses", data);
export const updateCourseService = (id, data) => axiosInstance.put(`/instructor/courses/${id}`, data);
export const deleteCourseService = (id) => axiosInstance.delete(`/instructor/courses/${id}`);
export const togglePublishService = (id) => axiosInstance.put(`/instructor/courses/${id}/publish`);
export const addLectureService = (id, data) => axiosInstance.post(`/instructor/courses/${id}/curriculum`, data);
export const deleteLectureService = (courseId, lectureId) => axiosInstance.delete(`/instructor/courses/${courseId}/curriculum/${lectureId}`);

// Instructor — uploads
export const getUploadSignatureService = () => axiosInstance.post("/instructor/upload/signature");
export const deleteStagedUploadService = (data) => axiosInstance.delete("/instructor/upload", { data });

// Admin
export const getAllUsersService = (params) => axiosInstance.get("/admin/users", { params });
export const updateUserStatusService = (id, data) => axiosInstance.put(`/admin/users/${id}/status`, data);
export const deleteUserService = (id) => axiosInstance.delete(`/admin/users/${id}`);
export const getAllCoursesAdminService = () => axiosInstance.get("/admin/courses");
export const deleteCourseAdminService = (id) => axiosInstance.delete(`/admin/courses/${id}`);
export const getAnalyticsService = () => axiosInstance.get("/admin/analytics");