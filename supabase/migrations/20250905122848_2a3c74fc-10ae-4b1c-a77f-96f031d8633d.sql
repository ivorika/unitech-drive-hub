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