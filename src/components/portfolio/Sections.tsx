import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Sparkles,
  ExternalLink,
  FileText,
  Github,
  X,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Images,
  Briefcase,
} from "lucide-react";
import type { Academic, Project, Skill, WorkExperience } from "@/lib/portfolio";

function SectionHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {kicker}
      </span>
      <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function EducationSection({ items }: { items: Academic[] }) {
  return (
    <section id="education" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          kicker="Journey"
          title="Academic Record"
          subtitle="A timeline of learning, milestones, and growth."
        />
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-transparent" />
          <ol className="space-y-10">
            {items.map((it, idx) => (
              <li
                key={it.id}
                className={`relative md:grid md:grid-cols-2 md:gap-12 ${idx % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className={`pl-12 md:pl-0 ${idx % 2 ? "md:pl-12" : "md:pr-12 md:text-right"}`}>
                  <div className="glass card-hover rounded-2xl p-6">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                      <GraduationCap className="h-4 w-4" />
                      {it.is_ongoing
                        ? `${it.start_date} - Present (Expected: ${it.end_date})`
                        : `${it.start_date} - ${it.end_date}`}
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{it.degree}</h3>
                    <p className="text-sm text-muted-foreground">{it.institution}</p>
                    {it.cgpa && (
                      <p className="mt-2 text-sm font-medium text-primary/80">
                        {it.score_type === "Grade" ? "Grade" : "CGPA"}: {it.cgpa}
                      </p>
                    )}
                    {it.achievements && (
                      <p className="mt-3 text-sm text-muted-foreground">{it.achievements}</p>
                    )}
                  </div>
                </div>
                <span className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 h-4 w-4 rounded-full bg-primary shadow-glow" />
                <div className="hidden md:block" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function WorkExperienceSection({ items }: { items: WorkExperience[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section id="work" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          kicker="Career"
          title="Work Experience"
          subtitle="Professional history and impactful roles."
        />
        <div className="relative">
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-transparent" />
          <ol className="space-y-8">
            {items.map((it) => (
              <li key={it.id} className="relative pl-16 md:pl-20">
                <span className="absolute left-4 md:left-8 top-6 -translate-x-1/2 h-4 w-4 rounded-full bg-primary shadow-glow" />
                <div className="glass card-hover rounded-2xl p-6 text-left">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    <Briefcase className="h-4 w-4" />
                    {it.is_ongoing
                      ? `${it.start_date} - Present`
                      : `${it.start_date} - ${it.end_date}`}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-left">{it.job_title}</h3>
                  <p className="text-sm font-medium text-foreground text-left">{it.company}</p>
                  {it.description && (
                    <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line text-left">{it.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function SkillsSection({ skills }: { skills: Skill[] }) {
  if (!skills || skills.length === 0) return null;
  return (
    <section id="skills" className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          kicker="Toolbox"
          title="Skills & Expertise"
          subtitle="The technologies I reach for to ship great products."
        />
        <div className="flex flex-wrap gap-3 justify-center">
          {skills.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-105 transition-all duration-200 cursor-default"
            >
              <Sparkles className="h-3.5 w-3.5 opacity-70" />
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}


export function LanguagesSection({
  languages,
}: {
  languages: { name: string; proficiency: string; percentage: number }[];
}) {
  if (!languages || languages.length === 0) return null;
  return (
    <section id="languages" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          kicker="Linguistics"
          title="Languages"
          subtitle="The languages I speak and my proficiency."
        />
        <div className="glass card-hover rounded-2xl p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {languages.map((lang, idx) => (
              <div key={idx}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {lang.name}{" "}
                    <span className="text-muted-foreground font-normal ml-1">
                      — {lang.proficiency}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-primary">{lang.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/50 border border-border/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const getTechArray = (tech: any): string[] => {
  if (!tech) return [];
  if (Array.isArray(tech)) return tech.map((s) => String(s).trim()).filter(Boolean);
  if (typeof tech === "string") {
    const trimmed = tech.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
      } catch {
        // fall through to comma-split
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

/** Ensures a URL has an http/https scheme so it routes externally. */
const formatExternalUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
};

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);
  return (
    <section id="projects" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          kicker="Showcase"
          title="Selected Projects"
          subtitle="Click any card to see the full story."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const carouselImages = p.project_images?.length ? p.project_images : p.images;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className="glass card-hover group overflow-hidden rounded-2xl text-left"
              >
                <div className="relative aspect-video overflow-hidden">
                  {p.cover_image ? (
                    <img
                      src={p.cover_image}
                      alt={p.title}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/30 to-accent/30" />
                  )}
                  {/* Image count badge */}
                  {carouselImages.length > 0 && (
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                      <Images className="h-3 w-3" /> {carouselImages.length}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {getTechArray(p.technologies).slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs">
                    {p.live_url && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <ExternalLink className="h-3 w-3" /> Live
                      </span>
                    )}
                    {p.linkedin_video_url && (
                      <span className="inline-flex items-center gap-1 text-[#0A66C2]">
                        <Linkedin className="h-3 w-3" /> Walkthrough
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Project Modal — enhanced carousel + LinkedIn video link
   ────────────────────────────────────────────────────────────────────────── */

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  // Use project_images first, fall back to images array, then cover_image
  const carouselImages = project.project_images?.length
    ? project.project_images
    : project.images.length
      ? project.images
      : project.cover_image
        ? [project.cover_image]
        : [];

  const [idx, setIdx] = useState(0);

  const prev = useCallback(
    () => setIdx((i) => (i - 1 + carouselImages.length) % carouselImages.length),
    [carouselImages.length],
  );
  const next = useCallback(
    () => setIdx((i) => (i + 1) % carouselImages.length),
    [carouselImages.length],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-strong relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl shadow-glow animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 backdrop-blur transition-transform hover:scale-110"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Image Carousel ──────────────────────────────────────────────── */}
        {carouselImages.length > 0 && (
          <div className="relative aspect-video overflow-hidden rounded-t-3xl select-none bg-black/80 dark:bg-black">
            {/* Images */}
            <div className="relative h-full w-full">
              {carouselImages.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${project.title} — image ${i + 1}`}
                  className={`absolute inset-0 h-full w-full object-contain transition-all duration-500 ${
                    i === idx
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-[1.02] pointer-events-none"
                  }`}
                />
              ))}
            </div>

            {/* Gradient overlay for controls */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Prev / Next (only shown when multiple images) */}
            {carouselImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                  {carouselImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        i === idx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                {/* Counter badge */}
                <span className="absolute top-3 right-12 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {idx + 1} / {carouselImages.length}
                </span>
              </>
            )}
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="space-y-5 p-6 md:p-8">
          <div>
            <h3 className="text-2xl font-bold md:text-3xl">{project.title}</h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {getTechArray(project.technologies).map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="whitespace-pre-line leading-relaxed text-sm">{project.description}</p>

          {/* ── LinkedIn Walkthrough Video Link ──────────────────────────── */}
          {project.linkedin_video_url && (
            <a
              href={formatExternalUrl(project.linkedin_video_url)}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center gap-3 rounded-2xl border border-[#0A66C2]/40 bg-[#0A66C2]/10 px-5 py-4 transition-all hover:border-[#0A66C2]/70 hover:bg-[#0A66C2]/20 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-md transition-transform group-hover:scale-110">
                <Linkedin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#0A66C2]">View Walkthrough Video</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  To view the walkthrough video please visit my LinkedIn post →
                </p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-[#0A66C2] opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          )}

          {/* ── Action Buttons ───────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.live_url && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={formatExternalUrl(project.live_url)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:scale-[1.03] transition-transform"
              >
                <ExternalLink className="h-4 w-4" /> View Live
              </a>
            )}

            {project.github_url && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={formatExternalUrl(project.github_url)}
                className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold hover:scale-[1.03] transition-transform"
              >
                <Github className="h-4 w-4" /> Source
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
