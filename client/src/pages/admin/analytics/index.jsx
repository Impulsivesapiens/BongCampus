import { useEffect, useState } from "react";
import { getAnalyticsService } from "../../../services";
import { Users, BookOpen, ShoppingBag, IndianRupee, GraduationCap } from "lucide-react";

const stats = [
  { key: "totalUsers", label: "Students", icon: GraduationCap },
  { key: "totalInstructors", label: "Instructors", icon: Users },
  { key: "totalCourses", label: "Courses", icon: BookOpen },
  { key: "totalOrders", label: "Orders", icon: ShoppingBag },
  { key: "totalRevenue", label: "Revenue", icon: IndianRupee, currency: true },
];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await getAnalyticsService();
        if (res.data.success) setData(res.data.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Admin
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-6 animate-pulse">
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center h-48 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Failed to load analytics</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map(({ key, label, icon: Icon, currency }) => (
            <div key={key} className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {currency
                  ? `₹${data[key].toLocaleString("en-IN")}`
                  : data[key].toLocaleString("en-IN")
                }
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}