import { useEffect, useState } from "react";
import {
  getAllCoursesAdminService,
  deleteCourseAdminService,
} from "../../../services";
import { Trash2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

function CourseRow({ course, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await deleteCourseAdminService(course._id);
      if (res.data.success) {
        toast.success("Course deleted");
        onDelete(course._id);
      }
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">

      {/* Thumbnail */}
      <div className="w-20 aspect-video bg-muted rounded overflow-hidden shrink-0">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={14} className="text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-foreground truncate">{course.title}</p>
          <span className={[
            "shrink-0 text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border",
            course.isPublished
              ? "border-[#e8a020] text-[#e8a020]"
              : "border-border text-muted-foreground",
          ].join(" ")}>
            {course.isPublished ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{course.instructorName}</span>
          <span>{course.category}</span>
          <span className="capitalize">{course.level}</span>
          <span>₹{course.pricing}</span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
      >
        <Trash2 size={14} />
      </button>

    </div>
  );
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await getAllCoursesAdminService();
        if (res.data.success) setCourses(res.data.data);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = (id) =>
    setCourses((prev) => prev.filter((c) => c._id !== id));

  const published = courses.filter((c) => c.isPublished).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Admin
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Courses</h1>
          <span className="text-xs text-muted-foreground">
            {published} published · {courses.length - published} draft
          </span>
        </div>
      </div>

      {loading ? (
        <div className="border border-border rounded-lg overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0 animate-pulse">
              <div className="w-20 aspect-video bg-muted rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-border rounded-lg">
          <BookOpen size={28} className="text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No courses found</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          {courses.map((course) => (
            <CourseRow
              key={course._id}
              course={course}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}