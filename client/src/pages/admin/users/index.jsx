import { useEffect, useState } from "react";
import {
  getAllUsersService,
  updateUserStatusService,
  deleteUserService,
} from "../../../services";
import { Trash2, ChevronDown, Users } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["active", "pending", "suspended"];
const ROLE_FILTERS = ["all", "user", "instructor", "admin"];
const STATUS_FILTERS = ["all", "active", "pending", "suspended"];

const statusStyles = {
  active: "border-[#e8a020] text-[#e8a020]",
  pending: "border-yellow-500 text-yellow-500",
  suspended: "border-destructive text-destructive",
};

function UserRow({ user, onStatusChange, onDelete }) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const getStatusOptions = (role) => {
    if (role === "instructor") return ["active", "suspended", "pending"];
    return ["active", "suspended"];
  };

  const handleStatusChange = async (status) => {
    if (status === user.status) return;
    setUpdating(true);
    try {
      const res = await updateUserStatusService(user._id, { status });
      if (res.data.success) {
        toast.success(`Status updated to ${status}`);
        onStatusChange(user._id, status);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${user.userName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await deleteUserService(user._id);
      if (res.data.success) {
        toast.success("User deleted");
        onDelete(user._id);
      }
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
        <span className="text-xs font-medium text-muted-foreground">
          {user.userName?.[0]?.toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{user.userName}</p>
        <p className="text-xs text-muted-foreground truncate">{user.userEmail}</p>
      </div>

      {/* Role badge */}
      <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground shrink-0 hidden sm:inline-block">
        {user.role}
      </span>

      {/* Status dropdown */}
      <div className="relative shrink-0">
        <select
          value={user.status}
          disabled={updating || user.role === "admin"}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={[
            "text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border bg-transparent appearance-none cursor-pointer pr-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            statusStyles[user.status] ?? "border-border text-muted-foreground",
          ].join(" ")}
        >
          {getStatusOptions(user.role).map((s) => (
            <option key={s} value={s} className="text-foreground bg-background normal-case">
              {s}
            </option>
          ))}
        </select>
        <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
      </div>

      {/* Delete */}
      {user.role !== "admin" && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (roleFilter !== "all") params.role = roleFilter;
        if (statusFilter !== "all") params.status = statusFilter;
        const res = await getAllUsersService(params);
        if (res.data.success) setUsers(res.data.data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleStatusChange = (id, status) =>
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, status } : u));

  const handleDelete = (id) =>
    setUsers((prev) => prev.filter((u) => u._id !== id));

  const pendingInstructors = users.filter(
    (u) => u.role === "instructor" && u.status === "pending"
  ).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Admin
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Users</h1>
          {pendingInstructors > 0 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              {pendingInstructors} instructor{pendingInstructors > 1 ? "s" : ""} pending approval
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1 border border-border rounded-md overflow-hidden">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={[
                "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                roleFilter === r
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border border-border rounded-md overflow-hidden">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={[
                "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                statusFilter === s
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {users.length} user{users.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="border border-border rounded-lg overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-b-0 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-border rounded-lg">
          <Users size={28} className="text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          {users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}