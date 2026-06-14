import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect already-authenticated users straight to admin
  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) navigate({ to: "/admin", replace: true });
      });
    } catch {
      // silently ignore session check errors on initial load
    }
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 8) {
      toast.error("Enter a valid email and a password with at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log(
        "[Auth] Sign-in successful. User:",
        signInData.user?.id,
        "| Session expires:",
        signInData.session?.expires_at,
      );

      toast.success("Welcome back!");
      await router.invalidate();
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      console.error("[Auth] Sign-in error:", err);
      toast.error("Invalid credentials, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center hero-bg px-4">
      <a
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to site
      </a>

      <div className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-glow animate-scale-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-bold">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your portfolio.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="••••••••"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Minimum 8 characters</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
