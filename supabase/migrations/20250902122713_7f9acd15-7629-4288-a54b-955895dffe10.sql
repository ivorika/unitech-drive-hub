-- Add policy to allow admins to view all student data
CREATE POLICY "Admins can view all student data" 
ON public.students 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admins 
  WHERE admins.user_id = auth.uid()
));

-- Add policy to allow admins to update student data (for approval/rejection)
CREATE POLICY "Admins can update student data" 
ON public.students 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM admins 
  WHERE admins.user_id = auth.uid()
));