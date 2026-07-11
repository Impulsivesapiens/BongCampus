import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyPaymentService, cancelOrderService } from "../../../services";
import { useAuth } from "../../../context/auth-context";
import toast from "react-hot-toast";
import { ShieldCheck, AlertCircle } from "lucide-react";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | loading | success | failed

  const { razorpayOrderId, amount, currency, courseName, courseId } = state ?? {};

  // redirect if landed here without order state
  useEffect(() => {
    if (!razorpayOrderId) {
      navigate("/student/home", { replace: true });
    }
  }, [razorpayOrderId, navigate]);

  const handleCancel = async () => {
    try {
      await cancelOrderService({ razorpayOrderId });
    } catch {
      // best effort
    }
    navigate(`/student/courses/${courseId}`, { replace: true });
  };

  const openRazorpay = async () => {
    setStatus("loading");
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      toast.error("Failed to load payment gateway. Check your connection.");
      setStatus("idle");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: "BongCampus",
      description: courseName,
      order_id: razorpayOrderId,
      prefill: {
        name: user?.userName,
        email: user?.userEmail,
      },
      theme: {
        color: "#e8a020",
      },
      handler: async (response) => {
        try {
          const res = await verifyPaymentService({
            razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (res.data.success) {
            setStatus("success");
            toast.success("Payment successful! Enjoy the course.");
            setTimeout(() => {
              navigate(`/student/courses/${courseId}/watch`, { replace: true });
            }, 1500);
          } else {
            setStatus("failed");
            toast.error("Payment verification failed.");
          }
        } catch {
          setStatus("failed");
          toast.error("Something went wrong verifying payment.");
        }
      },
      modal: {
        ondismiss: async () => {
          await handleCancel();
          setStatus("idle");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setStatus("idle");
  };

  if (!razorpayOrderId) return null;

  return (
    <div className="max-w-md mx-auto px-6 py-16">

      {status === "success" ? (
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#e8a020]/10 flex items-center justify-center">
            <ShieldCheck size={28} style={{ color: "#e8a020" }} />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Payment confirmed</h2>
          <p className="text-sm text-muted-foreground">
            Taking you to your course...
          </p>
        </div>
      ) : status === "failed" ? (
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle size={28} className="text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Payment failed</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Something went wrong. Your order has been cancelled.
          </p>
          <button
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="text-sm text-[#e8a020] hover:underline"
          >
            Back to course
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-border">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
              Order summary
            </p>
            <h2 className="text-base font-semibold text-foreground">{courseName}</h2>
          </div>

          {/* Amount */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              ₹{(amount / 100).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 space-y-3">
            <button
              onClick={openRazorpay}
              disabled={status === "loading"}
              className="w-full py-2.5 text-sm font-semibold rounded-md text-slate-900 bg-[#e8a020] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === "loading" ? "Opening payment..." : `Pay ₹${(amount / 100).toLocaleString("en-IN")}`}
            </button>
            <button
              onClick={handleCancel}
              disabled={status === "loading"}
              className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Trust note */}
          <div className="px-6 pb-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck size={12} />
            Secured by Razorpay
          </div>

        </div>
      )}
    </div>
  );
}