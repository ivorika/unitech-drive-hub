CREATE TABLE public.traffic_rule_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  quiz_score integer,
  quiz_total integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, module_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.traffic_rule_progress TO authenticated;
GRANT ALL ON public.traffic_rule_progress TO service_role;
ALTER TABLE public.traffic_rule_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own traffic progress" ON public.traffic_rule_progress
FOR ALL TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()))
WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Admins view all traffic progress" ON public.traffic_rule_progress
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "Instructors view their students traffic progress" ON public.traffic_rule_progress
FOR SELECT TO authenticated
USING (student_id IN (SELECT l.student_id FROM public.lessons l JOIN public.instructors i ON i.id = l.instructor_id WHERE i.user_id = auth.uid()));

CREATE TRIGGER update_traffic_rule_progress_updated_at
BEFORE UPDATE ON public.traffic_rule_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();