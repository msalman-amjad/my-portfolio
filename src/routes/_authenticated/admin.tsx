import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Sparkles,
  FolderKanban,
  LogOut,
  Loader2,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  ArrowLeft,
  KeyRound,
  Upload,
  Image,
  Briefcase,
  CalendarIcon,
  GripVertical,
  Tags,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchAcademics, fetchProfile, fetchProjects, fetchSkills, fetchWorkExperience, fetchCategories } from "@/lib/portfolio";
import type { Academic, Profile, Project, Skill, WorkExperience, Category } from "@/lib/portfolio";
import { toast } from "sonner";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin Dashboard | Muhammad Salman" }],
  }),
});

type Tab = "profile" | "work" | "academics" | "skills" | "projects" | "categories" | "password";

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const mounted = useRef(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: u, error: userError } = await supabase.auth.getUser();
        console.log("[Admin] getUser result:", u?.user?.id ?? "NO USER", "| error:", userError);
        if (!u.user) {
          setIsAdmin(false);
          return;
        }

        const { data: roleData, error: roleError } = await supabase
          .from("user_roles" as never)
          .select("role")
          .eq("user_id", u.user.id);

        console.log("[Admin] user_roles query result:", roleData, "| error:", roleError);

        const roles = (roleData as unknown as { role: string }[]) ?? [];
        const hasAdminRole = roles.some((r) => r.role === "admin");

        // Fallback: if no rows exist yet (table empty / no role assigned),
        // allow any authenticated user through so a fresh setup isn't blocked.
        const noRolesConfigured = roles.length === 0;
        console.log(
          "[Admin] hasAdminRole:",
          hasAdminRole,
          "| noRolesConfigured (fallback):",
          noRolesConfigured,
        );

        if (!mounted.current) return;
        setIsAdmin(hasAdminRole || noRolesConfigured);
      } catch (err) {
        console.error("[Admin] role check error:", err);
        if (mounted.current) setIsAdmin(false);
      }
    })();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore sign-out errors
    }
    navigate({ to: "/auth", replace: true });
  };

  if (!isMounted) {
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center hero-bg px-4">
        <div className="glass-strong max-w-md rounded-3xl p-8 text-center">
          <h2 className="text-xl font-bold">No admin access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in but does not have admin privileges.
          </p>
          <button
            onClick={signOut}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const items: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "work", label: "Work Experience", icon: Briefcase },
    { id: "academics", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Sparkles },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "password", label: "Change Password", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen hero-bg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row">
        <aside className="glass-strong h-fit rounded-2xl p-4 md:sticky md:top-6 md:w-64">
          <div className="mb-4 flex items-center gap-2 px-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="font-bold">Admin</h1>
          </div>
          <nav className="space-y-1">
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  tab === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
          <div className="mt-4 space-y-1 border-t border-border/50 pt-4">
            <a
              href="/"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> View site
            </a>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        <section className="glass-strong flex-1 rounded-2xl p-6">
          {tab === "profile" && <ProfileForm />}
          {tab === "work" && <WorkExperienceManager />}
          {tab === "academics" && <AcademicsManager />}
          {tab === "skills" && <SkillsManager />}
          {tab === "categories" && <CategoriesManager />}
          {tab === "projects" && <ProjectsManager />}
          {tab === "password" && <ChangePasswordForm />}
        </section>
      </div>
    </div>
  );
}

/* ---------------- File Upload Helper ---------------- */

function ImageUpload({
  onUpload,
  multiple = false,
}: {
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setUploading(true);

      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio-media")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("portfolio-media").getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }

      onUpload(newUrls);
    } catch (error: any) {
      toast.error(error.message || "Error uploading image");
    } finally {
      if (mounted.current) setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2 hover:bg-secondary transition-colors">
      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      <span className="text-sm font-medium">
        {uploading ? "Uploading..." : multiple ? "Upload Images" : "Upload Image"}
      </span>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
    </label>
  );
}

/* ---------------- Profile ---------------- */

const profileSchema = z.object({
  full_name: z.string().trim().max(120).optional(),
  title: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  roles: z.string().max(500).optional(),
  email: z.string().email().max(255).or(z.literal("")).optional(),
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(120).optional(),
  github_url: z.string().url().max(500).or(z.literal("")).optional(),
  linkedin_url: z.string().url().max(500).or(z.literal("")).optional(),
  avatar_url: z.string().url().max(500).or(z.literal("")).optional(),
  languages: z.any().optional(),
});

function ProfileForm() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const [form, setForm] = useState<Partial<Profile> & { rolesText?: string }>({});
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (data && !isInitialized) {
      let rolesText = "";
      if (typeof data.roles === "string") {
        rolesText = data.roles.replace(/[[\]"]/g, "");
      } else if (Array.isArray(data.roles)) {
        rolesText = data.roles.join(", ").replace(/[[\]"]/g, "");
      }

      setForm({
        id: data.id,
        full_name: data.full_name || "",
        title: data.title || "",
        bio: data.bio || "",
        rolesText: rolesText || "",
        email: data.email || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        avatar_url: data.avatar_url || "",
        languages: data.languages || [],
      });
      setIsInitialized(true);
    }
  }, [data, isInitialized]);

  if (!data)
    return <Loader2 className="mx-auto my-12 h-6 w-6 animate-spin text-muted-foreground" />;

  const save = async () => {
    setSaving(true);
    try {
      const rolesArray = (form.rolesText || "")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const payload = {
        full_name: form.full_name || "",
        title: form.title || "",
        bio: form.bio || "",
        roles: rolesArray,
        email: form.email || "",
        phone: form.phone || "",
        whatsapp: form.whatsapp || "",
        github_url: form.github_url || "",
        linkedin_url: form.linkedin_url || "",
        avatar_url: form.avatar_url || "",
        languages: form.languages || [],
      };

      const updatePayload = {
        full_name: form.full_name || "",
        title: form.title || "",
        bio: form.bio || "",
        roles: rolesArray,
        email: form.email || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        github_url: form.github_url || null,
        linkedin_url: form.linkedin_url || null,
        avatar_url: form.avatar_url || null,
        languages: form.languages || [],
      };

      const { error } = await supabase
        .from("profile" as never)
        .update(updatePayload as never)
        .eq("id", data.id);

      if (error) throw error;
      
      // Force fresh fetch for true UI synchronization
      const { data: freshData, error: fetchError } = (await supabase
        .from("profile" as never)
        .select("*")
        .eq("id", data.id)
        .single()) as { data: any; error: any };
        
      if (!fetchError && freshData) {
        let rolesText = "";
        if (typeof freshData.roles === "string") {
          rolesText = freshData.roles.replace(/[[\]"]/g, "");
        } else if (Array.isArray(freshData.roles)) {
          rolesText = freshData.roles.join(", ").replace(/[[\]"]/g, "");
        }
        setForm({
          id: freshData.id,
          full_name: freshData.full_name || "",
          title: freshData.title || "",
          bio: freshData.bio || "",
          rolesText: rolesText || "",
          email: freshData.email || "",
          phone: freshData.phone || "",
          whatsapp: freshData.whatsapp || "",
          github_url: freshData.github_url || "",
          linkedin_url: freshData.linkedin_url || "",
          avatar_url: freshData.avatar_url || "",
          languages: freshData.languages || [],
        });
      }

      toast.success("Profile updated");
      // Don't reset isInitialized — freshData already synced the form above
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch {
      toast.error("Update failed, please check your connection.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Header title="Profile & Contact" desc="Update your headline, bio, and contact channels." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name">
          <Input
            value={form.full_name || ""}
            onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
          />
        </Field>
        <Field label="Headline / title">
          <Input value={form.title || ""} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
        </Field>
        <Field label="Bio" full>
          <Textarea value={form.bio || ""} onChange={(v) => setForm((f) => ({ ...f, bio: v }))} />
        </Field>
        <Field label="Typing roles (comma separated)" full>
          <Input
            value={form.rolesText || ""}
            onChange={(v) => setForm((f) => ({ ...f, rolesText: v }))}
          />
        </Field>
        <Field label="Email">
          <Input value={form.email || ""} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone || ""} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
        </Field>
        <Field label="WhatsApp number or link">
          <Input
            value={form.whatsapp || ""}
            onChange={(v) => setForm((f) => ({ ...f, whatsapp: v }))}
          />
        </Field>
        <Field label="Avatar Image">
          <div className="flex flex-col gap-2">
            {!form.avatar_url ? (
              <ImageUpload onUpload={(urls) => setForm((f) => ({ ...f, avatar_url: urls[0] }))} />
            ) : (
              <div className="flex items-center gap-4 mt-1">
                <img
                  src={form.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
                <div className="flex flex-col gap-2">
                  <ImageUpload
                    onUpload={(urls) => setForm((f) => ({ ...f, avatar_url: urls[0] }))}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_url: "" }))}
                    className="text-destructive hover:underline text-xs text-left px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </Field>
        <Field label="GitHub URL">
          <Input
            value={form.github_url || ""}
            onChange={(v) => setForm((f) => ({ ...f, github_url: v }))}
          />
        </Field>
        <Field label="LinkedIn URL">
          <Input
            value={form.linkedin_url || ""}
            onChange={(v) => setForm((f) => ({ ...f, linkedin_url: v }))}
          />
        </Field>
        <div className="md:col-span-2 space-y-2 mt-2 border-t border-border pt-4">
          <label className="block text-xs font-medium text-muted-foreground">Languages</label>
          <div className="grid gap-2">
            {(form.languages || []).map((lang, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={lang.name}
                  onChange={(v) => {
                    const n = [...(form.languages || [])];
                    n[idx].name = v;
                    setForm((f) => ({ ...f, languages: n }));
                  }}
                  placeholder="Language (e.g. English)"
                />
                <Input
                  value={lang.proficiency}
                  onChange={(v) => {
                    const n = [...(form.languages || [])];
                    n[idx].proficiency = v;
                    setForm((f) => ({ ...f, languages: n }));
                  }}
                  placeholder="Proficiency (e.g. Native)"
                />
                <Input
                  value={String(lang.percentage)}
                  onChange={(v) => {
                    const n = [...(form.languages || [])];
                    n[idx].percentage = Number(v) || 0;
                    setForm((f) => ({ ...f, languages: n }));
                  }}
                  placeholder="% (0-100)"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      languages: (f.languages || []).filter((_, i) => i !== idx),
                    }))
                  }
                  className="text-destructive font-bold px-3 py-2 bg-background/60 border border-border hover:bg-destructive/10 rounded-xl"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  languages: [...(f.languages || []), { name: "", proficiency: "", percentage: 0 }],
                }))
              }
              className="text-sm text-primary font-medium w-max px-3 py-1.5 rounded-lg hover:bg-primary/10 border border-primary/20"
            >
              + Add Language
            </button>
          </div>
        </div>
      </div>
      <SaveBar onClick={save} loading={saving} />
    </div>
  );
}

/* ---------------- Work Experience ---------------- */

function WorkExperienceManager() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["work"], queryFn: fetchWorkExperience });
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <Header
        title="Work Experience"
        desc="Manage your professional experience."
        action={<AddBtn onClick={() => setIsAdding(true)} disabled={isAdding} />}
      />
      <div className="space-y-3">
        {isAdding && (
          <WorkExperienceRow
            item={{
              id: "new",
              job_title: "",
              company: "",
              start_date: "",
              end_date: "",
              is_ongoing: false,
              description: "",
              sort_order: data.length + 1,
            }}
            onCancel={() => setIsAdding(false)}
            isNew={true}
          />
        )}
        {data.map((a) => (
          <WorkExperienceRow key={a.id} item={a} />
        ))}
        {data.length === 0 && !isAdding && <Empty label="No entries yet" />}
      </div>
    </div>
  );
}

function WorkExperienceRow({
  item,
  onCancel,
  isNew,
}: {
  item: WorkExperience;
  onCancel?: () => void;
  isNew?: boolean;
}) {
  const qc = useQueryClient();
  const [f, setF] = useState(item);
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const save = async () => {
    if (!(f.job_title || "").trim() || !(f.company || "").trim() || !(f.start_date || "").trim()) {
      return toast.error("Job title, company, and start date are required");
    }
    setSaving(true);
    try {
      const payload = {
        job_title: f.job_title,
        company: f.company,
        start_date: f.start_date,
        end_date: f.end_date,
        is_ongoing: f.is_ongoing || false,
        description: f.description || null,
      };
      console.log("WorkExperience Payload:", payload);
      if (isNew) {
        const { error } = await supabase.from("work_experience" as never).insert(payload as never);
        if (error) throw error;
        if (onCancel) onCancel();
      } else {
        const { error } = await supabase
          .from("work_experience" as never)
          .update(payload as never)
          .eq("id", item.id);
        if (error) throw error;
      }
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["work"] });
    } catch {
      toast.error("Failed to save, please check your connection.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const remove = async () => {
    if (isNew) {
      if (onCancel) onCancel();
      return;
    }
    if (!confirm("Delete entry?")) return;
    try {
      const { error } = await supabase.from("work_experience" as never).delete().eq("id", item.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["work"] });
    } catch {
      toast.error("Delete failed, please check your connection.");
    }
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input
          value={f.job_title || ""}
          onChange={(v) => setF({ ...f, job_title: v })}
          placeholder="Job Title"
        />
        <Input
          value={f.company || ""}
          onChange={(v) => setF({ ...f, company: v })}
          placeholder="Company"
        />
        <div className="flex flex-col gap-2">
          <MonthYearPicker
            value={f.start_date || ""}
            onChange={(v) => setF({ ...f, start_date: v })}
            placeholder="Select Start Date"
          />
        </div>
        <div className="flex flex-col gap-2">
          <MonthYearPicker
            value={f.end_date || ""}
            onChange={(v) => setF({ ...f, end_date: v })}
            placeholder={f.is_ongoing ? "Expected End Date" : "Select End Date"}
          />
          <div className="flex items-center space-x-2 mt-1">
            <Checkbox
              id={`ongoing-work-${item.id}`}
              checked={f.is_ongoing || false}
              onCheckedChange={(c) => setF({ ...f, is_ongoing: !!c })}
            />
            <label
              htmlFor={`ongoing-work-${item.id}`}
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ongoing / Currently Working
            </label>
          </div>
        </div>
      </div>
      <Textarea
        value={f.description ?? ""}
        onChange={(v) => setF({ ...f, description: v })}
        placeholder="Description"
        className="mt-3"
      />
      <RowActions onSave={save} onDelete={remove} saving={saving} />
    </div>
  );
}

/* ---------------- Academics ---------------- */

function AcademicsManager() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["academics"], queryFn: fetchAcademics });
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <Header
        title="Education"
        desc="Manage your academic timeline."
        action={<AddBtn onClick={() => setIsAdding(true)} disabled={isAdding} />}
      />
      <div className="space-y-3">
        {isAdding && (
          <AcademicRow
            item={{
              id: "new",
              degree: "",
              institution: "",
              start_date: "",
              end_date: "",
              cgpa: "",
              achievements: "",
              sort_order: data.length + 1,
            }}
            onCancel={() => setIsAdding(false)}
            isNew={true}
          />
        )}
        {data.map((a) => (
          <AcademicRow key={a.id} item={a} />
        ))}
        {data.length === 0 && !isAdding && <Empty label="No entries yet" />}
      </div>
    </div>
  );
}

function AcademicRow({
  item,
  onCancel,
  isNew,
}: {
  item: Academic;
  onCancel?: () => void;
  isNew?: boolean;
}) {
  const qc = useQueryClient();
  const [f, setF] = useState(item);
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const save = async () => {
    if (
      !(f.degree || "").trim() ||
      !(f.institution || "").trim() ||
      !(f.start_date || "").trim() ||
      !(f.end_date || "").trim()
    ) {
      return toast.error("Degree, institution, start date and end date are required");
    }
    setSaving(true);
    try {
      const payload = {
        degree: f.degree,
        institution: f.institution,
        start_date: f.start_date,
        end_date: f.end_date,
        is_ongoing: f.is_ongoing || false,
        score_type: f.score_type || "CGPA",
        cgpa: f.cgpa || null,
        achievements: f.achievements,
      };
      console.log("Academics Payload:", payload);
      if (isNew) {
        const { error } = await supabase.from("academics" as never).insert(payload as never);
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        if (onCancel) onCancel();
      } else {
        const { error } = await supabase
          .from("academics" as never)
          .update(payload as never)
          .eq("id", item.id);
        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
      }
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["academics"] });
    } catch {
      toast.error("Failed to save, please check your connection.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const remove = async () => {
    if (isNew) {
      if (onCancel) onCancel();
      return;
    }
    if (!confirm("Delete entry?")) return;
    try {
      const { error } = await supabase
        .from("academics" as never)
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["academics"] });
    } catch {
      toast.error("Delete failed, please check your connection.");
    }
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input
          value={f.degree || ""}
          onChange={(v) => setF({ ...f, degree: v })}
          placeholder="Degree"
        />
        <Input
          value={f.institution || ""}
          onChange={(v) => setF({ ...f, institution: v })}
          placeholder="Institution"
        />
        <div className="flex flex-col gap-2">
          <MonthYearPicker
            value={f.start_date || ""}
            onChange={(v) => setF({ ...f, start_date: v })}
            placeholder="Select Start Date"
          />
        </div>
        <div className="flex flex-col gap-2">
          <MonthYearPicker
            value={f.end_date || ""}
            onChange={(v) => setF({ ...f, end_date: v })}
            placeholder={f.is_ongoing ? "Expected End Date" : "Select End Date"}
          />
          <div className="flex items-center space-x-2 mt-1">
            <Checkbox
              id={`ongoing-${item.id}`}
              checked={f.is_ongoing || false}
              onCheckedChange={(c) => setF({ ...f, is_ongoing: !!c })}
            />
            <label
              htmlFor={`ongoing-${item.id}`}
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ongoing / Currently Enrolled
            </label>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col md:flex-row gap-4 md:items-center">
        <RadioGroup
          value={f.score_type || "CGPA"}
          onValueChange={(v: "CGPA" | "Grade") => setF({ ...f, score_type: v })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="CGPA" id={`cgpa-${item.id}`} />
            <Label htmlFor={`cgpa-${item.id}`}>CGPA</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Grade" id={`grade-${item.id}`} />
            <Label htmlFor={`grade-${item.id}`}>Grade</Label>
          </div>
        </RadioGroup>
        <Input
          value={f.cgpa || ""}
          onChange={(v) => setF({ ...f, cgpa: v })}
          placeholder={f.score_type === "Grade" ? "e.g., A+" : "e.g., 3.8"}
          className="max-w-[200px]"
        />
      </div>
      <Textarea
        value={f.achievements ?? ""}
        onChange={(v) => setF({ ...f, achievements: v })}
        placeholder="Achievements (optional)"
        className="mt-3"
      />
      <RowActions onSave={save} onDelete={remove} saving={saving} />
    </div>
  );
}

/* ---------------- Skills ---------------- */

function SkillsManager() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["skills"], queryFn: fetchSkills });
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <Header
        title="Skills"
        desc="Manage technical skills and proficiency."
        action={<AddBtn onClick={() => setIsAdding(true)} disabled={isAdding} />}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {isAdding && (
          <SkillRow
            item={{ id: "new", name: "" }}
            onCancel={() => setIsAdding(false)}
            isNew={true}
          />
        )}
        {data.map((s) => (
          <SkillRow key={s.id} item={s} />
        ))}
        {data.length === 0 && !isAdding && <Empty label="No skills yet" />}
      </div>
    </div>
  );
}

function SkillRow({
  item,
  onCancel,
  isNew,
}: {
  item: Skill;
  onCancel?: () => void;
  isNew?: boolean;
}) {
  const qc = useQueryClient();
  const [f, setF] = useState(item);
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const save = async () => {
    if (!(f.name ?? "").trim()) return toast.error("Name required");
    setSaving(true);
    try {
      const payload = { name: f.name };
      console.log("Skills Payload:", payload);
      if (isNew) {
        const { error } = await supabase.from("skills" as never).insert(payload as never);
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        if (onCancel) onCancel();
      } else {
        const { error } = await supabase
          .from("skills" as never)
          .update(payload as never)
          .eq("id", item.id);
        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
      }
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["skills"] });
    } catch {
      toast.error("Failed to save, please check your connection.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const remove = async () => {
    if (isNew) {
      if (onCancel) onCancel();
      return;
    }
    if (!confirm("Delete skill?")) return;
    try {
      const { error } = await supabase
        .from("skills" as never)
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["skills"] });
    } catch {
      toast.error("Delete failed, please check your connection.");
    }
  };

  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <Input
        value={f.name ?? ""}
        onChange={(v) => setF({ ...f, name: v })}
        placeholder="Skill Name (e.g., React.js)"
      />
      <RowActions onSave={save} onDelete={remove} saving={saving} />
    </div>
  );
}

/* ---------------- Categories ---------------- */

function CategoriesManager() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <Header
        title="Categories"
        desc="Manage project categories."
        action={<AddBtn onClick={() => setIsAdding(true)} disabled={isAdding} />}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {isAdding && (
          <CategoryRow
            item={{ id: "new", name: "" }}
            onCancel={() => setIsAdding(false)}
            isNew={true}
          />
        )}
        {data.map((s) => (
          <CategoryRow key={s.id} item={s} />
        ))}
        {data.length === 0 && !isAdding && <Empty label="No categories yet" />}
      </div>
    </div>
  );
}

function CategoryRow({
  item,
  onCancel,
  isNew,
}: {
  item: Category;
  onCancel?: () => void;
  isNew?: boolean;
}) {
  const qc = useQueryClient();
  const [f, setF] = useState(item);
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const save = async () => {
    if (!(f.name ?? "").trim()) return toast.error("Name required");
    setSaving(true);
    try {
      const payload = { name: f.name };
      if (isNew) {
        const { error } = await supabase.from("categories" as never).insert(payload as never);
        if (error) throw error;
        if (onCancel) onCancel();
      } else {
        const { error } = await supabase
          .from("categories" as never)
          .update(payload as never)
          .eq("id", item.id);
        if (error) throw error;
      }
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch {
      toast.error("Failed to save, please check your connection.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const remove = async () => {
    if (isNew) {
      if (onCancel) onCancel();
      return;
    }
    if (!confirm("Delete category?")) return;
    try {
      const { error } = await supabase.from("categories" as never).delete().eq("id", item.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch {
      toast.error("Delete failed, please check your connection.");
    }
  };

  return (
    <div className="glass rounded-xl p-3 flex items-center justify-between">
      <Input
        value={f.name || ""}
        onChange={(v) => setF({ ...f, name: v })}
        placeholder="Category name"
        className="max-w-[200px]"
      />
      <RowActions onSave={save} onDelete={remove} saving={saving} />
    </div>
  );
}

/* ---------------- Projects ---------------- */

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

function ProjectsManager() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const [editing, setEditing] = useState<Project | null>(null);

  const add = () => {
    setEditing({
      id: "new",
      title: "",
      description: "",
      sort_order: data.length + 1,
      project_images: [],
      technologies: [],
      images: [],
      cover_image: null,
      live_url: null,
      github_url: null,
      video_url: null,
      linkedin_video_url: null,
      category_id: null,
    } as Project);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      const { error } = await supabase
        .from("projects" as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["projects"] });
    } catch {
      toast.error("Delete failed, please check your connection.");
    }
  };

  return (
    <div className="space-y-4">
      <Header
        title="Projects"
        desc="Full CRUD: create, edit, and remove showcase projects."
        action={<AddBtn onClick={add} />}
      />
      <div className="overflow-hidden rounded-2xl border border-border/50">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 hidden md:table-cell">Tech</th>
              <th className="px-4 py-3 hidden md:table-cell">Live</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-t border-border/50">
                <td className="px-4 py-3 font-medium">{p.title ?? ""}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {getTechArray(p.technologies).slice(0, 3).join(", ")}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {p.live_url && (
                    <a
                      href={formatExternalUrl(p.live_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary"
                    >
                      <ExternalLink className="h-3 w-3" /> Open
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(p)}
                    className="rounded-lg px-3 py-1 text-xs font-semibold hover:bg-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="rounded-lg px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editing && <ProjectEditor project={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ── Sortable image thumbnail for the drag-and-drop project images grid ── */
function SortableImageThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-video rounded-lg overflow-hidden border border-border"
    >
      <img src={url} className="w-full h-full object-cover" />

      {/* Drag handle — top-left grip */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3 w-3" />
      </button>

      {/* Delete button — top-right */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Remove image"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function ProjectEditor({ project, onClose }: { project: Project; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<
    Project & { techText: string; projectImages: string[]; imagesText: string }
  >({
    ...project,
    techText: getTechArray(project.technologies).join(", "),
    projectImages: project.project_images ?? [],
    imagesText: (project.images ?? []).join("\n"),
  });
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });


  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const save = async () => {
    if (!f.title.trim()) return toast.error("Title is required");

    setSaving(true);
    const technologies = f.techText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const legacyImages = f.imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        title: f.title,
        description: f.description || null,
        cover_image: f.cover_image || (f.projectImages[0] ?? null),
        images: legacyImages,
        project_images: f.projectImages,
        technologies,
        live_url: f.live_url || null,
        github_url: f.github_url || null,
        video_url: f.video_url || null,
        linkedin_video_url: f.linkedin_video_url || null,
        sort_order: f.sort_order,
        category_id: f.category_id || null,
      };
      console.log("Project Payload:", payload);

      if (project.id === "new") {
        const { error } = await supabase.from("projects" as never).insert(payload as never);
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("projects" as never)
          .update(payload as never)
          .eq("id", project.id);
        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
      }

      toast.success("Project saved");
      qc.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    } catch {
      toast.error("Update failed, please check your connection.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-background/70 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      {/* ── Main wrapper: flex-col, hard 85vh cap, NO overflow here ── */}
      <div
        className="glass-strong w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ① Static Header — always visible, never scrolls */}
        <div className="px-6 pt-6 pb-4 border-b border-border/30 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold">
              {project.id === "new" ? "Add Project" : "Edit Project"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only title is required. All other fields are optional.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-sm font-semibold hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ② Scrollable Body — all form fields including Title */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Title *">
            <Input value={f.title} onChange={(v) => setF({ ...f, title: v })} placeholder="Project title" />
          </Field>

          <Field label="Category (optional)">
            <select
              value={f.category_id || ""}
              onChange={(e) => setF({ ...f, category_id: e.target.value })}
              className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cover Image (optional)" full>
            <div className="flex flex-col gap-2">
              <ImageUpload
                onUpload={(urls) => setF((prev) => ({ ...prev, cover_image: urls[0] }))}
              />
              {f.cover_image && (
                <div className="flex items-center gap-2 mt-1 rounded-xl border border-border p-2">
                  <img src={f.cover_image} alt="Cover" className="h-10 w-10 rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => setF((prev) => ({ ...prev, cover_image: "" }))}
                    className="text-destructive hover:underline text-xs p-1 ml-auto"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </Field>

          <Field label="Full description (optional)" full>
            <Textarea
              value={f.description ?? ""}
              onChange={(v) => setF({ ...f, description: v })}
              rows={5}
              placeholder="Detailed project description"
            />
          </Field>

          <Field label="Technologies (comma separated, optional)" full>
            <Input
              value={f.techText}
              onChange={(v) => setF({ ...f, techText: v })}
              placeholder="React, TypeScript, Supabase…"
            />
          </Field>

          {/* Project Images — optional, drag-to-reorder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Project Images{" "}
                <span className="text-muted-foreground/60">(Optional — drag to reorder)</span>
              </span>
              {f.projectImages.length > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold">
                  {f.projectImages.length} uploaded
                </span>
              )}
            </div>
            <ImageUpload
              multiple
              onUpload={(urls) =>
                setF((prev) => ({ ...prev, projectImages: [...prev.projectImages, ...urls] }))
              }
            />
            {f.projectImages.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    setF((prev) => {
                      const oldIndex = prev.projectImages.indexOf(active.id as string);
                      const newIndex = prev.projectImages.indexOf(over.id as string);
                      return { ...prev, projectImages: arrayMove(prev.projectImages, oldIndex, newIndex) };
                    });
                  }
                }}
              >
                <SortableContext items={f.projectImages} strategy={rectSortingStrategy}>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {f.projectImages.map((url) => (
                      <SortableImageThumb
                        key={url}
                        url={url}
                        onRemove={() =>
                          setF((prev) => ({
                            ...prev,
                            projectImages: prev.projectImages.filter((u) => u !== url),
                          }))
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <Field label="Live URL (optional)">
            <Input
              value={f.live_url ?? ""}
              onChange={(v) => setF({ ...f, live_url: v })}
              placeholder="https://yourproject.com"
            />
          </Field>
          <Field label="GitHub URL (optional)">
            <Input
              value={f.github_url ?? ""}
              onChange={(v) => setF({ ...f, github_url: v })}
              placeholder="https://github.com/you/repo"
            />
          </Field>
          <Field label="LinkedIn Walkthrough Video URL (optional)">
            <Input
              value={f.linkedin_video_url ?? ""}
              onChange={(v) => setF({ ...f, linkedin_video_url: v })}
              placeholder="https://www.linkedin.com/posts/..."
            />
          </Field>
        </div>

        {/* ③ Static Footer — always visible, never scrolls */}
        <div className="border-t border-border/30 p-6 mt-auto flex justify-end gap-2 shrink-0 bg-background/60">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{" "}
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}



function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Strict confirmation prompt before updating password
    const confirmed = window.confirm("Are you sure you want to update your password?");
    if (!confirmed) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Password update failed. Please try again.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-md">
      <Header
        title="Change Password"
        desc="Update your admin account password. You will be prompted to confirm before any change is applied."
      />

      <div className="glass rounded-2xl p-5 space-y-4">
        <Field label="New Password">
          <input
            type="password"
            value={newPassword}
            minLength={8}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {newPassword.length > 0 && newPassword.length < 8 && (
            <p className="mt-1 text-[11px] text-destructive">
              Password must be at least 8 characters.
            </p>
          )}
        </Field>

        <Field label="Confirm New Password">
          <input
            type="password"
            value={confirmPassword}
            minLength={8}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
            <p className="mt-1 text-[11px] text-destructive">Passwords do not match.</p>
          )}
        </Field>

        <div className="pt-1 flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={saving || newPassword.length < 8 || newPassword !== confirmPassword}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Update Password
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
        <strong>Security note:</strong> A browser confirmation dialog will appear before your
        password is changed. Make sure your new password is at least 8 characters and stored
        securely.
      </div>
    </div>
  );
}

/* ---------------- UI Helpers ---------------- */

function Header({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label
      className={`block text-xs font-medium text-muted-foreground ${full ? "md:col-span-2" : ""}`}
    >
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Input({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 ${className}`}
    />
  );
}
function MonthYearPicker({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  // value is expected as "MMMM yyyy" e.g., "April 2019" or standard "yyyy-MM" fallback.
  // We'll try to parse it. If empty, date is undefined.
  let date: Date | undefined;
  if (value) {
    // Try parsing "MMMM yyyy"
    date = parse(value, "MMMM yyyy", new Date());
    if (isNaN(date.getTime())) {
      // fallback to native yyyy-MM
      const [y, m] = value.split("-");
      if (y && m) {
        date = new Date(parseInt(y), parseInt(m) - 1, 1);
      } else {
        date = undefined;
      }
    }
  }

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={`w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-left flex items-center justify-between outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 ${
            !date ? "text-muted-foreground" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {date ? format(date, "MMMM yyyy") : placeholder || "Select Date"}
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[200]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "MMMM yyyy"));
              setIsOpen(false);
            }
          }}
          initialFocus
          captionLayout="dropdown"
          fromYear={1990}
          toYear={2035}
        />
      </PopoverContent>
    </Popover>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 ${className}`}
    />
  );
}
function SaveBar({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        changes
      </button>
    </div>
  );
}
function AddBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:hover:scale-100"
    >
      <Plus className="h-3.5 w-3.5" /> Add
    </button>
  );
}
function RowActions({
  onSave,
  onDelete,
  saving,
}: {
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
}) {
  return (
    <div className="mt-3 flex justify-end gap-2">
      <button
        onClick={onDelete}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:scale-[1.04] transition-transform"
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5" />
        )}{" "}
        Save
      </button>
    </div>
  );
}
function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
