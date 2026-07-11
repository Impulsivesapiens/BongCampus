import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import toast from "react-hot-toast";
import {
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart2,
  LogOut,
  GraduationCap,
  PlusSquare,
} from "lucide-react";

const studentLinks = [
  { to: "/student/home", label: "Browse", icon: BookOpen },
  { to: "/student/courses/purchased", label: "My Learning", icon: GraduationCap },
];

const instructorLinks = [
  { to: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/instructor/courses/create", label: "New Course", icon: PlusSquare },
];

const adminLinks = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

const roleLinks = {
  user: studentLinks,
  instructor: instructorLinks,
  admin: adminLinks,
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = roleLinks[user?.role] ?? [];

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">

        {/* Logo */}
        <span
          className="text-base font-semibold tracking-tight cursor-pointer select-none"
          onClick={() => navigate(roleLinks[user?.role]?.[0]?.to ?? "/auth")}
        >
          Bong<span style={{ color: "#e8a020" }}>Campus</span>
        </span>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                  isActive
                    ? "text-foreground bg-muted font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                ].join(" ")
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {user?.userName}
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-border text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
            {user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

      </div>
    </header>
  );
}