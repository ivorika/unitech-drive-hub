-- Create lessons table for booking and tracking lessons
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  lesson_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  lesson_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_feedback table for instructor evaluations
CREATE TABLE public.lesson_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  performance_rating TEXT NOT NULL CHECK (performance_rating IN ('excellent', 'good', 'needs_improvement')),
  skills_practiced TEXT[],
  areas_of_improvement TEXT,
  instructor_comments TEXT NOT NULL,
  student_progress TEXT,
  ready_for_road_test BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table for system-wide communications
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'students', 'instructors', 'admins')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table for tracking financial transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('registration', 'lesson_package', 'individual_lesson')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'e_transfer', 'check')),
  transaction_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule_availability table for instructor availability
CREATE TABLE public.schedule_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(instructor_id, day_of_week, start_time)
);

-- Enable RLS on all tables
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons table
CREATE POLICY "Students can view their own lessons" 
  ON public.lessons 
  FOR SELECT 
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can view their assigned lessons" 
  ON public.lessons 
  FOR SELECT 
  USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert their own lessons" 
  ON public.lessons 
  FOR INSERT 
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can update their assigned lessons" 
  ON public.lessons 
  FOR UPDATE 
  USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to lessons" 
  ON public.lessons 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS Policies for lesson_feedback table
CREATE POLICY "Students can view their own feedback" 
  ON public.lesson_feedback 
  FOR SELECT 
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can view and manage their feedback" 
  ON public.lesson_feedback 
  FOR ALL 
  USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to lesson_feedback" 
  ON public.lesson_feedback 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS Policies for announcements table
CREATE POLICY "All authenticated users can view relevant announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      audience = 'all' OR
      (audience = 'students' AND EXISTS (SELECT 1 FROM public.students WHERE user_id = auth.uid())) OR
      (audience = 'instructors' AND EXISTS (SELECT 1 FROM public.instructors WHERE user_id = auth.uid())) OR
      (audience = 'admins' AND EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Admins can manage announcements" 
  ON public.announcements 
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to announcements" 
  ON public.announcements 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS Policies for payments table
CREATE POLICY "Students can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to payments" 
  ON public.payments 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS Policies for schedule_availability table
CREATE POLICY "Instructors can manage their own availability" 
  ON public.schedule_availability 
  FOR ALL 
  USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Students can view instructor availability" 
  ON public.schedule_availability 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND is_available = TRUE);

CREATE POLICY "Service role full access to schedule_availability" 
  ON public.schedule_availability 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Add triggers for updated_at columns
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_feedback_updated_at
    BEFORE UPDATE ON public.lesson_feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_availability_updated_at
    BEFORE UPDATE ON public.schedule_availability
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX idx_lessons_instructor_id ON public.lessons(instructor_id);
CREATE INDEX idx_lessons_date ON public.lessons(lesson_date);
CREATE INDEX idx_lesson_feedback_lesson_id ON public.lesson_feedback(lesson_id);
CREATE INDEX idx_payments_student_id ON public.payments(student_id);
CREATE INDEX idx_schedule_availability_instructor_id ON public.schedule_availability(instructor_id);