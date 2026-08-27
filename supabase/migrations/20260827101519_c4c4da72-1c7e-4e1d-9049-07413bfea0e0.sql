CREATE TABLE public.student_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_availability TO authenticated;
GRANT ALL ON public.student_availability TO service_role;

ALTER TABLE public.student_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own availability"
ON public.student_availability FOR ALL TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()))
WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage student availability"
ON public.student_availability FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can view availability of their students"
ON public.student_availability FOR SELECT TO authenticated
USING (student_id IN (
  SELECT l.student_id FROM public.lessons l
  JOIN public.instructors i ON i.id = l.instructor_id
  WHERE i.user_id = auth.uid()
));

CREATE TRIGGER update_student_availability_updated_at
BEFORE UPDATE ON public.student_availability
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins can manage all lessons"
ON public.lessons FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can view their assigned students"
ON public.students FOR SELECT TO authenticated
USING (id IN (
  SELECT l.student_id FROM public.lessons l
  JOIN public.instructors i ON i.id = l.instructor_id
  WHERE i.user_id = auth.uid()
));

CREATE POLICY "Admins can view all instructors"
ON public.instructors FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));