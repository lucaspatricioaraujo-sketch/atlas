-- 1. Custom Types
CREATE TYPE public.family_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- 2. Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Core Tables

-- PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'BRL',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- FAMILIES
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- FAMILY MEMBERS
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.family_role NOT NULL DEFAULT 'MEMBER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE (family_id, user_id)
);

-- 4. Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_families_updated_at
BEFORE UPDATE ON public.families
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_family_members_updated_at
BEFORE UPDATE ON public.family_members
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 5. Helper Functions for Security

-- has_family_access: Checks if the current user is a member of the given family
CREATE OR REPLACE FUNCTION public.has_family_access(check_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.family_members 
    WHERE family_id = check_family_id 
    AND user_id = auth.uid()
  );
$$;

-- is_family_admin: Checks if the current user is an OWNER or ADMIN of the given family
CREATE OR REPLACE FUNCTION public.is_family_admin(check_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.family_members 
    WHERE family_id = check_family_id 
    AND user_id = auth.uid()
    AND role IN ('OWNER', 'ADMIN')
  );
$$;

-- 6. Row Level Security (RLS) Policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view family members profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm1
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm2.user_id = profiles.id
  )
);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Families Policies
CREATE POLICY "Users can view families they belong to" 
ON public.families FOR SELECT 
USING (public.has_family_access(id));

CREATE POLICY "Admins can update families" 
ON public.families FOR UPDATE 
USING (public.is_family_admin(id));

CREATE POLICY "Users can create families" 
ON public.families FOR INSERT 
WITH CHECK (true); 

-- Family Members Policies
CREATE POLICY "Users can view members of their families" 
ON public.family_members FOR SELECT 
USING (public.has_family_access(family_id));

CREATE POLICY "Admins can insert members" 
ON public.family_members FOR INSERT 
WITH CHECK (public.is_family_admin(family_id) OR user_id = auth.uid()); 

CREATE POLICY "Admins can update members" 
ON public.family_members FOR UPDATE 
USING (public.is_family_admin(family_id));

CREATE POLICY "Admins or self can delete members" 
ON public.family_members FOR DELETE 
USING (public.is_family_admin(family_id) OR user_id = auth.uid());

-- 7. Automated Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Performance Indexes
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
