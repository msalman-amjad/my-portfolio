import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAcademics, fetchProfile, fetchSkills, fetchWorkExperience } from "@/lib/portfolio";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cv")({
  head: () => ({
    meta: [{ title: "CV / Resume" }, { name: "description", content: "Professional CV" }],
  }),
  component: CVPage,
});

const parseSkillName = (name: string) => {
  const trimmed = name.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
    } catch {
      // ignore JSON parse error
    }
  }
  return name;
};

function CVPage() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const academics = useQuery({ queryKey: ["academics"], queryFn: fetchAcademics });
  const work = useQuery({ queryKey: ["work"], queryFn: fetchWorkExperience });
  const skills = useQuery({ queryKey: ["skills"], queryFn: fetchSkills });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      // 820px gives a little breathing room for the 800px CV
      if (width < 820) {
        setScale(width / 820);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const loading =
    profile.isLoading || academics.isLoading || work.isLoading || skills.isLoading;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const p = profile.data;
  if (!p) {
    return <div className="p-8 text-center">No profile data available.</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-8 font-sans print:bg-white print:py-0">
      {/* Non-printable controls */}
      <div className="mx-auto max-w-4xl px-4 mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Portfolio
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
        >
          <Printer className="h-4 w-4" /> Print / Download PDF
        </button>
      </div>

      {/* A4 CV Container Wrapper – scales down on mobile, full size on desktop */}
      <div
        className="w-full flex justify-center overflow-hidden"
        style={{
          height: scale < 1 ? `calc(297mm * ${scale})` : undefined,
        }}
      >
        <div
          className="origin-top"
          style={{
            transform: `scale(${scale})`,
            width: "800px",
            transformOrigin: "top center",
          }}
        >
          <div className="w-full min-h-[297mm] bg-white text-black p-[20mm] shadow-lg print:shadow-none print:p-0">
        {/* Header */}
        <header className="border-b-2 border-neutral-200 pb-6 mb-6">
          <div className="flex flex-row gap-8 items-center">
            {p?.avatar_url && (
              <img
                src={p.avatar_url}
                alt="Profile"
                className="w-32 h-32 shrink-0 rounded-full object-cover border border-neutral-200"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 uppercase">
                {p?.full_name ?? "Name"}
              </h1>
              <h2 className="text-xl text-neutral-600 mt-2 font-medium">{p?.title ?? ""}</h2>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
                {p?.email && <span>{p.email}</span>}
                {p?.phone && <span>{p.phone}</span>}
                {p?.linkedin_url && (
                  <a
                    href={p.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-blue-600 dark:text-blue-500"
                  >
                    {p.linkedin_url}
                  </a>
                )}
              </div>
            </div>
          </div>
          {p?.bio && <p className="mt-6 text-neutral-700 leading-relaxed text-sm">{p.bio}</p>}
        </header>

        {/* Academics (Education) */}
        {academics.data && academics.data.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-1">
              Education
            </h3>
            <div className="space-y-6">
              {academics.data.map((acad) => (
                <div key={acad?.id} className="flex flex-row justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-neutral-800">{acad?.degree ?? ""}</h4>
                    <p className="text-sm text-neutral-600">{acad?.institution ?? ""}</p>
                    {acad?.cgpa && (
                      <p className="text-sm font-medium text-neutral-700 mt-0.5">
                        {acad?.score_type === "Grade" ? "Grade" : "CGPA"}: {acad.cgpa}
                      </p>
                    )}
                    {acad?.achievements && (
                      <p className="text-sm text-neutral-500 mt-1">{acad.achievements}</p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-neutral-500 whitespace-nowrap ml-4 text-right">
                    {acad?.is_ongoing
                      ? `${acad?.start_date ?? ""} - Present (Expected: ${acad?.end_date ?? ""})`
                      : `${acad?.start_date ?? ""} - ${acad?.end_date ?? ""}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Work Experience */}
        {work.data && work.data.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-1">
              Work Experience
            </h3>
            <div className="space-y-6">
              {work.data.map((w) => (
                <div key={w?.id} className="flex flex-row justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-neutral-800">{w?.job_title ?? ""}</h4>
                    <p className="text-sm font-medium text-neutral-600 mb-2">{w?.company ?? ""}</p>
                    {w?.description && (
                      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                        {w.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-neutral-500 whitespace-nowrap ml-4 text-right">
                    {w?.is_ongoing
                      ? `${w?.start_date ?? ""} - Present`
                      : `${w?.start_date ?? ""} - ${w?.end_date ?? ""}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.data && skills.data.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-1">
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.data.map((skill) => {
                const displayName = skill?.name ? parseSkillName(skill.name) : "";
                if (!displayName) return null;
                return (
                  <span
                    key={skill?.id}
                    className="text-sm bg-neutral-100 text-neutral-800 px-3 py-1 rounded-md border border-neutral-200"
                  >
                    {displayName}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Languages */}
        {p?.languages && p.languages.length > 0 && (
          <section className="mt-8">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-1">
              Languages
            </h3>
            <div className="flex flex-col w-[45%] max-w-[400px] space-y-4">
              {[...p.languages]
                .sort((a, b) => {
                  if (a?.proficiency?.toLowerCase() === "native") return -1;
                  if (b?.proficiency?.toLowerCase() === "native") return 1;
                  return 0;
                })
                .map((lang, idx) => (
                  <div key={idx} className="w-full">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-800">
                        {lang?.name ?? ""}{" "}
                        <span className="text-neutral-600 font-normal ml-1">
                          — {lang?.proficiency ?? ""}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {lang?.percentage ?? 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 border border-neutral-300">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out print:color-adjust-exact print:bg-primary"
                        style={{ width: `${lang?.percentage ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
