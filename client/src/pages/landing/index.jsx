import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="flex justify-between items-center px-16 py-5 border-b border-border">
        <div className="text-xl font-semibold tracking-tight">
          Bong<span style={{ color: "#e8a020" }}>Campus</span>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate("/auth")}
            className="px-5 py-2 text-sm border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="px-5 py-2 text-sm font-semibold rounded-md text-slate-900"
            style={{ background: "#e8a020" }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-16 pt-24 pb-20 max-w-4xl">
        <p className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: "#e8a020" }}>
          Learning platform for everyone
        </p>
        <h1 className="text-6xl font-bold leading-none tracking-tight text-foreground mb-5">
          Learn from the best.<br />
          <span style={{ color: "#e8a020" }}>Teach what you know.</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-10">
          BongCampus connects students with expert instructors. Browse courses, learn at your pace, and build skills that matter.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-3 text-base font-semibold rounded-lg text-slate-900"
            style={{ background: "#e8a020" }}
          >
            Browse courses
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-3 text-base font-semibold rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Become an instructor
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="flex border-y border-border">
        {[
          { num: "2,400+", label: "Courses available" },
          { num: "180+", label: "Expert instructors" },
          { num: "12,000+", label: "Students enrolled" },
          { num: "4.8★", label: "Average rating" },
        ].map((stat, i) => (
          <div key={i} className="px-16 py-7 border-r border-border last:border-r-0">
            <div className="text-3xl font-bold tracking-tight text-foreground">{stat.num}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="px-16 py-20">
        <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: "#e8a020" }}>
          Why BongCampus
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-12">
          Everything you need to learn or teach
        </h2>
        <div className="grid grid-cols-3 border border-border divide-x divide-y divide-border">
          {[
            { icon: "▶", title: "HD video lessons", desc: "Stream high quality lectures directly in your browser. No downloads needed." },
            { icon: "⚡", title: "Learn at your pace", desc: "Lifetime access to every course you purchase. Revisit anytime, anywhere." },
            { icon: "🎓", title: "Expert instructors", desc: "Every instructor is verified by our team before publishing their first course." },
            { icon: "💳", title: "Secure payments", desc: "Pay safely with Razorpay. UPI, cards, and net banking all supported." },
            { icon: "📱", title: "Any device", desc: "Desktop, tablet, or mobile — your courses follow you everywhere." },
            { icon: "🔒", title: "Access control", desc: "Free previews for every course. Full content unlocks after purchase." },
          ].map((f, i) => (
            <div key={i} className="p-8">
              <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center mb-5 text-sm">
                {f.icon}
              </div>
              <div className="text-sm font-semibold text-foreground mb-2">{f.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="px-16 py-20 border-t border-border flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Ready to start learning?</h2>
          <p className="text-sm text-muted-foreground">Join thousands of students already on BongCampus.</p>
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="px-8 py-3 text-base font-semibold rounded-lg text-slate-900"
          style={{ background: "#e8a020" }}
        >
          Create free account
        </button>
      </div>

      {/* Footer */}
      <footer className="px-16 py-6 border-t border-border flex justify-between items-center">
        <span className="text-xs text-muted-foreground">© 2025 BongCampus. Built with MERN stack.</span>
        <span className="text-xs text-muted-foreground">Jadavpur University MCA Project</span>
      </footer>

    </div>
  );
}