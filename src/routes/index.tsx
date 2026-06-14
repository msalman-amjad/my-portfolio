import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Header } from "@/components/portfolio/Header";
import { Hero } from "@/components/portfolio/Hero";
import {
  EducationSection,
  ProjectsSection,
  SkillsSection,
  LanguagesSection,
  WorkExperienceSection,
} from "@/components/portfolio/Sections";
import { Footer } from "@/components/portfolio/Footer";
import { fetchAcademics, fetchProfile, fetchProjects, fetchSkills, fetchWorkExperience } from "@/lib/portfolio";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Muhammad Salman | Portfolio" },
      {
        name: "description",
        content: "Personal portfolio: selected projects, skills, and how to get in touch.",
      },
      { property: "og:title", content: "Muhammad Salman | Portfolio" },
      {
        property: "og:description",
        content: "Selected projects, skills, and ways to collaborate.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const academics = useQuery({ queryKey: ["academics"], queryFn: fetchAcademics });
  const work = useQuery({ queryKey: ["work"], queryFn: fetchWorkExperience });
  const skills = useQuery({ queryKey: ["skills"], queryFn: fetchSkills });
  const projects = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  // Show toast when any query fails – generic message, no raw DB error exposed
  useEffect(() => {
    if (profile.isError)
      toast.error("Failed to load portfolio data. Please check your connection.");
  }, [profile.isError]);

  if (profile.isLoading || (!profile.data && !profile.isError)) {
    return (
      <div className="flex min-h-screen items-center justify-center hero-bg">
        <div className="glass rounded-2xl px-6 py-4 text-sm text-muted-foreground">
          Loading portfolio…
        </div>
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <div className="flex min-h-screen items-center justify-center hero-bg px-4">
        <div className="glass-strong max-w-sm rounded-3xl p-8 text-center space-y-3">
          <p className="text-lg font-bold">Unable to load portfolio</p>
          <p className="text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => profile.refetch()}
            className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:scale-[1.02] transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero profile={profile.data} />
        <EducationSection items={academics.data ?? []} />
        <SkillsSection skills={skills.data ?? []} />
        <WorkExperienceSection items={work.data ?? []} />
        <ProjectsSection projects={projects.data ?? []} />
        <LanguagesSection languages={profile.data.languages ?? []} />
      </main>
      <Footer profile={profile.data} />
    </div>
  );
}
