import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAllCoursesService } from "../../../services";
import { Filter, SlidersHorizontal } from "lucide-react";

const FILTERS = {
  category: [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "DevOps",
    "Design",
    "Business",
    "Photography",
  ],
  level: ["beginner", "intermediate", "advanced"],
  primaryLanguage: ["English", "Bengali", "Hindi", "Spanish"],
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-lowtohigh", label: "Price: Low to High" },
  { value: "price-hightolow", label: "Price: High to Low" },
  { value: "title-atoz", label: "Title: A to Z" },
  { value: "title-ztoa", label: "Title: Z to A" },
];

function CheckboxGroup({ title, options, selected, onChange }) {
  const toggle = (val) => {
    onChange(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val]
    );
  };

  return (
    <div className="mb-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt} onClick={() => toggle(opt)} className="flex items-center gap-2.5 cursor-pointer group">
            <span
              className={[
                "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                selected.includes(opt)
                  ? "border-[#e8a020] bg-[#e8a020]"
                  : "border-border group-hover:border-muted-foreground",
              ].join(" ")}
            >
              {selected.includes(opt) && (
                <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors capitalize">
              {opt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/student/courses/${course._id}`)}
      className="border border-border rounded-lg overflow-hidden cursor-pointer hover:border-muted-foreground transition-colors group"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted overflow-hidden">
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
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {course.level && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              {course.level}
            </span>
          )}
          {course.category && (
            <span className="text-[10px] text-muted-foreground truncate">
              {course.category}
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {course.instructorName}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground">
            ₹{course.pricing}
          </span>
          {course.primaryLanguage && (
            <span className="text-xs text-muted-foreground">
              {course.primaryLanguage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // derive filter state from URL
  const getParam = (key) => {
    const val = searchParams.get(key);
    return val ? val.split(",") : [];
  };

  const category = getParam("category");
  const level = getParam("level");
  const primaryLanguage = getParam("primaryLanguage");
  const sortBy = searchParams.get("sortBy") || "newest";

  const updateParam = (key, values) => {
    const next = new URLSearchParams(searchParams);
    if (values.length) next.set(key, values.join(","));
    else next.delete(key);
    setSearchParams(next);
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category.length) params.category = category.join(",");
      if (level.length) params.level = level.join(",");
      if (primaryLanguage.length) params.primaryLanguage = primaryLanguage.join(",");
      if (sortBy !== "newest") params.sortBy = sortBy;

      const res = await getAllCoursesService(params);
      if (res.data.success) setCourses(res.data.data);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const clearAll = () => setSearchParams({});
  const hasFilters = category.length || level.length || primaryLanguage.length;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">

      {/* Sidebar */}
      <aside
        className={[
          "shrink-0 border-r border-border bg-background overflow-y-auto scrollbar-hide",
          "fixed top-14 bottom-0 left-0 z-40 w-60 lg:static lg:w-56",
          "lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-200",
        ].join(" ")}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Filters
            </span>
            {hasFilters ? (
              <button
                onClick={clearAll}
                className="text-xs text-[#e8a020] hover:underline"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <CheckboxGroup
            title="Category"
            options={FILTERS.category}
            selected={category}
            onChange={(v) => updateParam("category", v)}
          />
          <CheckboxGroup
            title="Level"
            options={FILTERS.level}
            selected={level}
            onChange={(v) => updateParam("level", v)}
          />
          <CheckboxGroup
            title="Language"
            options={FILTERS.primaryLanguage}
            selected={primaryLanguage}
            onChange={(v) => updateParam("primaryLanguage", v)}
          />
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Filter size={14} />
              Filters
            </button>
            <span className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${courses.length} course${courses.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value === "newest") next.delete("sortBy");
                else next.set("sortBy", e.target.value);
                setSearchParams(next);
              }}
              className="text-sm bg-muted border border-border rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:border-muted-foreground transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground text-sm mb-2">No courses found</p>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-sm text-[#e8a020] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}