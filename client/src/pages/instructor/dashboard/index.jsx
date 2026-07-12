import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInstructorCoursesService,
  deleteCourseService,
  togglePublishService,
} from "../../../services";
import { Plus, Pencil, Trash2, Eye, EyeOff, Users, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

function CourseRow({ course, onDelete, onTogglePublish }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await deleteCourseService(course._id);
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

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await togglePublishService(course._id);
      if (res.data.success) {
        toast.success(course.isPublished ? "Course unpublished" : "Course published");
        onTogglePublish(course._id, res.data.data.isPublished);
      }
    } catch {
      toast.error("Failed to update publish status");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">

      {/* Thumbnail */}
      <div className="w-24 aspect-video bg-muted rounded overflow-hidden shrink-0">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={16} className="text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{course.title}</h3>
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
          <span className="flex items-center gap-1">
            <Users size={11} />
            {course.students?.length ?? 0} enrolled
          </span>
          <span>{course.category}</span>
          <span className="capitalize">{course.level}</span>
          <span>₹{course.pricing}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={course.isPublished ? "Unpublish" : "Publish"}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {course.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button
          onClick={() => navigate(`/instructor/courses/${course._id}`)}
          title="Edit"
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete"
          className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>

    </div>
  );
}

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await getInstructorCoursesService();
        if (res.data.success) setCourses(res.data.data);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = (id) => setCourses((prev) => prev.filter((c) => c._id !== id));
  const handleTogglePublish = (id, isPublished) =>
    setCourses((prev) => prev.map((c) => c._id === id ? { ...c, isPublished } : c));

  const totalStudents = courses.reduce((sum, c) => sum + (c.students?.length ?? 0), 0);
  const published = courses.filter((c) => c.isPublished).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Instructor
          </p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        </div>
        <button
          onClick={() => navigate("/instructor/courses/create")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-slate-900 bg-[#e8a020] hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          New course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden mb-8">
        {[
          { label: "Total courses", value: courses.length },
          { label: "Published", value: published },
          { label: "Students enrolled", value: totalStudents },
        ].map((stat, i) => (
          <div key={i} className="px-6 py-5 border-r border-border last:border-r-0">
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Course list */}
      {loading ? (
        <div className="border border-border rounded-lg overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0 animate-pulse">
              <div className="w-24 aspect-video bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-border rounded-lg text-center">
          <BookOpen size={32} className="text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No courses yet</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first course to get started.</p>
          <button
            onClick={() => navigate("/instructor/courses/create")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-slate-900 bg-[#e8a020]"
          >
            <Plus size={15} />
            New course
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          {courses.map((course) => (
            <CourseRow
              key={course._id}
              course={course}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}

    </div>
  );
}