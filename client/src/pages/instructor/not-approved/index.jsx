import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import { Clock, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function NotApprovedPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Minimal nav */}
      <header className="border-b border-border px-6 h-14 flex items-center justify-between">
        <span className="text-base font-semibold tracking-tight">
          Bong<span style={{ color: "#e8a020" }}>Campus</span>
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">

          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-[#e8a020]/10 flex items-center justify-center mx-auto mb-6">
            <Clock size={26} style={{ color: "#e8a020" }} />
          </div>

          <h1 className="text-xl font-bold text-foreground tracking-tight mb-3">
            Pending approval
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Your instructor account is under review. An admin will approve your account shortly. You'll be able to sign in and start creating courses once approved.
          </p>

          <div className="border border-border rounded-lg p-5 text-left space-y-3 mb-8">
            {[
              "Account created successfully",
              "Awaiting admin review",
              "Approval usually takes 24–48 hours",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className={[
                  "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-medium",
                  i === 0
                    ? "border-[#e8a020] text-[#e8a020]"
                    : i === 1
                    ? "border-[#e8a020] bg-[#e8a020] text-slate-900"
                    : "border-border text-muted-foreground",
                ].join(" ")}>
                  {i === 0 ? "✓" : i + 1}
                </span>
                <span className={i === 2 ? "text-muted-foreground" : "text-foreground"}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 text-sm font-semibold rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
          >
            Sign out and come back later
          </button>

        </div>
      </div>

    </div>
  );
}