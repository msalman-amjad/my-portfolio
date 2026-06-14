
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-promote the FIRST signup to admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Profile (singleton)
CREATE TABLE public.profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT 'Your Name',
  title TEXT NOT NULL DEFAULT 'Software Engineer',
  bio TEXT NOT NULL DEFAULT 'Tell the world about yourself.',
  roles TEXT[] NOT NULL DEFAULT ARRAY['Full-Stack Developer','UI Engineer','Open-Source Contributor'],
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  cv_url TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile TO anon, authenticated;
GRANT ALL ON public.profile TO authenticated;
GRANT ALL ON public.profile TO service_role;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Admin write profile" ON public.profile FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_profile_touch BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.profile DEFAULT VALUES;

-- Academics
CREATE TABLE public.academics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  year TEXT NOT NULL,
  achievements TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academics TO anon, authenticated;
GRANT ALL ON public.academics TO authenticated;
GRANT ALL ON public.academics TO service_role;
ALTER TABLE public.academics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read academics" ON public.academics FOR SELECT USING (true);
CREATE POLICY "Admin write academics" ON public.academics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  level INT NOT NULL DEFAULT 80 CHECK (level BETWEEN 0 AND 100),
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin write skills" ON public.skills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  technologies TEXT[] NOT NULL DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  document_url TEXT,
  video_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin write projects" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed example data
INSERT INTO public.academics (degree, institution, year, achievements, sort_order) VALUES
  ('B.Sc. Computer Science', 'University of Technology', '2019 - 2023', 'Graduated with honors. Built award-winning capstone project.', 1),
  ('High School Diploma', 'Lincoln High', '2015 - 2019', 'Valedictorian. National Math Olympiad finalist.', 2);

INSERT INTO public.skills (name, category, level, sort_order) VALUES
  ('React', 'Frontend', 95, 1),
  ('TypeScript', 'Frontend', 92, 2),
  ('Tailwind CSS', 'Frontend', 95, 3),
  ('Node.js', 'Backend', 88, 4),
  ('PostgreSQL', 'Backend', 85, 5),
  ('Supabase', 'Backend', 90, 6),
  ('Figma', 'Design', 80, 7),
  ('Docker', 'DevOps', 75, 8);

INSERT INTO public.projects (title, short_description, description, cover_image, images, technologies, live_url, github_url, sort_order) VALUES
  ('Aurora Dashboard', 'Realtime analytics dashboard with glassmorphism UI.', 'A modern analytics platform built with React 19, TanStack Query, and Supabase realtime. Features customizable widgets, dark mode, and instant collaboration.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200', ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200','https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'], ARRAY['React','TypeScript','Supabase','Tailwind'], 'https://example.com', 'https://github.com', 1),
  ('NovaCommerce', 'Headless e-commerce storefront for indie brands.', 'A high-performance storefront with edge rendering, Stripe payments, and AI-powered product recommendations.', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', ARRAY['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200'], ARRAY['Next.js','Stripe','PostgreSQL'], 'https://example.com', 'https://github.com', 2);
