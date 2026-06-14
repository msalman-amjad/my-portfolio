import { useEffect, useState } from "react";
import { Download, Github, Linkedin, ArrowDown, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Profile } from "@/lib/portfolio";
function useTyping(words: string[], speed = 80, pause = 2500) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;

    const currentWord = words[i % words.length];

    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (text !== currentWord) {
            setText(currentWord.slice(0, text.length + 1));
          } else {
            setDeleting(true);
          }
        } else {
          if (text !== "") {
            setText(currentWord.slice(0, text.length - 1));
          } else {
            setDeleting(false);
            setI((prev) => prev + 1);
          }
        }
      },
      deleting ? 35 : text === currentWord ? pause : speed,
    );

    return () => clearTimeout(timeout);
  }, [text, deleting, i, words, speed, pause]);

  return text;
}

export function Hero({ profile }: { profile: Profile }) {
  const cleanRolesArray =
    typeof profile?.roles === "string"
      ? profile.roles
          .split(",")
          .map((s) => s.replace(/[[\]"]/g, "").trim())
          .filter(Boolean)
      : Array.isArray(profile?.roles)
        ? profile.roles
            .map((s) => (typeof s === "string" ? s.replace(/[[\]"]/g, "").trim() : s))
            .filter(Boolean)
        : [];

  const typingWords =
    cleanRolesArray.length > 0
      ? cleanRolesArray
      : profile?.title
        ? [profile.title]
        : ["Welcome to my portfolio", "Web Developer"];

  const typed = useTyping(typingWords);

  return (
    <section id="home" className="relative min-h-screen overflow-hidden hero-bg pt-32 pb-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-row items-center gap-6 md:grid md:grid-cols-[1.4fr_1fr] md:gap-12">
          <div className="space-y-6 animate-fade-in flex-1">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Hi, I'm <span className="gradient-text">{profile?.full_name ?? "There"}</span>
            </h1>
            {profile?.title && (
              <h2 className="text-2xl font-medium text-foreground/80 md:text-3xl">
                {profile.title}
              </h2>
            )}
            <p className="text-xl text-muted-foreground md:text-2xl">
              <span className="text-foreground font-medium typing-caret">{typed || "\u00A0"}</span>
            </p>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              {profile?.bio ?? ""}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/cv"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-100"
              >
                <FileText className="h-4 w-4" /> View CV
              </Link>
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.03]"
              >
                See my work <ArrowDown className="h-4 w-4" />
              </a>
              <div className="flex items-center gap-2 pl-2">
                {profile.github_url && (
                  <SocialIcon href={profile.github_url} label="GitHub">
                    <Github className="h-4 w-4" />
                  </SocialIcon>
                )}
                {profile.linkedin_url && (
                  <SocialIcon href={profile.linkedin_url} label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </SocialIcon>
                )}
              </div>
            </div>
          </div>

          <div className="relative aspect-square w-32 shrink-0 md:mx-auto md:w-full md:max-w-sm order-first md:order-last">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-accent-2/30 blur-3xl" />
            <div className="glass-strong relative h-full w-full overflow-hidden rounded-[2rem] shadow-glow animate-scale-in">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.full_name ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-7xl font-bold gradient-text">
                  {profile?.full_name?.charAt(0) ?? "S"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="group relative glass rounded-xl p-3 transition-transform hover:scale-110"
    >
      {children}
      <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </a>
  );
}
