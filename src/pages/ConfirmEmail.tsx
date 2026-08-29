import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getRoleBasedRedirect } from "@/utils/roleRedirect";

const ConfirmEmail = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [dashboardPath, setDashboardPath] = useState("/student-portal");
  const navigate = useNavigate();

  useEffect(() => {
    const ensureProfileAndTarget = async (userId: string, email?: string | null) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      let role = profile?.role as string | undefined;

      if (!role) {
        await supabase.from("profiles").insert({
          user_id: userId,
          email: email ?? undefined,
          role: "student",
        });
        role = "student";
      }

      if (role === "student") {
        // Students land on the portal until their application is approved
        const { data: student } = await supabase
          .from("students")
          .select("status")
          .eq("user_id", userId)
          .maybeSingle();
        setDashboardPath(student?.status === "approved" ? "/student-dashboard" : "/student-portal");
      } else {
        setDashboardPath(getRoleBasedRedirect(role));
      }
    };

    const confirm = async () => {
      try {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

        const errorDescription =
          params.get("error_description") || hashParams.get("error_description");
        if (errorDescription) {
          setStatus("error");
          setMessage(errorDescription);
          return;
        }

        const code = params.get("code");
        const tokenHash = params.get("token_hash") || params.get("token");
        const type = (params.get("type") || hashParams.get("type") || "signup") as
          | "signup"
          | "email"
          | "recovery"
          | "magiclink"
          | "invite"
          | "email_change";
        const accessToken = params.get("access_token") || hashParams.get("access_token");
        const refreshToken = params.get("refresh_token") || hashParams.get("refresh_token");

        // 1. PKCE style link (?code=...)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        // 2. Token hash style link (?token_hash=...&type=signup)
        else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === "magiclink" ? "magiclink" : type,
          });
          if (error) throw error;
        }
        // 3. Implicit style link (tokens in query or hash)
        else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus("error");
          setMessage(
            "We couldn't verify this link. It may have expired or already been used. Please sign in, or request a new confirmation email."
          );
          return;
        }

        await ensureProfileAndTarget(user.id, user.email);

        // Clean the tokens out of the URL
        window.history.replaceState({}, document.title, "/confirm-email");

        setStatus("success");
        setMessage(
          "Your email has been verified and your account is active. You can now continue to your dashboard."
        );
      } catch (error: any) {
        console.error("Email confirmation error:", error);
        setStatus("error");
        setMessage(
          error?.message ||
            "This confirmation link has expired or is invalid. Please request a new confirmation email."
        );
      }
    };

    confirm();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container flex-1 flex items-center justify-center py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-3">
            <div className="flex justify-center">
              {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
              {status === "success" && <CheckCircle className="h-12 w-12 text-primary" />}
              {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
            </div>
            <CardTitle>
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Email verified"}
              {status === "error" && "Verification failed"}
            </CardTitle>
            <CardDescription>
              {status === "loading"
                ? "Please wait while we confirm your account."
                : message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {status === "success" && (
              <>
                <Button className="w-full" onClick={() => navigate(dashboardPath)}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </>
            )}
            {status === "error" && (
              <>
                <Button className="w-full" onClick={() => navigate("/login")}>
                  Go to Login
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/signup")}>
                  Sign up again
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ConfirmEmail;
