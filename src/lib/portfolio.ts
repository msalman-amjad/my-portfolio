import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  roles: string | string[];
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  cv_url: string | null;
  avatar_url: string | null;
  languages: { name: string; proficiency: string; percentage: number }[] | null;
};

export type Academic = {
  id: string;
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
  is_ongoing?: boolean;
  score_type?: "CGPA" | "Grade" | null;
  cgpa: string | null;
  achievements: string | null;
  sort_order: number;
};

export type WorkExperience = {
  id: string;
  job_title: string;
  company: string;
  start_date: string;
  end_date: string;
  is_ongoing?: boolean;
  description: string | null;
  sort_order: number;
};

export type Skill = {
  id: string;
  name: string;
  created_at?: string;
};

export type Category = {
  id: string;
  name: string;
  created_at?: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  images: string[];
  project_images: string[];
  technologies: string[];
  live_url: string | null;
  github_url: string | null;
  video_url: string | null;
  linkedin_video_url: string | null;
  sort_order: number;
  category_id: string | null;
  category?: { name: string } | null;
};

export async function fetchProfile(): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from("profile" as never)
      .select("*")
      .limit(1)
      .single();
    if (error) throw error;
    return data as unknown as Profile;
  } catch {
    throw new Error("Failed to load profile. Please check your connection.");
  }
}

export async function fetchAcademics(): Promise<Academic[]> {
  try {
    const { data, error } = await supabase
      .from("academics" as never)
      .select("*");
    if (error) throw error;
    return (data as unknown as Academic[]) ?? [];
  } catch {
    throw new Error("Failed to load education data. Please check your connection.");
  }
}

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const { data, error } = await supabase
      .from("skills" as never)
      .select("*");
    if (error) throw error;
    return (data as unknown as Skill[]) ?? [];
  } catch {
    throw new Error("Failed to load skills. Please check your connection.");
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from("projects" as never)
      .select("*, category:categories(name)");
    if (error) throw error;
    return (data as unknown as Project[]) ?? [];
  } catch {
    throw new Error("Failed to load projects. Please check your connection.");
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories" as never)
      .select("*")
      .order("name");
    if (error) throw error;
    return (data as unknown as Category[]) ?? [];
  } catch {
    throw new Error("Failed to load categories. Please check your connection.");
  }
}

export async function fetchWorkExperience(): Promise<WorkExperience[]> {
  try {
    const { data, error } = await supabase
      .from("work_experience" as never)
      .select("*");
    if (error) throw error;
    return (data as unknown as WorkExperience[]) ?? [];
  } catch {
    throw new Error("Failed to load work experience. Please check your connection.");
  }
}
