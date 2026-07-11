import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseAccessService } from "../../../services";
import { CheckCircle, Circle, ChevronLeft, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export default function CourseWatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [completed, setCompleted] = useState({}); // { lectureId: true }
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await getCourseAccessService(id);
        if (res.data.success) {
          const data = res.data.data;
          setCourse(data);
          // auto-select first lecture
          if (data.curriculum?.length > 0) {
            setCurrentLecture(data.curriculum[0]);
          }
        }
      } catch (err) {
        if (err.response?.status === 403) {
          toast.error("You have not purchased this course.");
          navigate(`/student/courses/${id}`, { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  const toggleCompleted = (lectureId) => {
    setCompleted((prev) => ({ ...prev, [lectureId]: !prev[lectureId] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalLectures = course?.curriculum?.length ?? 0;
  const progressPct = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] animate-pulse">
        <div className="flex-1 bg-muted" />
        <div className="w-72 border-l border-border bg-background" />
      </div>
    );
  }

  if (!course) return null;

  const Sidebar = () => (
    <div className="flex flex-col h-full">

      {/* Course title + progress */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
          Course content
        </p>
        <h2 className="text-sm font-semibold text-foreground leading-snug mb-3">
          {course.title}
        </h2>
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: "#e8a020" }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {completedCount}/{totalLectures}
          </span>
        </div>
      </div>

      {/* Lecture list */}
      <div className="flex-1 overflow-y-auto">
        {course.curriculum.map((lecture, idx) => (
          <div
            key={lecture._id}
            onClick={() => {
              setCurrentLecture(lecture);
              setSidebarOpen(false);
            }}
            className={[
              "flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border/50 transition-colors",
              currentLecture?._id === lecture._id
                ? "bg-muted"
                : "hover:bg-muted/60",
            ].join(" ")}
          >
            {/* Complete toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCompleted(lecture._id);
              }}
              className="mt-0.5 shrink-0"
            >
              {completed[lecture._id] ? (
                <CheckCircle size={15} style={{ color: "#e8a020" }} />
              ) : (
                <Circle size={15} className="text-muted-foreground" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                {String(idx + 1).padStart(2, "0")}
              </p>
              <p className={[
                "text-sm leading-snug",
                currentLecture?._id === lecture._id
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              ].join(" ")}>
                {lecture.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <button
            onClick={() => navigate(`/student/courses/${id}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={14} />
            Back to details
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={14} />
            Curriculum
          </button>
        </div>

        {/* Video player */}
        <div className="bg-black w-full aspect-video shrink-0">
          {currentLecture?.videoUrl ? (
            <video
              key={currentLecture._id}
              src={currentLecture.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              onEnded={() => toggleCompleted(currentLecture._id)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No video available for this lecture.
            </div>
          )}
        </div>

        {/* Lecture info */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Lecture {course.curriculum.findIndex((l) => l._id === currentLecture?._id) + 1} of {totalLectures}
              </p>
              <h1 className="text-lg font-semibold text-foreground">
                {currentLecture?.title}
              </h1>
            </div>
            <button
              onClick={() => currentLecture && toggleCompleted(currentLecture._id)}
              className={[
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors",
                completed[currentLecture?._id]
                  ? "border-[#e8a020] text-[#e8a020]"
                  : "border-border text-muted-foreground hover:border-muted-foreground",
              ].join(" ")}
            >
              {completed[currentLecture?._id] ? (
                <CheckCircle size={13} />
              ) : (
                <Circle size={13} />
              )}
              {completed[currentLecture?._id] ? "Completed" : "Mark complete"}
            </button>
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center gap-3 mt-6">
            {(() => {
              const idx = course.curriculum.findIndex((l) => l._id === currentLecture?._id);
              const prev = course.curriculum[idx - 1];
              const next = course.curriculum[idx + 1];
              return (
                <>
                  <button
                    disabled={!prev}
                    onClick={() => prev && setCurrentLecture(prev)}
                    className="px-4 py-2 text-sm border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={!next}
                    onClick={() => {
                      if (next) {
                        toggleCompleted(currentLecture._id);
                        setCurrentLecture(next);
                      }
                    }}
                    className="px-4 py-2 text-sm border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next →
                  </button>
                </>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-l border-border shrink-0 overflow-hidden">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-14 right-0 bottom-0 z-50 w-72 bg-background border-l border-border flex flex-col lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Curriculum</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Sidebar />
            </div>
          </aside>
        </>
      )}

    </div>
  );
}