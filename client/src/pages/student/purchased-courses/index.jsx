import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPurchasedCoursesService } from "../../../services";
import { PlayCircle, BookOpen } from "lucide-react";

function CourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/student/courses/${course.courseId}/watch`)}
      className="border border-border rounded-lg overflow-hidden cursor-pointer hover:border-muted-foreground transition-colors group"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted overflow-hidden relative">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No preview
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <PlayCircle size={40} style={{ color: "#e8a020" }} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {course.instructorName}
        </p>
      </div>
    </div>
  );
}

export default function PurchasedCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await getPurchasedCoursesService();
        if (res.data.success) setCourses(res.data.data);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
          My Learning
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Your courses
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center border border-border rounded-lg">
          <BookOpen size={32} className="text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No courses yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Courses you purchase will appear here.
          </p>
          <button
            onClick={() => navigate("/student/home")}
            className="px-4 py-2 text-sm font-semibold rounded-md text-slate-900 bg-[#e8a020]"
          >
            Browse courses
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
        </>
      )}

    </div>
  );
}