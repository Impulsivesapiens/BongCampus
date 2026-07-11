import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetailsService, getCourseAccessService, createOrderService } from "../../../services";
import {
  Lock,
  PlayCircle,
  Globe,
  BarChart2,
  Tag,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [previewLecture, setPreviewLecture] = useState(null);
  const [curriculumOpen, setCurriculumOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailsRes, accessRes] = await Promise.allSettled([
          getCourseDetailsService(id),
          getCourseAccessService(id),
        ]);

        if (detailsRes.status === "fulfilled" && detailsRes.value.data.success) {
          const data = detailsRes.value.data.data;
          setCourse(data);
          // set first free preview lecture automatically
          const firstFree = data.curriculum?.find((l) => l.freePreview && l.videoUrl);
          if (firstFree) setPreviewLecture(firstFree);
        }

        if (accessRes.status === "fulfilled" && accessRes.value.data.success) {
          setHasPurchased(true);
        }
      } catch {
        // handled by allSettled
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBuy = async () => {
    try {
      const res = await createOrderService({ courseId: id });
      if (res.data.success) {
        const { razorpayOrderId, amount, currency, courseName } = res.data.data;
        // navigate to payment page with order details
        navigate("/student/payment", {
          state: { razorpayOrderId, amount, currency, courseName, courseId: id },
        });
      }
    } catch {
      // error handled in payment page
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-8 bg-muted rounded w-2/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/2 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Course not found.</p>
      </div>
    );
  }

  const freeLectures = course.curriculum?.filter((l) => l.freePreview) ?? [];
  const totalLectures = course.curriculum?.length ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {course.category && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground flex items-center gap-1">
              <Tag size={10} />
              {course.category}
            </span>
          )}
          {course.level && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground flex items-center gap-1">
              <BarChart2 size={10} />
              {course.level}
            </span>
          )}
          {course.primaryLanguage && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground flex items-center gap-1">
              <Globe size={10} />
              {course.primaryLanguage}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
          {course.title}
        </h1>
        {course.subtitle && (
          <p className="text-muted-foreground text-base mb-3">{course.subtitle}</p>
        )}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <User size={13} />
          <span>{course.instructorName}</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — preview + details */}
        <div className="lg:col-span-2 space-y-8">

          {/* Video preview or thumbnail */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border">
            {previewLecture ? (
              <video
                key={previewLecture._id}
                src={previewLecture.videoUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No preview available
              </div>
            )}
          </div>

          {/* Free preview lectures list */}
          {freeLectures.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                Free Previews
              </p>
              <div className="space-y-1">
                {freeLectures.map((lecture) => (
                  <button
                    key={lecture._id}
                    onClick={() => setPreviewLecture(lecture)}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left",
                      previewLecture?._id === lecture._id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    ].join(" ")}
                  >
                    <PlayCircle size={14} className="shrink-0" style={{ color: "#e8a020" }} />
                    {lecture.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {course.description && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                About this course
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </div>
          )}

          {/* Objectives */}
          {course.objectives && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                What you'll learn
              </p>
              <ul className="space-y-2">
                {course.objectives.split(",").map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#e8a020] shrink-0" />
                    {obj.trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Welcome message */}
          {course.welcomeMessage && (
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Message from instructor
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{course.welcomeMessage}"
              </p>
            </div>
          )}

          {/* Curriculum */}
          <div>
            <button
              onClick={() => setCurriculumOpen((p) => !p)}
              className="w-full flex items-center justify-between mb-3"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Curriculum · {totalLectures} lecture{totalLectures !== 1 ? "s" : ""}
              </p>
              {curriculumOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
            </button>

            {curriculumOpen && (
              <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                {course.curriculum?.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    No lectures yet.
                  </p>
                ) : (
                  course.curriculum?.map((lecture, idx) => (
                    <div
                      key={lecture._id}
                      className={[
                        "flex items-center gap-3 px-4 py-3 text-sm",
                        lecture.freePreview
                          ? "cursor-pointer hover:bg-muted/60 transition-colors"
                          : "opacity-60",
                      ].join(" ")}
                      onClick={() => lecture.freePreview && setPreviewLecture(lecture)}
                    >
                      <span className="text-xs text-muted-foreground w-5 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {lecture.freePreview ? (
                        <PlayCircle size={14} className="shrink-0" style={{ color: "#e8a020" }} />
                      ) : (
                        <Lock size={14} className="shrink-0 text-muted-foreground" />
                      )}
                      <span className={lecture.freePreview ? "text-foreground" : "text-muted-foreground"}>
                        {lecture.title}
                      </span>
                      {lecture.freePreview && (
                        <span className="ml-auto text-[10px] text-[#e8a020] font-medium uppercase tracking-wider">
                          Preview
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right — pricing card */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 border border-border rounded-lg overflow-hidden">
            {course.thumbnail && (
              <div className="aspect-video bg-muted overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-5">
              <p className="text-2xl font-bold text-foreground mb-1">
                ₹{course.pricing}
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                One-time payment · Lifetime access
              </p>

              {hasPurchased ? (
                <button
                  onClick={() => navigate(`/student/courses/${id}/watch`)}
                  className="w-full py-2.5 text-sm font-semibold rounded-md text-slate-900 bg-[#e8a020]"
                >
                  Go to course
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  className="w-full py-2.5 text-sm font-semibold rounded-md text-slate-900 bg-[#e8a020] hover:opacity-90 transition-opacity"
                >
                  Buy now · ₹{course.pricing}
                </button>
              )}

              <div className="mt-5 space-y-2.5">
                {[
                  `${totalLectures} lecture${totalLectures !== 1 ? "s" : ""}`,
                  `${freeLectures.length} free preview${freeLectures.length !== 1 ? "s" : ""}`,
                  course.level && `${course.level.charAt(0).toUpperCase() + course.level.slice(1)} level`,
                  course.primaryLanguage && `Taught in ${course.primaryLanguage}`,
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}