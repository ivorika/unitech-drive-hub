-- Allow students to view active instructors for scheduling
CREATE POLICY "Students can view active instructors" 
ON public.instructors 
FOR SELECT 
USING (
  status = 'active' AND 
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM students 
    WHERE students.user_id = auth.uid()
  )
);

-- Create schedule_availability table for instructor time slots
CREATE TABLE public.schedule_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on schedule_availability
ALTER TABLE public.schedule_availability ENABLE ROW LEVEL SECURITY;

-- Students can view instructor availability for scheduling
CREATE POLICY "Students can view instructor availability" 
ON public.schedule_availability 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  is_available = true
);

-- Instructors can manage their own availability
CREATE POLICY "Instructors can manage their own availability" 
ON public.schedule_availability 
FOR ALL 
USING (
  instructor_id IN (
    SELECT id FROM instructors 
    WHERE user_id = auth.uid()
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_schedule_availability_updated_at
BEFORE UPDATE ON public.schedule_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample availability data for the existing instructor
INSERT INTO public.schedule_availability (instructor_id, day_of_week, start_time, end_time) VALUES
('495cbf5d-fce8-4fdc-928c-8ae1fd7c8c7e', 1, '09:00', '17:00'), -- Monday
('495cbf5d-fce8-4fdc-928c-8ae1fd7c8c7e', 2, '09:00', '17:00'), -- Tuesday
('495cbf5d-fce8-4fdc-928c-8ae1fd7c8c7e', 3, '09:00', '17:00'), -- Wednesday
('495cbf5d-fce8-4fdc-928c-8ae1fd7c8c7e', 4, '09:00', '17:00'), -- Thursday
('495cbf5d-fce8-4fdc-928c-8ae1fd7c8c7e', 5, '09:00', '17:00'); -- Friday