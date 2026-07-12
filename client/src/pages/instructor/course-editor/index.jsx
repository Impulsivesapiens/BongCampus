import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  getInstructorCourseService,
  createCourseService,
  updateCourseService,
  deleteLectureService,
  getUploadSignatureService,
  deleteStagedUploadService,
} from "../../../services";
import { Upload, Trash2, Plus, ImageIcon, Video, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Web Development", "Mobile Development", "Data Science",
  "Machine Learning", "DevOps", "Design", "Business", "Photography",
];
const LEVELS = ["beginner", "intermediate", "advanced"];
const LANGUAGES = ["English", "Bengali", "Hindi", "Spanish"];

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  level: "",
  primaryLanguage: "",
  pricing: "",
  objectives: "",
  welcomeMessage: "",
};

// --- Cloudinary upload with progress ---
function uploadToCloudinary(file, resourceType, signatureData, onProgress) {
  return new Promise((resolve, reject) => {
    const { signature, timestamp, cloudName, apiKey } = signatureData;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Cloudinary upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Cloudinary upload failed"));
    xhr.send(formData);
  });
}

// --- Details Tab ---
function DetailsTab({ form, setForm, thumbnailFile, setThumbnailFile }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(form.thumbnail ?? null);

  // sync preview when form.thumbnail changes (edit mode load)
  useEffect(() => {
    if (form.thumbnail && !thumbnailFile) setPreview(form.thumbnail);
  }, [form.thumbnail]);

  const handleFile = (file) => {
    if (!file) return;
    setThumbnailFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground block mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground transition-colors"
      />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Thumbnail */}
      <div>
        <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground block mb-1.5">
          Thumbnail
        </label>
        <div
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="relative border border-border rounded-lg overflow-hidden cursor-pointer hover:border-muted-foreground transition-colors"
        >
          {preview ? (
            <div className="relative aspect-video">
              <img src={preview} alt="thumbnail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-xs text-white">Click to replace</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center gap-2 bg-muted">
              <ImageIcon size={24} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Drag and drop or click to upload</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {field("Title", "title", "text", "e.g. Complete React Course")}
      {field("Subtitle", "subtitle", "text", "e.g. Learn React from scratch")}

      <div>
        <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground block mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={4}
          placeholder="What is this course about?"
          className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Category", key: "category", options: CATEGORIES },
          { label: "Level", key: "level", options: LEVELS },
          { label: "Language", key: "primaryLanguage", options: LANGUAGES },
        ].map(({ label, key, options }) => (
          <div key={key}>
            <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground block mb-1.5">
              {label}
            </label>
            <select
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-muted-foreground transition-colors"
            >
              <option value="">Select {label.toLowerCase()}</option>
              {options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {field("Pricing (₹)", "pricing", "number", "e.g. 999")}

      <div>
        <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground block mb-1.5">
          Objectives <span className="normal-case font-normal">(comma separated)</span>
        </label>
        <textarea
          value={form.objectives}
          onChange={(e) => setForm((p) => ({ ...p, objectives: e.target.value }))}
          rows={3}
          placeholder="Build real projects, Understand core concepts, Deploy to production"
          className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground transition-colors resize-none"
        />
      </div>

      {field("Welcome message", "welcomeMessage", "text", "A short message to your students")}

    </div>
  );
}

// --- Curriculum Tab ---
function CurriculumTab({ curriculum, setCurriculum, courseId, uploadProgress }) {
  const [title, setTitle] = useState("");
  const [freePreview, setFreePreview] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleAddLecture = () => {
    if (!title.trim()) return toast.error("Lecture title is required");
    if (!videoFile) return toast.error("Please select a video");

    const newLecture = {
      _id: crypto.randomUUID(),
      title: title.trim(),
      freePreview,
      videoFile,
      videoUrl: "",
      public_id: "",
      isNew: true,
    };

    setCurriculum((prev) => [...prev, newLecture]);
    setTitle("");
    setFreePreview(false);
    setVideoFile(null);
  };

  const handleDeleteLecture = async (lecture) => {
    if (!window.confirm("Delete this lecture?")) return;

    if (lecture.isNew) {
      // not in DB yet — just remove from state
      setCurriculum((prev) => prev.filter((l) => l._id !== lecture._id));
      return;
    }

    // existing lecture — delete from DB + Cloudinary immediately
    try {
      const res = await deleteLectureService(courseId, lecture._id);
      if (res.data.success) {
        setCurriculum((prev) => prev.filter((l) => l._id !== lecture._id));
        toast.success("Lecture deleted");
      }
    } catch {
      toast.error("Failed to delete lecture");
    }
  };

  const handleReplaceVideo = (lectureId, file) => {
    setCurriculum((prev) =>
      prev.map((l) => l._id === lectureId ? { ...l, videoFile: file } : l)
    );
  };

  const toggleFreePreview = (lectureId) => {
    setCurriculum((prev) =>
      prev.map((l) => l._id === lectureId ? { ...l, freePreview: !l.freePreview } : l)
    );
  };

  return (
    <div className="space-y-6">

      {/* Lecture list */}
      {curriculum.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          {curriculum.map((lecture, idx) => {
            const progress = uploadProgress[lecture._id];
            return (
              <div
                key={lecture._id}
                className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <Video size={14} className="text-muted-foreground shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{lecture.title}</p>
                  {/* upload progress bar */}
                  {progress !== undefined && progress < 100 && (
                    <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden w-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, background: "#e8a020" }}
                      />
                    </div>
                  )}
                  {progress === 100 && (
                    <p className="text-[10px] text-[#e8a020] mt-0.5">Uploaded</p>
                  )}
                  {lecture.isNew && progress === undefined && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {lecture.videoFile?.name} · {(lecture.videoFile?.size / 1024 / 1024).toFixed(1)} MB · pending upload
                    </p>
                  )}
                  {!lecture.isNew && !lecture.videoFile && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Uploaded</p>
                  )}
                  {!lecture.isNew && lecture.videoFile && progress === undefined && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Replace with: {lecture.videoFile?.name} · pending upload
                    </p>
                  )}
                </div>

                {/* free preview toggle */}
                <button
                  type="button"
                  onClick={() => toggleFreePreview(lecture._id)}
                  title="Toggle free preview"
                  className={[
                    "text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors shrink-0",
                    lecture.freePreview
                      ? "border-[#e8a020] text-[#e8a020]"
                      : "border-border text-muted-foreground hover:border-muted-foreground",
                  ].join(" ")}
                >
                  Preview
                </button>

                {/* replace video — only for existing lectures */}
                {!lecture.isNew && (
                  <label className="cursor-pointer p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0" title="Replace video">
                    <Upload size={13} />
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleReplaceVideo(lecture._id, e.target.files[0])}
                    />
                  </label>
                )}

                {/* delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteLecture(lecture)}
                  className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add lecture form */}
      <div className="border border-border rounded-lg p-5 space-y-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Add lecture
        </p>

        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground block mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to React Hooks"
            className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground block mb-1.5">
            Video
          </label>
          <div
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file?.type.startsWith("video/")) setVideoFile(file);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border border-border rounded-lg px-4 py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-muted-foreground transition-colors bg-muted"
          >
            {videoFile ? (
              <>
                <Video size={20} style={{ color: "#e8a020" }} />
                <p className="text-sm text-foreground">{videoFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(videoFile.size / 1024 / 1024).toFixed(1)} MB · click to change
                </p>
              </>
            ) : (
              <>
                <Upload size={20} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                <p className="text-xs text-muted-foreground">MP4, MOV, WebM supported</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        </div>

        {/* Free preview toggle */}
        <div
          className="flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setFreePreview((p) => !p)}
            className={[
              "w-9 h-5 rounded-full transition-colors relative shrink-0",
              freePreview ? "bg-[#e8a020]" : "bg-muted border border-border",
            ].join(" ")}
          >
            <span className={[
              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
              freePreview ? "translate-x-4" : "translate-x-0.5",
            ].join(" ")} />
          </button>
          <span className="text-sm text-muted-foreground">Free preview</span>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddLecture}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-slate-900 bg-[#e8a020] hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Add to list
          </button>
        </div>
      </div>

    </div>
  );
}

// --- Main Course Editor ---
export default function CourseEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [tab, setTab] = useState(
    searchParams.get("tab") === "curriculum" ? "curriculum" : "details"
  );
  const [form, setForm] = useState(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { lectureId: 0-100 }
  const courseId = id ?? null;

  useEffect(() => {
    if (!isEdit) return;
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await getInstructorCourseService(id);
        if (res.data.success) {
          const c = res.data.data;
          setForm({
            title: c.title ?? "",
            subtitle: c.subtitle ?? "",
            description: c.description ?? "",
            category: c.category ?? "",
            level: c.level ?? "",
            primaryLanguage: c.primaryLanguage ?? "",
            pricing: c.pricing ?? "",
            objectives: c.objectives ?? "",
            welcomeMessage: c.welcomeMessage ?? "",
            thumbnail: c.thumbnail ?? "",
            thumbnail_public_id: c.thumbnail_public_id ?? "",
          });
          // load existing lectures with videoFile: null and isNew: false
          setCurriculum(
            (c.curriculum ?? []).map((l) => ({
              ...l,
              videoFile: null,
              isNew: false,
            }))
          );
        }
      } catch {
        toast.error("Failed to load course");
        navigate("/instructor/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, isEdit, navigate]);

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.category) return toast.error("Category is required");
    if (!form.pricing) return toast.error("Pricing is required");

    setSubmitting(true);

    // track all newly uploaded public_ids for compensation on DB failure
    const newlyUploaded = []; // { public_id, resource_type }
    // track old public_ids to delete after DB success
    const toDeleteAfterSuccess = []; // { public_id, resource_type }

    try {
      // --- 1. thumbnail ---
      let thumbnailUrl = form.thumbnail ?? "";
      let thumbnailPublicId = form.thumbnail_public_id ?? "";

      if (thumbnailFile) {
        const sigRes = await getUploadSignatureService();
        const uploaded = await uploadToCloudinary(thumbnailFile, "image", sigRes.data.data, null);
        newlyUploaded.push({ public_id: uploaded.public_id, resource_type: "image" });

        if (thumbnailPublicId) {
          toDeleteAfterSuccess.push({ public_id: thumbnailPublicId, resource_type: "image" });
        }

        thumbnailUrl = uploaded.secure_url;
        thumbnailPublicId = uploaded.public_id;
      }

      // --- 2. lecture videos ---
      const finalCurriculum = [];

      for (const lecture of curriculum) {
        if (lecture.isNew && lecture.videoFile) {
          // new lecture — upload video
          const sigRes = await getUploadSignatureService();
          const uploaded = await uploadToCloudinary(
            lecture.videoFile,
            "video",
            sigRes.data.data,
            (pct) => setUploadProgress((prev) => ({ ...prev, [lecture._id]: pct }))
          );
          newlyUploaded.push({ public_id: uploaded.public_id, resource_type: "video" });

          finalCurriculum.push({
            title: lecture.title,
            freePreview: lecture.freePreview,
            videoUrl: uploaded.secure_url,
            public_id: uploaded.public_id,
          });

        } else if (!lecture.isNew && lecture.videoFile) {
          // existing lecture with replaced video — upload new
          const sigRes = await getUploadSignatureService();
          const uploaded = await uploadToCloudinary(
            lecture.videoFile,
            "video",
            sigRes.data.data,
            (pct) => setUploadProgress((prev) => ({ ...prev, [lecture._id]: pct }))
          );
          newlyUploaded.push({ public_id: uploaded.public_id, resource_type: "video" });

          // delete old video after DB success
          if (lecture.public_id) {
            toDeleteAfterSuccess.push({ public_id: lecture.public_id, resource_type: "video" });
          }

          finalCurriculum.push({
            _id: lecture._id, // preserve mongo id
            title: lecture.title,
            freePreview: lecture.freePreview,
            videoUrl: uploaded.secure_url,
            public_id: uploaded.public_id,
          });

        } else {
          // existing lecture untouched — pass through as is
          finalCurriculum.push({
            _id: lecture._id,
            title: lecture.title,
            freePreview: lecture.freePreview,
            videoUrl: lecture.videoUrl,
            public_id: lecture.public_id,
          });
        }
      }

      // --- 3. DB write ---
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        category: form.category,
        level: form.level,
        primaryLanguage: form.primaryLanguage,
        pricing: Number(form.pricing),
        objectives: form.objectives,
        welcomeMessage: form.welcomeMessage,
        curriculum: finalCurriculum,
        ...(thumbnailFile && {
          thumbnail: thumbnailUrl,
          thumbnail_public_id: thumbnailPublicId,
        }),
      };

      let res;
      if (isEdit) {
        res = await updateCourseService(courseId, payload);
      } else {
        res = await createCourseService(payload);
      }

      if (res.data.success) {
        // --- 4. DB success — clean up old assets ---
        await Promise.allSettled(
          toDeleteAfterSuccess.map(({ public_id, resource_type }) =>
            deleteStagedUploadService({ public_id, resource_type })
          )
        );

        if (!isEdit) {
          toast.success("Course created successfully");
          navigate("/instructor/dashboard");
        } else {
          toast.success("Course saved");
          setUploadProgress({});
        }
      }

    } catch {
      // --- DB failed or upload failed — compensate all newly uploaded assets ---
      await Promise.allSettled(
        newlyUploaded.map(({ public_id, resource_type }) =>
          deleteStagedUploadService({ public_id, resource_type })
        )
      );
      setUploadProgress({});
      toast.error("Failed to save course. Any uploaded files have been cleaned up.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-48 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  const pendingUploads = curriculum.filter((l) => l.videoFile).length;
  const hasThumbnailPending = Boolean(thumbnailFile);
  const totalPending = pendingUploads + (hasThumbnailPending ? 1 : 0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Instructor
          </p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {isEdit ? "Edit course" : "New course"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/instructor/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-slate-900 bg-[#e8a020] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : isEdit
              ? `Save changes${totalPending > 0 ? ` · ${totalPending} upload${totalPending > 1 ? "s" : ""}` : ""}`
              : `Create course${totalPending > 0 ? ` · ${totalPending} upload${totalPending > 1 ? "s" : ""}` : ""}`
            }
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        {[
          { key: "details", label: "Details" },
          { key: "curriculum", label: `Curriculum${curriculum.length > 0 ? ` · ${curriculum.length}` : ""}` },
        ].map(({ key, label, disabled }) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setTab(key)}
            className={[
              "pb-3 text-sm font-medium mr-6 border-b-2 transition-colors",
              tab === key
                ? "border-[#e8a020] text-foreground"
                : "border-transparent text-muted-foreground",
              disabled ? "opacity-40 cursor-not-allowed" : "hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <DetailsTab
          form={form}
          setForm={setForm}
          thumbnailFile={thumbnailFile}
          setThumbnailFile={setThumbnailFile}
        />
      ) : (
        <CurriculumTab
          curriculum={curriculum}
          setCurriculum={setCurriculum}
          courseId={courseId}
          uploadProgress={uploadProgress}
        />
      )}

    </div>
  );
}