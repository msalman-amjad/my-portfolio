import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAcademics, fetchProfile, fetchProjects, fetchSkills, fetchWorkExperience } from "@/lib/portfolio";
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
  const projects = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  const loading =
    profile.isLoading || academics.isLoading || work.isLoading || skills.isLoading || projects.isLoading;

  // Featured-only filtered arrays
  const featuredWork = (work.data ?? []).filter((w) => w.is_featured_cv === true);
  const featuredProjects = (projects.data ?? []).filter((p) => p.is_featured_cv === true);

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

      {/* A4 CV Sheet — max-w mirrors A4 width (794px @ 96dpi), centered with shadow */}
      <div className="mx-auto max-w-[794px] w-full px-4 pb-12 print:px-0 print:pb-0 overflow-x-hidden print:max-w-[800px] print:mx-auto">
        <div className="bg-white text-black shadow-xl rounded-sm px-6 py-8 md:px-12 md:py-10 print:shadow-none print:px-[15mm] print:py-[15mm] print:rounded-none print:tracking-normal print:leading-relaxed">

        {/* Header */}
        <header className="border-b-2 border-neutral-200 pb-3 mb-4 print:break-inside-avoid">
          <div className="flex flex-row gap-4 sm:gap-6 items-center">
            {p?.avatar_url && (
              <img
                src={p.avatar_url}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full object-cover border border-neutral-200"
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 uppercase break-words">
                {p?.full_name ?? "Name"}
              </h1>
              <h2 className="text-lg sm:text-xl text-neutral-600 mt-1 font-medium break-words">{p?.title ?? ""}</h2>

              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-500">
                {p?.email && <span>{p.email}</span>}
                {p?.phone && <span>{p.phone}</span>}
                {p?.linkedin_url && (
                  <a
                    href={p.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-blue-600 dark:text-blue-500 break-all"
                  >
                    {p.linkedin_url}
                  </a>
                )}
              </div>
            </div>
          </div>
          {p?.bio && <p className="mt-3 text-neutral-700 leading-relaxed text-sm">{p.bio}</p>}
        </header>

        {/* Academics (Education) */}
        {academics.data && academics.data.length > 0 && (
          <section className="mb-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-2 border-b border-neutral-200 pb-1">
              Education
            </h3>
            <div className="space-y-3">
              {academics.data.map((acad) => (
                <div key={acad?.id} className="flex flex-row justify-between gap-4 print:break-inside-avoid">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-neutral-800 break-words">{acad?.degree ?? ""}</h4>
                    <p className="text-sm text-neutral-600 break-words">{acad?.institution ?? ""}</p>
                    {acad?.cgpa && (
                      <p className="text-sm font-medium text-neutral-700 mt-0.5">
                        {acad?.score_type === "Grade" ? "Grade" : "CGPA"}: {acad.cgpa}
                      </p>
                    )}
                    {acad?.achievements && (
                      <p className="text-sm text-neutral-500 mt-0.5 break-words">{acad.achievements}</p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-neutral-500 whitespace-normal break-words shrink-0 text-right max-w-[40%]">
                    {acad?.is_ongoing
                      ? `${acad?.start_date ?? ""} - Present (Expected: ${acad?.end_date ?? ""})`
                      : `${acad?.start_date ?? ""} - ${acad?.end_date ?? ""}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Work Experience — only featured entries */}
        {featuredWork.length > 0 && (
          <section className="mb-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-2 border-b border-neutral-200 pb-1">
              Work Experience
            </h3>
            <div className="space-y-3">
              {featuredWork.map((w) => (
                <div key={w?.id} className="flex flex-row justify-between gap-4 print:break-inside-avoid">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-neutral-800 break-words">{w?.job_title ?? ""}</h4>
                    <p className="text-sm font-medium text-neutral-600 mb-1 break-words">{w?.company ?? ""}</p>
                    {(w?.cv_description || w?.description) && (
                      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line break-words">
                        {w.cv_description || w.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-neutral-500 whitespace-normal break-words shrink-0 text-right max-w-[40%]">
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
          <section className="mb-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-2 border-b border-neutral-200 pb-1">
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

        {/* Projects — only featured entries */}
        {featuredProjects.length > 0 && (
          <section className="mb-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-2 border-b border-neutral-200 pb-1">
              Projects
            </h3>
            <div className="space-y-3">
              {featuredProjects.map((proj) => (
                <div key={proj?.id} className="flex flex-row justify-between gap-4 print:break-inside-avoid">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-neutral-800 break-words">{proj?.title ?? ""}</h4>
                    {(proj?.cv_description || proj?.description) && (
                      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line break-words">
                        {proj.cv_description || proj.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {p?.languages && p.languages.length > 0 && (
          <section className="mt-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-2 border-b border-neutral-200 pb-1">
              Languages
            </h3>
            <div className="flex flex-col w-[45%] max-w-[400px] space-y-3">
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
                    <div 
                      className="h-2 w-full overflow-hidden rounded-full border border-neutral-300"
                      style={{ 
                        backgroundColor: "#e5e5e5",
                        WebkitPrintColorAdjust: "exact", 
                        printColorAdjust: "exact" 
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out print:shadow-[inset_0_0_0_1000px_#9b87f5]"
                        style={{ 
                          width: `${lang?.percentage ?? 0}%`,
                          background: "linear-gradient(to right, #9b87f5, #7E69AB)",
                          backgroundColor: "#9b87f5", // fallback
                          WebkitPrintColorAdjust: "exact", 
                          printColorAdjust: "exact" 
                        }}
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
  );
}
