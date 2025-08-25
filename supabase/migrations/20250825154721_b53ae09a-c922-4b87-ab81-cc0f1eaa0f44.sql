
-- Create admin table
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create instructor table
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  license_expiry_date DATE,
  years_of_experience INTEGER,
  specializations TEXT[],
  hourly_rate DECIMAL(10,2),
  availability JSONB,
  status TEXT DEFAULT 'active',
  profile_picture_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins table
CREATE POLICY "Admins can view their own data" 
  ON public.admins 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert their own data" 
  ON public.admins 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update their own data" 
  ON public.admins 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to admins" 
  ON public.admins 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS Policies for instructors table
CREATE POLICY "Instructors can view their own data" 
  ON public.instructors 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can insert their own data" 
  ON public.instructors 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Instructors can update their own data" 
  ON public.instructors 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to instructors" 
  ON public.instructors 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Add triggers for updated_at columns
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instructors_updated_at
    BEFORE UPDATE ON public.instructors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
