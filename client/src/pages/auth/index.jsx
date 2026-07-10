import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import toast from "react-hot-toast";

const initialSignIn = { userEmail: "", password: "" };
const initialSignUp = { userName: "", userEmail: "", password: "", role: "user" };

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [signInData, setSignInData] = useState(initialSignIn);
  const [signUpData, setSignUpData] = useState(initialSignUp);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const roleHomeMap = {
    user: "/student/home",
    instructor: "/instructor/dashboard",
    admin: "/admin/users",
  };

  const handleSignIn = async () => {
    if (!signInData.userEmail || !signInData.password) {
      toast.error("Fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await login(signInData);
      if (res.success) {
        toast.success("Welcome back");
        navigate(roleHomeMap[res.user.role]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpData.userName || !signUpData.userEmail || !signUpData.password) {
      toast.error("Fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await register(signUpData);
      if (res.success) {
        if (signUpData.role === "instructor") {
          toast.success("Account created. Wait for admin approval.");
          setActiveTab("signin");
        } else {
          toast.success("Account created");
          navigate("/student/home");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-16 py-12 border-r border-border">
        <div
          className="text-xl font-semibold tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          Bong<span style={{ color: "#e8a020" }}>Campus</span>
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: "#e8a020" }}>
            Learning platform for everyone
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Learn from the best.<br />
            <span style={{ color: "#e8a020" }}>Teach what you know.</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Join thousands of students and instructors already building and sharing knowledge on BongCampus.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 BongCampus</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center flex-1 px-8 lg:px-20">

        {/* Mobile logo */}
        <div
          className="lg:hidden text-xl font-semibold tracking-tight mb-12 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Bong<span style={{ color: "#e8a020" }}>Campus</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-8 w-full max-w-sm">
          {["signin", "signup"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 text-sm font-medium mr-6 border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab ? "#e8a020" : "transparent",
                color: activeTab === tab ? "#f8fafc" : "#64748b",
              }}
            >
              {tab === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {/* Sign in form */}
        {activeTab === "signin" && (
          <div className="w-full max-w-sm space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={signInData.userEmail}
                onChange={(e) => setSignInData({ ...signInData, userEmail: e.target.value })}
                className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold rounded-md text-slate-900 disabled:opacity-50 transition-opacity"
              style={{ background: "#e8a020" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        )}

        {/* Sign up form */}
        {activeTab === "signup" && (
          <div className="w-full max-w-sm space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Username</label>
              <input
                type="text"
                placeholder="yourname"
                value={signUpData.userName}
                onChange={(e) => setSignUpData({ ...signUpData, userName: e.target.value })}
                className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={signUpData.userEmail}
                onChange={(e) => setSignUpData({ ...signUpData, userEmail: e.target.value })}
                className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">I want to</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "user", label: "Learn" },
                  { value: "instructor", label: "Teach" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSignUpData({ ...signUpData, role: opt.value })}
                    className="py-2.5 text-sm rounded-md border transition-colors"
                    style={{
                      background: signUpData.role === opt.value ? "#e8a020" : "transparent",
                      borderColor: signUpData.role === opt.value ? "#e8a020" : "#334155",
                      color: signUpData.role === opt.value ? "#0f172a" : "#94a3b8",
                      fontWeight: signUpData.role === opt.value ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {signUpData.role === "instructor" && (
                <p className="text-xs text-muted-foreground mt-2">
                  Instructor accounts require admin approval before you can log in.
                </p>
              )}
            </div>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold rounded-md text-slate-900 disabled:opacity-50 transition-opacity"
              style={{ background: "#e8a020" }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}